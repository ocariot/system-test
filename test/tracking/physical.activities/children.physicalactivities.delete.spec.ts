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
import { PhysicalActivity } from '../../../src/tracking-service/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/tracking-service/physical.activity.mock'

describe('Routes: children.physicalactivities', () => {

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

    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

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
            console.log('Failure on Before from physical.activities.delete test: ', err)
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

    describe('DELETE /children/:child_id/physicalactivities/:physicalactivity_id', () => {

        beforeEach(async () => {
            try {
                // save default physical activity for default child
                const resultDefaultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, defaultActivity, defaultChild.id)
                defaultActivity.id = resultDefaultActivity.id
                defaultActivity.child_id = resultDefaultActivity.child_id

            } catch (err) {
                console.log('Failure on Before from physical.activities.delete test: ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deletePhysicalActivities()
            } catch (err) {
                console.log('Failure on Before from physical.activities.delete test: ', err)
            }
        })

        context('when the user delete a physical activity successfully', () => {

            it('physical.activities.delete001: should return status code 204 and no content for physical activity, when the educator delete a physical activity', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('physical.activities.delete002: should return status code 204 and no content for physical activity, when the application delete a physical activity', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('physical.activities.delete003: should return status code 204 and no content for physical activity, when the family delete a physical activity', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) //delete a physical activity successfully

        context('when a validation error occurs', () => {

            it('physical.activities.delete004: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .delete(`/children/${acc.INVALID_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('physical.activities.delete005: should return status code 400 and info message from invalid activity_id', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${acc.INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
                    })
            })
        })


        context('when the child or the activity does not exist', () => {

            it('physical.activities.delete006: should return status code 204 and no content for physical activity, when the child not exist', () => {

                return request(URI)
                    .delete(`/children/${acc.NON_EXISTENT_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('physical.activities.delete007: should return status code 204 and no content for physical activity, when the activity not exist', () => {
                
                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the user does not have permission for delete PhysicalActivity', () => {

            it('physical.activities.delete008: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.delete009: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.delete010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {

            it('physical.activities.delete011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
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
