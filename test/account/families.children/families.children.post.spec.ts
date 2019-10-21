import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { Family } from '../../../src/account-service/model/family'

describe('Routes: families.children', () => {

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

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await accountDB.removeCollections()

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
            console.log('Failure on Before from families.children.post test: ', err)
        }
    })

    after(async () => {
        try {
            await accountDB.removeCollections()
            await accountDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /families/:family_id/children/:child_id', () => {
        afterEach(async () => {
            try {
                await acc.dissociateChildWithFamily(accessTokenAdmin, defaultFamily.id, defaultChild.id)
            } catch (err) {
                console.log('Failure in families.children.post test: ', err)
            }
        })

        context('when the admin associating a child with a family successfully', () => {
            after(async () => {
                try {
                    await acc.dissociateChildWithFamily(accessTokenAdmin, defaultFamily.id, anotherChild.id)
                } catch (err) {
                    console.log('Failure in families.children.post test: ', err)
                }
            })

            it('families.children.post001: should return status code 200 and the family with the child associated', () => {

                defaultFamily.children = new Array<Child>(defaultChild, anotherChild)

                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].id).to.eql(defaultChild.id)
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[1].id).to.eql(anotherChild.id)
                        expect(res.body.children[1].username).to.eql(anotherChild.username)
                        expect(res.body.children[1].gender).to.eql(anotherChild.gender)
                        expect(res.body.children[1].age).to.eql(anotherChild.age)
                        expect(res.body.children[1].institution_id).to.eql(defaultInstitution.id)
                    })
            })
        })

        describe('when associating the child again in the same family', () => {
            before(async () => {
                try {
                    defaultFamily.children = new Array<Child>(defaultChild)
                    
                    await acc.associateChildWithFamily(accessTokenAdmin, defaultFamily.id, defaultChild.id)
                } catch (err) {
                    console.log('Failure in families.children.post test: ', err)
                }
            })
            it('families.children.post002: should return status code 200 and the family with the child associated', () => {

                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].id).to.eql(defaultChild.id)
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                    })
            })
        })        

        describe('when a validation error occurs', () => {

            it('families.children.post003: should return status code 404 and info message about family not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the family

                return request(URI)
                    .post(`/families/${NON_EXISTENT_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })

            it('families.children.post004: should return status code 400 and info message from association failure, because the child does not have a record', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child

                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_ASSOCIATION_FAILURE)
                    })
            })

            it('families.children.post005: should return status code 400 and info message from invalid child ID', () => {
                const INVALID_ID = '123' // invalid id of the child

                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID_CHILD)
                    })
            })

            it('families.children.post006: should return status code 400 and info message from invalid family ID', () => {
                const INVALID_ID = '123' // invalid id of the family

                return request(URI)
                    .post(`/families/${INVALID_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        }) //validation error occurs 


        context('when the user does not have permission to associate a child with a family', () => {

            it('families.children.post007: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post008: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post009: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post010: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.post011: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.children.post012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
