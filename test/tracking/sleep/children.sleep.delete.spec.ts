import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { trck } from '../../utils/tracking.utils'
import { trackingDB } from '../../../src/tracking-service/database/tracking.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Institution } from '../../../src/account-service/model/institution'
import { Child } from '../../../src/account-service/model/child'
import { ChildMock } from '../../mocks/account-service/child.mock'
import { Sleep } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'

describe('Routes: users.children.sleep', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
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

    const defaultChild: Child = new ChildMock()

    let accessDefaultChildToken: string

    const defaultSleep: Sleep = new SleepMock()

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            // getting default child token
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

        } catch (err) {
            console.log('Failure on Before from sleep.delete test: ', err)
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

    describe('DELETE /children/:child_id/sleep/:sleep_id', () => {

        beforeEach(async () => {
            try {
                // save default sleep for default child
                const resultDefaultSleep = await trck.saveSleep(accessDefaultChildToken, defaultSleep, defaultChild.id)
                defaultSleep.id = resultDefaultSleep.id
                defaultSleep.child_id = resultDefaultSleep.child_id

            } catch (err) {
                console.log('Failure on Before from sleep.delete test: ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure on Before from sleep.delete test: ', err)
            }
        })

        context('when the user delete a sleep successfully', () => {

            it('sleep.delete001: should return status code 204 and no content for sleep, when the educator delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('sleep.delete002: should return status code 204 and no content for sleep, when the application delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('sleep.delete003: should return status code 204 and no content for sleep, when the family delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) //delete a sleep successfully

        context('when a validation error occurs', () => {

            it('sleep.delete004: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .delete(`/children/${acc.INVALID_ID}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('sleep.delete005: should return status code 400 and info message from invalid sleep_id', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${acc.INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_SLEEP_ID)
                    })
            })
        })

        context('when the child or the sleep does not exist', () => {

            it('sleep.delete006: should return status code 204 and no content for sleep, when the child not exist', () => {

                return request(URI)
                    .delete(`/children/${acc.NON_EXISTENT_ID}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('sleep.delete007: should return status code 204 and no content for sleep, when the sleep not exist', () => {
                
                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the user does not have permission for delete sleep', () => {

            it('sleep.delete008: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.delete009: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.delete010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('sleep.delete011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})