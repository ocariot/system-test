import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Application } from '../../../src/account-service/model/application';

describe('Routes: applications', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let defaultApplicationToken: string

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

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'Default application'
    defaultApplication.password = 'Default pass'
    defaultApplication.application_name = 'APP1'

    const anotherApplication: Application = new Application()
    anotherApplication.username = 'Another application'
    anotherApplication.password = 'Another pass'
    anotherApplication.application_name = 'APP02'

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

            defaultApplication.institution = defaultInstitution

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            if (defaultApplication.username && defaultApplication.password) {
                defaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

        } catch (err) {
            console.log('Failure on Before from applications.patch test: ', err)
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

    describe('PATCH /applications/:application_id', () => {

        context('when the update was successful by admin user', () => {

            it('applications.patch001: should return status code 200 and updated username, application_name and institution of the application', () => {

                defaultApplication.username = 'Default username updated'
                defaultApplication.application_name = 'APP2 updated'
                defaultApplication.institution = anotherInstitution


                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send(
                        {
                            username: defaultApplication.username,
                            application_name: defaultApplication.application_name,
                            institution_id: anotherInstitution.id
                        }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        expect(res.body.institution_id).to.eql(anotherInstitution.id)
                        if(defaultApplication.last_login){
                            expect(res.body.last_login).to.eql(defaultApplication.last_login)
                        }
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveApplication(accessTokenAdmin, anotherApplication)
                } catch (err) {
                    console.log('Failure on Before from applications.patch test: ', err)
                }
            })
            it('applications.patch002: should return status code 409 and message info about application is already registered', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send(
                        { username: anotherApplication.username }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.APPLICATION.ERROR_409_DUPLICATE)
                    })

            })
        })

        context('when a validation error occurs', () => {

            it('applications.patch003: should return status code 400 and message info about invalid parameter, because the institution provided does not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the institution

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send(
                        { institution_id: NON_EXISTENT_ID }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })

            })

            it('applications.patch004: should return status code 400 and message info about invalid parameter, because the institution_id provided is invalid', () => {
                const INVALID_ID = '123' // invalid id of the institution

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send(
                        { institution_id: INVALID_ID }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('applications.patch005: should return status code 400 and message info about invalid parameter, because the application_id provided is invalid', () => {
                const INVALID_ID = '123' // invalid id of the application

                return request(URI)
                    .patch(`/applications/${INVALID_ID}`)
                    .send(
                        { username: 'new cool username' }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) // validation error occurs

        describe('when the applications is not found', () => {
            it('applications.patch006: should return status code 404 and message info from application not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the application

                return request(URI)
                    .patch(`/applications/${NON_EXISTENT_ID}`)
                    .send(
                        { username: 'new cool username' }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.APPLICATION.ERROR_404_APPLICATION_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission to update the application', () => {

            it('applications.patch007: should return status code 403 and info message from insufficient permissions for own application user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(defaultApplicationToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.patch008: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.patch009: should return status code 403 and info message from insufficient permissions for healh professional user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.patch010: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.patch011: should return status code 403 and info message from insufficient permissions for another application user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.patch012: should return status code 403 and info message from insufficient permissions for another child user', () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('applications.patch013: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/applications/${defaultApplication.id}`)
                    .send({ username: 'new cool username' })
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
