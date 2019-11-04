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
    const INVALID_CLIMATIZED = 'Tru3'
    let incorrectEnvironmentJSON: any

    // The location is invalid (local parameter is a number)
    let incorrectEnvironment1: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.location.local = 123
    incorrectEnvironment1 = incorrectEnvironment1.fromJSON(incorrectEnvironmentJSON)

    // The measurements is invalid (value parameter is a text)
    let incorrectEnvironment2: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.measurements[0].value = 'asText'
    incorrectEnvironment2 = incorrectEnvironment2.fromJSON(incorrectEnvironmentJSON)

    // The climatized is invalid
    let incorrectEnvironment3: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.climatized = INVALID_CLIMATIZED
    incorrectEnvironment3 = incorrectEnvironment3.fromJSON(incorrectEnvironmentJSON)

    // The measurements is invalid (type parameter is a number)
    let incorrectEnvironment4: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.measurements[0].type = 1000000
    incorrectEnvironment4 = incorrectEnvironment4.fromJSON(incorrectEnvironmentJSON)

    // The location is invalid (room parameter is a number)
    let incorrectEnvironment5: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.location.room = 1000000
    incorrectEnvironment5 = incorrectEnvironment5.fromJSON(incorrectEnvironmentJSON)

    // The measurements is invalid (unit parameter is a number)
    let incorrectEnvironment6: Environment = new EnvironmentMock()
    incorrectEnvironmentJSON = getIncorrectEnvironmentJSON()
    incorrectEnvironmentJSON.measurements[0].unit = 1000000
    incorrectEnvironment6 = incorrectEnvironment6.fromJSON(incorrectEnvironmentJSON)


    const locationWithoutRoom: Location = new Location()
    locationWithoutRoom.local = 'indoor'
    locationWithoutRoom.latitude = '0'
    locationWithoutRoom.longitude = '0'

    const locationWithoutLocal: Location = new Location()
    locationWithoutLocal.room = 'room1'
    locationWithoutLocal.latitude = '0'
    locationWithoutLocal.longitude = '0'

    const measurementWithoutType: Measurement = new Measurement()
    measurementWithoutType.value = 35.6
    measurementWithoutType.unit = 'ºC'

    const AMOUNT_OF_CORRECT_ENVIRONMENTS = 3
    const correctEnvironments: Array<Environment> = new Array<EnvironmentMock>()
    const mixedEnvironments: Array<Environment> = new Array<EnvironmentMock>()
    const wrongEnvironments: Array<Environment> = new Array<EnvironmentMock>()

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

            // Populates the environments arrays
            for (let i = 0; i < AMOUNT_OF_CORRECT_ENVIRONMENTS; i++) {
                const newEnvironment = new EnvironmentMock()
                newEnvironment.institution_id = defaultInstitution.id
                correctEnvironments[i] = newEnvironment
                await sleep(20) // function sleep for 20 miliseconds so that the timestamp of each environment is different
            }

            mixedEnvironments.push(defaultEnvironment)
            mixedEnvironments.push(incorrectEnvironment4)

            wrongEnvironments.push(incorrectEnvironment5)
            wrongEnvironments.push(incorrectEnvironment6)
            // Populates the environments arrays

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

        context('when the application posting a new environment successfully', () => {

            it('environments.post001: should return status code 201 and the saved environment', () => {

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
                        expect(res.body).to.have.property('climatized', defaultEnvironment.climatized)
                        expect(res.body).to.have.property('timestamp', defaultEnvironment.timestamp.toISOString())
                    })
            })

            it('environments.post002: should return status code 201 and the saved environment without climatized parameter', () => {

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
                        expect(res.body).to.have.property('climatized', false) // By default is created the climatized parameter with value false
                        expect(res.body).to.have.property('timestamp', environment.timestamp.toISOString())
                    })
            })

        })

        context('when saved an list of environments', () => {

            describe('when all the environments are correct and still do not saved', () => {
                it('environments.post003: should return status code 207, create each Environment and return a response with description of sucess each environment', () => {

                    const body: any = []
                    correctEnvironments.forEach(environment => {
                        const bodyElem = {
                            institution_id: environment.institution_id,
                            location: environment.location,
                            measurements: environment.measurements,
                            climatized: environment.climatized ? environment.climatized : undefined,
                            timestamp: environment.timestamp
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post('/environments')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(207)
                        .then(res => {
                            expect(res.body.success.length).to.eql(3)
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(201)
                                expect(res.body.success[i].item).to.have.property('id')
                                expect(res.body.success[i].item).to.have.property('institution_id', correctEnvironments[i].institution_id)
                                expect(res.body.success[i].item).to.have.deep.property('location', correctEnvironments[i].location)
                                expect(res.body.success[i].item).to.have.deep.property('measurements', correctEnvironments[i].measurements)
                                expect(res.body.success[i].item).to.have.property('climatized', correctEnvironments[i].climatized)
                                expect(res.body.success[i].item).to.have.property('timestamp', correctEnvironments[i].timestamp.toISOString())
                            }
                            expect(res.body.error.length).to.eql(0)
                        })
                })
            })

            describe('when all the environments are correct but already exists in the repository', () => {
                before(async () => {
                    try {
                        for (let i = 0; i < correctEnvironments.length; i++) {
                            await trck.saveEnvironment(accessTokenApplication, correctEnvironments[i])
                        }
                    } catch (err) {
                        console.log('Failure in environments.post : ', err.message)
                    }
                })
                it('environments.post004: should return status code 207, and return a response with description of conflict in each environment', () => {

                    const body: any = []
                    correctEnvironments.forEach(environment => {
                        const bodyElem = {
                            institution_id: environment.institution_id,
                            location: environment.location,
                            measurements: environment.measurements,
                            climatized: environment.climatized ? environment.climatized : undefined,
                            timestamp: environment.timestamp
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post('/environments')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(207)
                        .then(res => {
                            expect(res.body.error.length).to.eql(3)
                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(409)
                                expect(res.body.error[i].item).to.have.property('institution_id', correctEnvironments[i].institution_id)
                                expect(res.body.error[i].item).to.have.deep.property('location', correctEnvironments[i].location)
                                expect(res.body.error[i].item).to.have.deep.property('measurements', correctEnvironments[i].measurements)
                                expect(res.body.error[i].item).to.have.property('climatized', correctEnvironments[i].climatized)
                                expect(res.body.error[i].item).to.have.property('timestamp', correctEnvironments[i].timestamp.toISOString())
                            }
                            expect(res.body.success.length).to.eql(0)
                        })
                })
            })

            describe('when there are correct and incorrect environments in the body', () => {
                it('environments.post005: should return status code 207, and return a response with description of sucess or error according to each environment', () => {

                    const body: any = []
                    mixedEnvironments.forEach(environment => {
                        const bodyElem = {
                            institution_id: environment.institution_id,
                            location: environment.location,
                            measurements: environment.measurements,
                            climatized: environment.climatized ? environment.climatized : undefined,
                            timestamp: environment.timestamp
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post('/environments')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(207)
                        .then(res => {
                            // Success item
                            expect(res.body.success[0].code).to.eql(201)
                            expect(res.body.success[0].item).to.have.property('id')
                            expect(res.body.success[0].item).to.have.property('institution_id', mixedEnvironments[0].institution_id)
                            expect(res.body.success[0].item).to.have.deep.property('location', mixedEnvironments[0].location)
                            expect(res.body.success[0].item).to.have.deep.property('measurements', mixedEnvironments[0].measurements)
                            expect(res.body.success[0].item).to.have.property('climatized', mixedEnvironments[0].climatized)
                            expect(res.body.success[0].item).to.have.property('timestamp', mixedEnvironments[0].timestamp.toISOString())

                            //Error item
                            expect(res.body.error[0].code).to.eql(400)
                            expect(res.body.error[0].message).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_MEASUREMENTS_TYPE.message)
                            expect(res.body.error[0].description).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_MEASUREMENTS_TYPE.description)
                        })
                })
            })

            describe('when all the environments are incorrect', () => {
                it('environments.post006: should return status code 207, and return a response with description of error in each environment', () => {

                    const body: any = []
                    wrongEnvironments.forEach(environment => {
                        const bodyElem = {
                            institution_id: environment.institution_id,
                            location: environment.location,
                            measurements: environment.measurements,
                            climatized: environment.climatized ? environment.climatized : undefined,
                            timestamp: environment.timestamp
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post('/environments')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(207)
                        .then(res => {

                            expect(res.body.error.length).to.eql(2)
                            //incorrectEnvironment5
                            expect(res.body.error[0].message).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_LOCATION_ROOM.message)
                            expect(res.body.error[0].description).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_LOCATION_ROOM.description)

                            //incorrectEnvironment6
                            expect(res.body.error[1].message).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_MEASUREMENTS_UNIT.message)
                            expect(res.body.error[1].description).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_MEASUREMENTS_UNIT.description)
                        })
                })
            })
        })

        context('when a validation error occurs', () => {
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

            it('environments.post007: should return status code 400 and info message from missing parameters, because institution_id is not provided', () => {

                delete environment.institution_id

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INSTITUTION_ID_ARE_REQUIRED)
                    })
            })

            it('environments.post008: should return status code 400 and info message from missing parameters, because location is not provided', () => {

                delete environment.location

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_LOCATION_ARE_REQUIRED)
                    })
            })

            it('environments.post009: should return status code 400 and info message from missing parameters, because measurements is not provided', () => {

                delete environment.measurements

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_MEASUREMENTS_ARE_REQUIRED)
                    })
            })

            it('environments.post010: should return status code 400 and info message from missing parameters, because timestamp is not provided', () => {

                delete environment.timestamp

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_TIMESTAMP_ARE_REQUIRED)
                    })
            })

            it('environments.post011: should return status code 400 and info message from missing parameters, because institution_id and measurements are not provided', () => {

                delete environment.institution_id
                delete environment.measurements

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INSTITUTION_ID_AND_MEASUREMENTS_ARE_REQUIRED)
                    })
            })

            it('environments.post012: should return status code 400 and info message from missing parameters, because location and timestamp are not provided', () => {

                delete environment.location
                delete environment.timestamp

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_TIMESTAMP_AND_LOCATION_ARE_REQUIRED)
                    })
            })

            it('environments.post013: should return status code 400 and info message from missing parameters, because all required parameters are not provided', () => {

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
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_ALL_PARAMETERS_IS_REQUIRED)
                    })
            })

            it('environments.post014: should return status code 400 and info message from invalid parameters, because institution does not exist', () => {

                environment.institution_id = '111111111111111111111111' // non-existent ID

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

            it('environments.post015: should return status code 400 and info message from invalid parameters, because institution_id is invalid', () => {

                environment.institution_id = '123'

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                    })
            })

            it('environments.post016: should return status code 400 and info message from invalid location, because room is required', () => {

                environment.location = locationWithoutRoom

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_LOCATION_ROOM_ARE_REQUIRED)
                    })
            })

            it('environments.post017: should return status code 400 and info message from invalid location, because local is required', () => {

                environment.location = locationWithoutLocal

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_LOCATION_LOCAL_ARE_REQUIRED)
                    })
            })

            it('environments.post018: should return status code 400 and info message from invalid measurements, because type is required', () => {

                environment.measurements = new Array<Measurement>(measurementWithoutType)

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_MEASUREMENT_TYPE_ARE_REQUIRED)
                    })
            })

            it('environments.post019: should return status code 400 and info message from invalid timestamp, because date is invalid', () => {

                environment.timestamp = new Date('2018-13-19T14:40:00Z')

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(environment.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_DATE)
                    })
            })

            it('environments.post020: should return status code 400 and info message from invalid location, because local is a number', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(incorrectEnvironment1)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_LOCATION_LOCAL)
                    })
            })

            it('environments.post021: should return status code 400 and info message from invalid measurement, because value is not a valid number', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(incorrectEnvironment2)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_MEASUREMENT_VALUE_FIELD_IS_INVALID)
                    })
            })

            it('environments.post022: should return status code 400 and info message from invalid climatized', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(incorrectEnvironment3)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_CLIMATIZED)
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
            it('environments.post023: should return status code 409 and info message about environment is already registered', () => {

                return request(URI)
                    .post('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultEnvironment.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_409_ENVIRONMENT_MEASUREMENT_IS_ALREADY_REGISTERED)
                    })
            })
        })

        context('when the user does not have permission to register the environment', () => {

            it('environments.post024: should return status code 403 and info message from insufficient permissions for admin user', () => {

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

            it('environments.post025: should return status code 403 and info message from insufficient permissions for child user', () => {

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

            it('environments.post026: should return status code 403 and info message from insufficient permissions for educator user', () => {

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

            it('environments.post027: should return status code 403 and info message from insufficient permissions for health professional user', () => {

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

            it('environments.post028: should return status code 403 and info message from insufficient permissions for family user', () => {

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
            it('environments.post029: should return the status code 401 and the authentication failure informational message', async () => {

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

function getIncorrectEnvironmentJSON() {
    const incorrectEnvironmentJSON: any = {
        institution_id: '5a62be07de34500146d9c544',
        location: {
            local: 'indoor',
            room: 'Bloco H sala 01',
            latitude: '-7.2100766',
            longitude: '-35.9175756'
        },
        measurements: [
            {
                type: 'temperature',
                value: 35.6,
                unit: '°C'
            },
            {
                type: 'humidity',
                value: 42.2,
                unit: '%'
            },
            {
                type: 'pm1',
                value: 0.57,
                unit: 'µm'
            },
            {
                type: 'pm2.5',
                value: 1.9,
                unit: 'µm'
            },
            {
                type: 'pm10',
                value: 7.9,
                unit: 'µm'
            }
        ],
        climatized: true,
        timestamp: '2018-11-19T14:40:00Z'
    }

    return incorrectEnvironmentJSON
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
