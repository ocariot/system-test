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
            console.log('Failure on Before from institutions.environments.delete_all test: ', err)
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
    describe('DELETE ALL /institutions/:institution_id/environments', async () => {
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
                console.log('Failure in institutions.environments.delete_all test: ', err.body)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteEnviroments()
            } catch (err) {
                console.log('Failure in institutions.environments.delete_all test: ', err.body)
            }
        })

        context('when the user delete all environments successfully', () => {

            it(`institutions.environments.delete_all001: should return status code 200 and a list with all environments for admin user`, () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) // user delete all institutions.environments successfully

        context('when a validation error occurs', () => {

            it('institutions.environments.delete_all002: should return status code 400 and info message from institution does not exist', () => {

                const NON_EXISTENT_INSTITUTION_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/institutions/${NON_EXISTENT_INSTITUTION_ID}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Institution with ID: ${NON_EXISTENT_INSTITUTION_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Institution and try again...')
                    })
            })

            it('institutions.environments.delete_all003: should return status code 400 and info message from institution_id is invalid', () => {

                const INVALID_INSTITUTION_ID = '123'

                return request(URI)
                    .delete(`/institutions/${INVALID_INSTITUTION_ID}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                    })
            })

        })

        context('when the user does not have permission to delete all environments', () => {

            it('institutions.environments.delete_all004: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_all005: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_all006: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_all007: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.environments.delete_all008: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('institutions.environments.delete_all009: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}/environments`)
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
