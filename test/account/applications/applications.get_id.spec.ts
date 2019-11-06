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

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'Default application'
    defaultApplication.password = 'Default pass'
    defaultApplication.application_name = 'APP1'

    let defaultApplicationToken: string

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

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id
            defaultApplication.institution = defaultInstitution

            const resultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultApplication.id

            if (defaultApplication.username && defaultApplication.password){
                defaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            const resultGetApplication = await acc.getApplicationById(accessTokenAdmin, defaultApplication.id)
            defaultApplication.last_login = resultGetApplication.last_login

        } catch (err) {
            console.log('Failure on Before from applications.get_id test: ', err)
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

    describe('GET /application/:application_id', () => {

        context('when get a unique application successfully', () => {

            it('applications.get_id001: should return status code 200 and a application obtained by admin user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultApplication.last_login) {
                            expect(res.body.last_login).to.eql(defaultApplication.last_login)
                        }
                    })
            })

            it('applications.get_id002: should return status code 200 and a application obtained by own application', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultApplicationToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultApplication.last_login) {
                            expect(res.body.last_login).to.eql(defaultApplication.last_login)
                        }
                    })
            })

        }) // get a unique application successfully

        describe('Last Login Field Verification', () => {
            let lastDefaultApplicationLogin: Date

            before(async () => {
                try {
                    await acc.auth(defaultApplication.username!, defaultApplication.password!)

                    const resultGetApplication = await acc.getApplicationById(accessTokenAdmin, defaultApplication.id)
                    defaultApplication.last_login = resultGetApplication.last_login

                    lastDefaultApplicationLogin = new Date(defaultApplication.last_login!)

                } catch (err) {
                    console.log('Failure on Before from field  verification: ', err)
                }
            })

            it('applications.get_id003: should return status code 200 and the application with last_login updated', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultApplication.last_login)
                            expect(res.body.last_login).to.eql(lastDefaultApplicationLogin.toISOString())
                    })
            })
        })

        describe('when the application is not found', () => {
            it('applications.get_id004: should return status code 404 and info message about application not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the application

                return request(URI)
                    .get(`/applications/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultApplicationToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.APPLICATION.ERROR_404_APPLICATION_NOT_FOUND)
                    })
            })
        })

        describe('when the application_id provided is invalid', () => {
            it('applications.get_id005: should return status code 400 and info message from invalid application_id', () => {
                const INVALID_ID = '123' // invalid id of the application

                return request(URI)
                    .get(`/applications/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultApplicationToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.APPLICATION.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique application', () => {

            it('applications.get_id006: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_id007: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_id008: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_id009: should return status code 403 and info message from insufficient permissions for another application user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_id010: should return status code 403 and info message from insufficient permissions for another child user', () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('applications.get_id011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/applications/${defaultApplication.id}`)
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
