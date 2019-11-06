import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Child } from '../../../src/account-service/model/child'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let defaultChildToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'
    anotherInstitution.address = 'another address'
    anotherInstitution.latitude = -7.2100766
    anotherInstitution.longitude = -35.9175756

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 8

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

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id

            defaultChild.institution = defaultInstitution
            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

            if (defaultChild.username && defaultChild.password) {
                defaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            const resultGetChild = await acc.getChildById(accessTokenAdmin, defaultChild.id)
            defaultChild.last_login = resultGetChild.last_login

        } catch (err) {
            console.log('Failure on Before from children.patch test: ', err)
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

    describe('PATCH /children/:child_id', () => {

        context('when the update was successful by admin user', () => {

            it('children.patch001: should return status code 200 and updated username, institution, age and gender of the child', () => {

                defaultChild.username = 'Default username updated'
                defaultChild.age = 13
                defaultChild.institution = anotherInstitution
                defaultChild.gender = 'female'

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send(
                        {
                            username: 'Default username updated',
                            gender: 'female',
                            age: 13,
                            institution_id: anotherInstitution.id
                        }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(anotherInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })
        })

        describe('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherChild.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, anotherChild)
                } catch (err) {
                    console.log('Failure on children.patch test: ', err)
                }
            })
            it('children.patch002: should return status code 409 and info message about child is already registered', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ username: 'another child' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('children.patch003: should return status code 400 and message about invalid gender', () => {
                const INVALID_GENDER = 123 // invalid gender because gender just can be (male, female)

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ gender: INVALID_GENDER })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_GENDER)
                    })
            })

            it('children.patch004: should return status code 400 and message about negative age', () => {
                const INVALID_AGE = -11 // invalid age because value is negative

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: INVALID_AGE })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_AGE)
                    })
            })

            it('children.patch005: should return status code 400 and message for institution not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // institution id does not exist

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ institution_id: NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })

            it('children.patch006: should return status code 400 and info message from invalid id', () => {
                const INVALID_ID = '123' // invalid id of institution

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ institution_id : INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_INSTITUTION_ID)
                    })
            })

            it('children.patch007: should return status code 400 and info message from null age', () => {
                const NULL_AGE = null // invalid age because value is null

                return request(URI)
                .patch(`/children/${defaultChild.id}`)
                .send({ age: NULL_AGE })
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(err => {
                    expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_AGE_IS_NOT_A_NUMBER)
                })
            })

            it('children.patch008: should return status code 400 and info message from null username', () => {
                const NULL_USERNAME = null // invalid username because value is null

                return request(URI)
                .patch(`/children/${defaultChild.id}`)
                .send({ username: NULL_USERNAME })
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(err => {
                    expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_USERNAME)
                })
            })

        }) // validation error occurs

        describe('when child is not found or past id is invalid', () => {   

            it('children.patch009: should return status code 404 and info message from child not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // child id does not exist

                return request(URI)
                    .patch(`/children/${NON_EXISTENT_ID}`)
                    .send({ age: 10 })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_404_CHILD_NOT_FOUND)
                    })
            })

            it('children.patch010: should return status code 404 and info message from child id is invalid', () => {
                const INVALID_ID = '123' // invalid child id

                return request(URI)
                    .patch(`/children/${INVALID_ID}`)
                    .send({ age: 10 })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_CHILD_ID)
                    })
            })
        })

        context('when the user does not have permission to update the child', () => {

            it('children.patch011: should return status code 403 and info message from insufficient permissions for own child user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(defaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch012: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch013: should return status code 403 and info message from insufficient permissions for healh professional user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch014: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch015: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch016: should return status code 403 and info message from insufficient permissions for another child user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.patch017: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}`)
                    .send({ age: 1 })
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
