import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'

describe('Routes: healthprofessionals', () => {

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

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'Default healthprofessional'
    defaultHealthProfessional.password = 'Default pass'

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

            defaultHealthProfessional.institution = defaultInstitution

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.post test: ', err)
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

    describe('POST /healthprofessionals', () => {
        afterEach(async () => {
            try {
                await accountDB.deleteAllHealthProfessionals()
            } catch (err) {
                console.log('Failure in healthprofessionals.post test: ', err)
            }
        })
        context('when the admin posting a new health professionals user', () => {

            it('healthprofessionals.post001: should return status code 201 and the saved health professional', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .send(defaultHealthProfessional.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                    })
            })
        })

        //  TESTES - RESTRIÇÕES NOS CAMPOS USERNAME/PASSWORD ... (CRIAR COM ESPAÇO ?)
        // context('when the username is a blank space', () => {
        //     it('should return status code ? and message info about ...', () => {

        //         return request(URI)
        //             .post('/healthprofessionals')
        //             .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        //             .set('Content-Type', 'application/json')
        //             .send(body)
        //             .expect(409)
        //     })
        // })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
                } catch (err) {
                    console.log('Failure in healthprofessionals.post test: ', err)
                }
            })
            it('healthprofessionals.post002: should return status code 409 and message info about health professional is already registered', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .send(defaultHealthProfessional.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('healthprofessionals.post003: should return status code 400 and message info about missing parameters, because username was not provided', () => {

                const body = {
                    password: defaultHealthProfessional.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_400_USERNAME_NOT_PROVIDED)
                    })
            })

            it('healthprofessionals.post004: should return status code 400 and message info about missing parameters, because password was not provided', () => {

                const body = {
                    username: defaultHealthProfessional.username,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_400_PASSWORD_NOT_PROVIDED)
                    })
            })

            it('healthprofessionals.post005: should return status code 400 and message info about missing parameters, because institution was not provided', () => {

                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password
                }

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_400_INSTITUTION_NOT_PROVIDED)
                    })
            })

            it('healthprofessionals.post006: should return status code 400 and message from institution not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the institution

                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: NON_EXISTENT_ID
                }

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })

            it('healthprofessionals.post007: should return status code 400 and message for invalid institution id', () => {
                const INVALID_ID = '123' // invalid id of the institution

                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: INVALID_ID
                }

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) // validantion error occurs

        context('when the user does not have permission to register the health professional', () => {

            it('healthprofessionals.post008: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.post009: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.post010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.post011: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.post012: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.post013: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/healthprofessionals')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultHealthProfessional.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
