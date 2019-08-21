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

    const defaultEnvironmentMeasurement: Environment = new EnvironmentMock()

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
            defaultEnvironmentMeasurement.institution_id = defaultInstitution.id

        } catch (err) {
            console.log('Failure on Before from environments.delete test: ', err)
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

    describe('DELETE /environments', async () => {

        beforeEach(async () => {
            try {
                const resultDefaultEnvironmentMeasurement = await trck.saveEnvironment(accessTokenApplication, defaultEnvironmentMeasurement)
                defaultEnvironmentMeasurement.id = resultDefaultEnvironmentMeasurement.id
            } catch (err) {
                console.log('Failure in environments.delete test: ', err.body)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in environments.delete test: ', err.body)
            }
        })

        describe('when the application delete a environment measurement successfully', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the environment measurement does not exist', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/environments/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the environment_measurement_id is invalid', () => {
            it('should return status code 400 and info message about for invalid_id', () => {

                return request(URI)
                    .delete(`/environments/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission for delete environment measurement', () => {
            
            it('should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
            
            it('should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
            
            it('should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })            

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('environments.get_all12 should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/environments/${defaultEnvironmentMeasurement.id}`)
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
