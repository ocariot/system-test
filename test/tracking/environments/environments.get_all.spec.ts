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

    const ENVIRONMENT_MEASUREMENTS: Array<Environment> = new Array()

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

        } catch (err) {
            console.log('Failure on Before from environments.get_all test: ', err)
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

    describe('GET ALL /environments', async () => {
        let AMOUNT: number

        beforeEach(async () => {
            try {
                ENVIRONMENT_MEASUREMENTS.length = 0 // clear ENVIRONMENTS_MEASUREMENTS
                AMOUNT = await Math.floor(Math.random() * 6 + 5) // 5-10 (the amount of environments measurement can change for each test case)

                for (let i = (AMOUNT - 1); i >= 0; i--) { // The first environment saved is the last one returned
                    const environment = new EnvironmentMock()
                    environment.institution_id = defaultInstitution.id
                    ENVIRONMENT_MEASUREMENTS[i] = await trck.saveEnvironment(accessTokenApplication, environment)
                }
            } catch (err) {
                console.log('Failure in environments.get_all test: ', err.body)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in environments.get_all test: ', err.body)
            }
        })

        context('when the user get all environments measurements successfully', () => {

            it(`environments.get_all001: should return status code 200 and a list with all environments measurements for admin user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it(`environments.get_all002: should return status code 200 and a list with all environments measurements for child user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it(`environments.get_all003: should return status code 200 and a list with all environments measurements for educator user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it(`environments.get_all004: should return status code 200 and a list with all environments measurements for health professional user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it(`environments.get_all005: should return status code 200 and a list with all environments measurements for family user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it(`environments.get_all006: should return status code 200 and a list with all environments measurements for application user`, () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

        }) // user get all environments measurements successfully

        context('when get all environments measurements with some specification', () => {

            it('environments.get_all007: should return status code 200 and a list with only ID and location of all environments measurements', () => {

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.not.property('institution_id')
                            expect(res.body[index]).to.not.have.property('measurements')
                            expect(res.body[index]).to.not.have.property('climatized')
                            expect(res.body[index]).to.not.have.property('timestamp')
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it('environments.get_all008: should return status code 200 and a list with the three most recently collected environment measurements', () => {

                const PAGE = 1
                const LIMIT = 3

                return request(URI)
                    .get(`/environments?page=${PAGE}&limit=${LIMIT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(LIMIT)
                        for (let i = 0; i < LIMIT; i++) {
                            expect(res.body[i]).to.have.property('id', ENVIRONMENT_MEASUREMENTS[i].id)
                            expect(res.body[i]).to.have.property('institution_id', ENVIRONMENT_MEASUREMENTS[i].institution_id)
                            expect(res.body[i]).to.have.deep.property('location', ENVIRONMENT_MEASUREMENTS[i].location)
                            expect(res.body[i]).to.have.deep.property('measurements', ENVIRONMENT_MEASUREMENTS[i].measurements)
                            expect(res.body[i]).to.have.deep.property('climatized', ENVIRONMENT_MEASUREMENTS[i].climatized)
                            expect(res.body[i]).to.have.deep.property('timestamp', ENVIRONMENT_MEASUREMENTS[i].timestamp)
                        }
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it('environments.get_all009: should return status code 200 and a list of all environment measurements sorted by least creation date', () => {

                ENVIRONMENT_MEASUREMENTS.sort(function (e1, e2) { return e1.timestamp > e2.timestamp ? 1 : -1 }) 
                const SORT = 'timestamp'

                return request(URI)
                    .get(`/environments?sort=${SORT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it('environments.get_all010: should return status code 200 and a list of all environment measurements sorted by most recently creation date', () => {

                const SORT = 'timestamp'

                return request(URI)
                    .get(`/environments?sort=-${SORT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENT_MEASUREMENTS.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.property('institution_id', environment.institution_id)
                            expect(res.body[index]).to.have.deep.property('location', environment.location)
                            expect(res.body[index]).to.have.deep.property('measurements', environment.measurements)
                            expect(res.body[index]).to.have.deep.property('climatized', environment.climatized)
                            expect(res.body[index]).to.have.deep.property('timestamp', environment.timestamp)
                        })
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it('environments.get_all011: should return status code 200 and a empty list', async () => {

                await trackingDB.deleteEnviroments()

                return request(URI)
                    .get('/environments')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('environments.get_all012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/environments')
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
