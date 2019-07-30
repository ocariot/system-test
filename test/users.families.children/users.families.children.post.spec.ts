import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { Family } from '../../src/account-service/model/family'

describe('Routes: users.families.children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new Child
    defaultChild.username = 'default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 14

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    const con = new AccountDb()

    before(async () => {
        try {
            await con.connect(0, 1000)

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await con.removeCollections()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution
            anotherChild.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

        } catch (err) {
            console.log('Failure on Before from users.families.children.post test: ', err)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
            await con.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /users/families/:family_id/children/:child_id', () => {
        afterEach(async () => {
            try {
                await acc.dissociateChildWithFamily(accessTokenAdmin, defaultFamily.id, defaultChild.id)
            } catch (err) {
                console.log('Failure in users.families.children.post test: ', err)
            }
        })

        context('when the admin associating a child with a family successfully', () => {
            after(async () => {
                try {
                    await acc.dissociateChildWithFamily(accessTokenAdmin, defaultFamily.id, anotherChild.id)
                } catch (err) {
                    console.log('Failure in users.families.children.post test: ', err)
                }
            })

            it('families.children.post001: should return status code 200 and the family with the child associated', () => {

                defaultFamily.children = new Array<Child>(defaultChild, anotherChild)

                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultFamily.id)
                        expect(res.body).to.have.property('username', defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id', defaultInstitution.id)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children[0]).to.have.property('id', defaultChild.id)
                        expect(res.body.children[0]).to.have.property('username', defaultChild.username)
                        expect(res.body.children[0]).to.have.property('gender', defaultChild.gender)
                        expect(res.body.children[0]).to.have.property('age', defaultChild.age)
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id', defaultInstitution.id)
                        expect(res.body.children[1]).to.have.property('id', anotherChild.id)
                        expect(res.body.children[1]).to.have.property('username', anotherChild.username)
                        expect(res.body.children[1]).to.have.property('gender', anotherChild.gender)
                        expect(res.body.children[1]).to.have.property('age', anotherChild.age)
                        expect(res.body.children[1]).to.have.property('institution')
                        expect(res.body.children[1].institution).to.have.property('id', defaultInstitution.id)

                    })
            })
        })

        describe('when associating the child again in the same family', () => {
            before(async () => {
                try {
                    defaultFamily.children = new Array<Child>(defaultChild)
                    
                    await acc.associateChildWithFamily(accessTokenAdmin, defaultFamily.id, defaultChild.id)
                } catch (err) {
                    console.log('Failure in users.families.children.post test: ', err)
                }
            })
            it('families.children.post002: should return status code 200 and the family with the child associated', () => {

                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultFamily.id)
                        expect(res.body).to.have.property('username', defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id', defaultInstitution.id)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children[0]).to.have.property('id', defaultChild.id)
                        expect(res.body.children[0]).to.have.property('username', defaultChild.username)
                        expect(res.body.children[0]).to.have.property('gender', defaultChild.gender)
                        expect(res.body.children[0]).to.have.property('age', defaultChild.age)
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id', defaultInstitution.id)
                    })
            })
        })        

        describe('when a validation error occurs', () => {

            it('families.children.post003: should return status code 404 and info message about family not found', () => {

                return request(URI)
                    .post(`/users/families/${acc.NON_EXISTENT_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })

            it('families.children.post004: should return status code 400 and info message from association failure, because the child does not have a record', () => {

                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.FAMILY.ERROR_400_ASSOCIATION_FAILURE)
                    })
            })

            it('families.children.post005: should return status code 400 and info message from invalid child ID', () => {

                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.children.post006: should return status code 400 and info message from invalid family ID', () => {

                return request(URI)
                    .post(`/users/families/${acc.INVALID_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        }) //validation error occurs 


        context('when the user does not have permission to associate a child with a family', () => {

            it('families.children.post007: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post008: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post009: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post010: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post011: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.children.post012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/users/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
