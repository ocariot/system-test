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
import { PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'

describe('Routes: children.physicalactivities', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild
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
            accessTokenChild = tokens.child.access_token
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

            // save default physical activity for default child
            const resultDefaultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, defaultActivity, defaultChild.id)
            defaultActivity.id = resultDefaultActivity.id
            defaultActivity.child_id = resultDefaultActivity.child_id

        } catch (err) {
            console.log('Failure on Before from physical.activities.get_id test: ', err)
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

    describe('GET /children/:child_id/physicalactivities/:physicalactivity_id', () => {

        context('when the user get a specific physical activity of the child successfully', () => {

            it('physical.activities.get_id001: should return status code 200 and and the specific physical activity for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id002: should return status code 200 and and the specific physical activity for own child', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id003: should return status code 200 and and the specific physical activity for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id004: should return status code 200 and and the specific physical activity for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id005: should return status code 200 and and the specific physical activity for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id006: should return status code 200 and and the specific physical activity for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

        }) // get physical activity successfully

        describe('when physical activity is not found', () => {

            const NON_EXISTENT_ID = '111111111111111111111111'

            it('physical.activities.get_id007: should return status code 404 and info message from physical activity not found', () => {

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })

            it('physical.activities.get_id008: should return status code 404 and info message from physical activity not found', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })

        }) // activity not found

        describe('when a validation error occurs', () => {

            const INVALID_ID = '123'

            it('physical.activities.get_id009: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .get(`/children/${INVALID_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('physical.activities.get_id010: should return status code 400 and info message from invalid activity_id, because activity_id is invalid', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
                    })
            })

        }) // validation error occurs

        describe('when not informed the acess token', () => {

            it('physical.activities.get_id011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get a specific physical activity of a child that has been deleted', () => {

            it('physical.activities.get_id012: should return status code 404 and info message from physical activity not found', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })
        })

        describe('when a child get the physical activity of other child', () => {

            it('physical.activities.get_id013: should return the status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })
})
