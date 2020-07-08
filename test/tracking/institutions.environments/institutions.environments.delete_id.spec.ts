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

    const defaultEnvironment: Environment = new EnvironmentMock()

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
            console.log('Failure on Before from institutions.environments.delete_id test: ', err)
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

    describe('DELETE //institutions/:institution_id/environments/environment_id', async () => {

        beforeEach(async () => {
            try {
                const resultDefaultEnvironment = await trck.saveEnvironment(accessTokenApplication, defaultInstitution, defaultEnvironment)
                defaultEnvironment.id = resultDefaultEnvironment.id
            } catch (err) {
                console.log('Failure in institutions.environments.delete_id test: ', err.body)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in institutions.environments.delete_id test: ', err.body)
            }
        })

        describe('when the application delete a environment successfully', () => {
            it('institutions.environments.delete_id001: should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when validation error occurs', () => {
            it('institutions.environments.delete_id002: should return status code 400 and info message from institution not found', () => {

                const NON_EXISTENT_INSTITUTION_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/institutions/${NON_EXISTENT_INSTITUTION_ID}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Institution with ID: ${NON_EXISTENT_INSTITUTION_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Institution and try again...')
                    })
            })

            it('institutions.environments.delete_id003: should return status code 400 and info message from institution_id is invalid', () => {

                const INVALID_INSTITUTION_ID = '111'

                return request(URI)
                    .delete(`/institutions/${INVALID_INSTITUTION_ID}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                    })
            })
        })

        describe('when the environment does not exist', () => {
            it('institutions.environments.delete_id004: should return status code 204 and no content', () => {

                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the environment_id is invalid', () => {
            it('institutions.environments.delete_id005: should return status code 400 and info message about for invalid_id', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ENVIRONMENTS.ERROR_400_INVALID_ID)
                    })
            })
        })

        context('when the user does not have permission for delete environment', () => {

            it('institutions.environments.delete_id006: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_id007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_id008: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_id009: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_id010: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('institutions.environments.delete_id011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments/${defaultEnvironment.id}`)
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