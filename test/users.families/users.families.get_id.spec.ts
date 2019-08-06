import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { Family } from '../../src/account-service/model/family'

describe('Routes: users.families', () => {

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

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    let defaultFamilyToken: string

    before(async () => {
        try {
            await accountDB.connect(0, 1000)

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
            defaultFamily.institution = defaultInstitution
            defaultFamily.children = new Array<Child>(defaultChild)

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            if (defaultFamily.username && defaultFamily.password)
                defaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)

        } catch (err) {
            console.log('Failure on Before from users.families.get_id test: ', err)
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

    describe('GET /users/families/:family_id', () => {

        context('when get a unique family successfully', () => {

            it('families.get_id001: should return status code 200 and the family obtained by admin user', () => {

                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0]).to.have.property('username', defaultChild.username)
                        expect(res.body.children[0]).to.have.property('gender', defaultChild.gender)
                        expect(res.body.children[0]).to.have.property('age', defaultChild.age)
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution).to.have.property('type', defaultInstitution.type)
                        expect(res.body.children[0].institution).to.have.property('name', defaultInstitution.name)
                        expect(res.body.children[0].institution).to.have.property('address', defaultInstitution.address)
                        expect(res.body.children[0].institution).to.have.property('latitude', defaultInstitution.latitude)
                        expect(res.body.children[0].institution).to.have.property('longitude', defaultInstitution.longitude)
                    })
            })

            it('families.get_id002: should return status code 200 and the family obtained by herself', () => {

                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0]).to.not.have.property('username')
                        expect(res.body.children[0]).to.not.have.property('gender')
                        expect(res.body.children[0]).to.not.have.property('age')
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution).to.have.property('type', defaultInstitution.type)
                        expect(res.body.children[0].institution).to.have.property('name', defaultInstitution.name)
                        expect(res.body.children[0].institution).to.have.property('address', defaultInstitution.address)
                        expect(res.body.children[0].institution).to.have.property('latitude', defaultInstitution.latitude)
                        expect(res.body.children[0].institution).to.have.property('longitude', defaultInstitution.longitude)
                    })
            })

            it('families.get_id003: should return status code 200 and only the ID, username and institution of the family', () => {

                const fieldOne = 'username'
                const fieldTwo = 'institution'

                return request(URI)
                    .get(`/users/families/${defaultFamily.id}?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body).to.not.have.property('children')
                        // expect(res.body.children[0]).to.have.property('id')
                        // expect(res.body.children[0]).to.have.property('institution')
                        // expect(res.body.children[0]).to.not.have.property('username')
                        // expect(res.body.children[0]).to.not.have.property('gender')
                        // expect(res.body.children[0]).to.not.have.property('age')
                        // expect(res.body.children[0].institution).to.have.property('id')
                        // expect(res.body.children[0].institution).to.have.property('type', defaultInstitution.type)
                        // expect(res.body.children[0].institution).to.have.property('name', defaultInstitution.name)
                        // expect(res.body.children[0].institution).to.have.property('address', defaultInstitution.address)
                        // expect(res.body.children[0].institution).to.have.property('latitude', defaultInstitution.latitude)
                        // expect(res.body.children[0].institution).to.have.property('longitude', defaultInstitution.longitude)
                    })
            })

            describe('when delete the child who was associated with the family', () => {
                before(async () => {
                    try {
                        await acc.deleteUser(accessTokenAdmin, defaultChild.id)
                    } catch (err) {
                        console.log('Failure in users.families.get_id test: ', err)
                    }
                })
                it('families.get_id004: should return status code 200 and the family without none child associated with her', () => {

                    return request(URI)
                        .get(`/users/families/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.username).to.eql(defaultFamily.username)
                            expect(res.body.institution).to.have.property('id')
                            expect(res.body.institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                            expect(res.body).to.have.property('children')
                            expect(res.body.children.length).to.be.eql(0)
                        })
                })
            })

        }) // get a unique family successfully

        describe('when the family is not found', () => {
            it('families.get_id004: should return status code 404 and info message from family not found', () => {

                return request(URI)
                    .get(`/users/families/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })
        })

        describe('when the family_id is invalid', () => {
            it('families.get_id005: should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .get(`/users/families/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })


        context('when the user does not have permission to get a family', () => {

            it('families.post006: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.post007: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.post008: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.post009: should return status code 403 and info message from insufficient permissions for another family user', () => {
                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.post010: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.post011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/users/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
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
