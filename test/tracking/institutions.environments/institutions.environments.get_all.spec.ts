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

describe('Routes: institutions.environments', () => {

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

    const ENVIRONMENTS_ARRAY: Array<Environment> = new Array()

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
            console.log('Failure on Before from institutions.environments.get_all test: ', err)
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

    describe('GET ALL /institutions.environments', async () => {
        let AMOUNT: number

        beforeEach(async () => {
            try {
                ENVIRONMENTS_ARRAY.length = 0 // clear ENVIRONMENTS_ARRAY
                AMOUNT = await Math.floor(Math.random() * 6 + 5) // 5-10 (the amount of institutions.environments can change for each test case)

                for (let i = (AMOUNT - 1); i >= 0; i--) { // The first environment saved is the last one returned
                    const environment = new EnvironmentMock()
                    environment.institution_id = defaultInstitution.id
                    ENVIRONMENTS_ARRAY[i] = await trck.saveEnvironment(accessTokenApplication, defaultInstitution, environment)
                }
            } catch (err) {
                console.log('Failure in institutions.environments.get_all test: ', err.body)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in institutions.environments.get_all test: ', err.body)
            }
        })

        context('when the user get all environments successfully', () => {

            it(`environments.get_all001: should return status code 200 and a list with all environments for admin user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)
                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

            it(`environments.get_all002: should return status code 200 and a list with all environments for child user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

            it(`environments.get_all003: should return status code 200 and a list with all environments for educator user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

            it(`environments.get_all004: should return status code 200 and a list with all environments for health professional user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

            it(`environments.get_all005: should return status code 200 and a list with all environments for family user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

            it(`environments.get_all006: should return status code 200 and a list with all environments for application user`, () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
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

        }) // user get all institutions.environments successfully

        context('when a validation error occurs', () => {

            it('institutions.environments.post007: should return status code 400 and info message from institution does not exist', () => {

                const NON_EXISTENT_INSTITUTION_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/institutions/${NON_EXISTENT_INSTITUTION_ID}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Institution with ID: ${NON_EXISTENT_INSTITUTION_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Institution and try again...')
                    })
            })

            it('institutions.environments.post008: should return status code 400 and info message from institution_id is invalid', () => {

                const INVALID_INSTITUTION_ID = '123'

                return request(URI)
                    .get(`/institutions/${INVALID_INSTITUTION_ID}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                    })
            })

        })

        context('when get all environments with some specification', () => {

            it('institutions.environments.get_all009: should return status code 200 and a list with the three most recently collected environments', () => {

                const PAGE = 1
                const LIMIT = 3

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments?page=${PAGE}&limit=${LIMIT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(LIMIT)
                        for (let i = 0; i < LIMIT; i++) {
                            expect(res.body[i]).to.have.property('id', ENVIRONMENTS_ARRAY[i].id)
                            expect(res.body[i]).to.have.deep.property('institution_id', ENVIRONMENTS_ARRAY[i].institution_id)
                            expect(res.body[i]).to.have.deep.property('location', ENVIRONMENTS_ARRAY[i].location)
                            expect(res.body[i]).to.have.deep.property('measurements', ENVIRONMENTS_ARRAY[i].measurements)
                            expect(res.body[i]).to.have.deep.property('climatized', ENVIRONMENTS_ARRAY[i].climatized)
                            expect(res.body[i]).to.have.deep.property('timestamp', ENVIRONMENTS_ARRAY[i].timestamp)
                        }
                    })
                    .catch(err => {
                        throw new Error(err.message)
                    })
            })

            it('institutions.environments.get_all010: should return status code 200 and a list of all environments sorted by least creation date', () => {

                // Sort institutions.environments by least timestamp
                ENVIRONMENTS_ARRAY.sort(function (e1, e2) {
                    return e1.timestamp > e2.timestamp ? 1 : -1
                })
                const SORT = 'timestamp'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments?sort=${SORT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.deep.property('institution_id', environment.institution_id)
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

            it('institutions.environments.get_all011: should return status code 200 and a list of all environments sorted by most recently creation date', () => {

                const SORT = 'timestamp'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments?sort=-${SORT}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(AMOUNT)

                        ENVIRONMENTS_ARRAY.forEach(function (environment, index) {
                            expect(res.body[index]).to.have.property('id', environment.id)
                            expect(res.body[index]).to.have.deep.property('institution_id', environment.institution_id)
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

            it('institutions.environments.get_all012: should return status code 200 and a empty list', async () => {

                await trackingDB.deleteEnviroments()

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('institutions.environments.get_all013: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}/environments`)
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
