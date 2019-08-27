import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { trck } from '../../utils/tracking.utils'
import { trackingDB } from '../../../src/tracking-service/database/tracking.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Environment } from '../../../src/tracking-service/model/environment'
import { EnvironmentMock } from '../../mocks/tracking-service/environment.mock'
import { Location } from '../../../src/tracking-service/model/location'
import { Measurement } from '../../../src/tracking-service/model/measurement'

describe('Routes: environments', () => {

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

    const defaultEnvironment: Environment = new EnvironmentMock()

    const locationWithoutRoom: Location = new Location()
    locationWithoutRoom.local = 'indoor'
    locationWithoutRoom.latitude = 0
    locationWithoutRoom.longitude = 0

    const locationWithoutLocal: Location = new Location()
    locationWithoutLocal.room = 'room1'
    locationWithoutLocal.latitude = 0
    locationWithoutLocal.longitude = 0

    const measurementWithoutType: Measurement = new Measurement()
    measurementWithoutType.value = 35.6
    measurementWithoutType.unit = 'ºC'

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

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

            defaultEnvironment.institution_id = resultInstitution.id

        } catch (err) {
            console.log('Failure on Before from environments.post test: ', err)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await trackingDB.removeCollections()
            await accountDB.dispose()
            await trackingDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /environments', () => {

        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in environments test: ', err)
            }
        })

        describe('when the application posting a new environment measurement successfully', () => {

            it('environments.post001: should return status code 201 and the saved environment measurement', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('institution_id', defaultEnvironment.institution_id)
                        expect(res.body).to.have.deep.property('location', defaultEnvironment.location)
                        expect(res.body).to.have.deep.property('measurements', defaultEnvironment.measurements)
                        expect(res.body).to.have.deep.property('climatized', defaultEnvironment.climatized)
                        expect(res.body).to.have.deep.property('timestamp', defaultEnvironment.timestamp.toISOString())                        
                    })
            })

            it('environments.post002: should return status code 201 and the saved environment measurement without climatized parameter', () => {

                const environment: Environment = new EnvironmentMock()
                environment.institution_id = defaultInstitution.id
                delete environment.climatized

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('institution_id', environment.institution_id)
                        expect(res.body).to.have.deep.property('location', environment.location)
                        expect(res.body).to.have.deep.property('measurements', environment.measurements)
                        expect(res.body).to.have.deep.property('climatized', false) // By default is created the climatized parameter with value false 
                        expect(res.body).to.have.deep.property('timestamp', environment.timestamp.toISOString())                     
                    })
            })

        })

        describe('when a validation error occurs', () => {
            let environment: Environment

            beforeEach(() => {
                environment = new EnvironmentMock()
                environment.institution_id = defaultInstitution.id
            })
            afterEach(async () => {
                try {
                    await trackingDB.deleteEnviroments()
                } catch (err) {
                    console.log('Failure in environments test: ', err)
                }
            })            

            it('environments.post003: should return status code 400 and info message from missing parameters, because institution_id is not provided', () => {

                delete environment.institution_id

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_INSTITUTION_ID_IS_REQUIRED)
                    })
            })

            it('environments.post004: should return status code 400 and info message from missing parameters, because location is not provided', () => {

                delete environment.location

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_LOCATION_IS_REQUIRED)
                    })
            })

            it('environments.post005: should return status code 400 and info message from missing parameters, because measurements is not provided', () => {

                delete environment.measurements

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_MEASUREMENTS_IS_REQUIRED)
                    })
            })

            it('environments.post006: should return status code 400 and info message from missing parameters, because timestamp is not provided', () => {

                delete environment.timestamp

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_TIMESTAMP_IS_REQUIRED)
                    })
            })

            it('environments.post007: should return status code 400 and info message from missing parameters, because institution_id and measurements are not provided', () => {

                delete environment.institution_id
                delete environment.measurements

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_INSTITUTION_ID_AND_MEASUREMENTS_IS_REQUIRED)
                    })
            })

            it('environments.post008: should return status code 400 and info message from missing parameters, because location and timestamp are not provided', () => {

                delete environment.location
                delete environment.timestamp

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_TIMESTAMP_AND_LOCATION_IS_REQUIRED)
                    })
            })

            it('environments.post009: should return status code 400 and info message from missing parameters, because all required parameters are not provided', () => {

                delete environment.institution_id
                delete environment.location
                delete environment.measurements
                delete environment.timestamp

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_ALL_PARAMETERS_IS_REQUIRED)
                    })
            })

            it('environments.post010: should return status code 400 and info message from invalid parameters, because institution does not exist', () => {

                environment.institution_id = acc.NON_EXISTENT_ID

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })

            it('environments.post011: should return status code 400 and info message from invalid parameters, because institution_id is invalid', () => {

                environment.institution_id = acc.INVALID_ID

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('environments.post012: should return status code 400 and info message from invalid location, because room is required', () => {

                environment.location = locationWithoutRoom

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_LOCATION_ROOM_IS_REQUIRED)
                    })
            })

            it('environments.post013: should return status code 400 and info message from invalid location, because local is required', () => {

                environment.location = locationWithoutLocal

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_LOCATION_LOCAL_IS_REQUIRED)
                    })
            })

            it('environments.post014: should return status code 400 and info message from invalid measurements, because type is required', () => {

                environment.measurements = new Array<Measurement>(measurementWithoutType)

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_MEASUREMENT_TYPE_IS_REQUIRED)
                    })
            })

            it('environments.post015: should return status code 400 and info message from invalid timestamp, because month is invalid', () => {

                environment.timestamp = new Date('2018-13-19T14:40:00Z')

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_400_INVALID_TIMESTAMP)
                    })
            })

        }) // validation error occurs

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await trck.saveEnvironment(accessTokenApplication, defaultEnvironment)
                } catch (err) {
                    console.log('Failure in environments.post test: ', err)
                }
            })
            it('environments.post016: should return status code 409 and info message about environment is already registered', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENT.ERROR_409_ENVIRONMENT_MEASUREMENT_IS_ALREADY_REGISTERED)
                    })
            })
        })

        context('when the user does not have permission to register the environment measurement', () => {

            it('environments.post017: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('environments.post018: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('environments.post019: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('environments.post020: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('environments.post021: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('environments.post022: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
