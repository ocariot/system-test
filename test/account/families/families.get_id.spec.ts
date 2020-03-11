import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { Family } from '../../../src/account-service/model/family'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: families', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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

    const defaultChild: Child = new ChildMock()

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    let defaultFamilyToken: string

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
            defaultFamily.institution = defaultInstitution
            defaultFamily.children = new Array<Child>(defaultChild)

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            if (defaultFamily.username && defaultFamily.password) {
                defaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            const resultGetDefaultFamily = await acc.getFamilyById(accessTokenAdmin, defaultFamily.id)
            defaultFamily.last_login = resultGetDefaultFamily.last_login

        } catch (err) {
            console.log('Failure on Before from families.get_id test: ', err)
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

    describe('GET /families/:family_id', () => {

        context('when get a unique family successfully', () => {

            it('families.get_id001: should return status code 200 and the family obtained by admin user', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].id).to.eql(defaultChild.id)
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.last_login).to.eql(defaultFamily.last_login)
                    })
            })

            it('families.get_id002: should return status code 200 and the family obtained by herself', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].id).to.eql(defaultChild.id)
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.last_login).to.eql(defaultFamily.last_login)
                    })
            })

            describe('when delete the child who was associated with the family', () => {
                before(async () => {
                    try {
                        await acc.deleteUser(accessTokenAdmin, defaultChild.id)
                    } catch (err) {
                        console.log('Failure in families.get_id test: ', err)
                    }
                })
                it('families.get_id003: should return status code 200 and the family without none child associated with her', () => {

                    return request(URI)
                        .get(`/families/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.id).to.eql(defaultFamily.id)
                            expect(res.body.username).to.eql(defaultFamily.username)
                            expect(res.body.institution_id).to.eql(defaultInstitution.id)
                            expect(res.body.children.length).to.be.eql(0)
                            expect(res.body.last_login).to.eql(defaultFamily.last_login)
                        })
                })
            })

        }) // get a unique family successfully

        describe('when the family is not found', () => {
            it('families.get_id004: should return status code 404 and info message from family not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the family

                return request(URI)
                    .get(`/families/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })
        })

        describe('when the family_id is invalid', () => {
            it('families.get_id005: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of the family

                return request(URI)
                    .get(`/families/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })


        context('when the user does not have permission to get a family', () => {

            it('families.get_id006: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_id007: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_id008: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_id009: should return status code 403 and info message from insufficient permissions for another family user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_id010: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.get_id011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}`)
                    .send(defaultFamily.toJSON())
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
