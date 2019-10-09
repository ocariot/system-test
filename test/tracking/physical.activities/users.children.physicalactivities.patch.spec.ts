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
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'
import { PhysicalActivityMock, ActivityTypeMock } from '../../mocks/tracking-service/physical.activity.mock'

describe('Routes: users.children.physicalactivities', () => {

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
    const otherActivity: PhysicalActivity = new PhysicalActivityMock()

    const defaultStart_time: Date = new Date()
    const defaultEnd_time: Date = new Date(new Date(defaultStart_time)
        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds

    //Mock through JSON
    const incorrectActivityJSON: any = {
        start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
        end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
        duration: 1178000,
        name: 'walk',
        calories: 200,
        steps: 1000,
        levels: [
            {
                name: ActivityLevelType.SEDENTARY,
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: ActivityLevelType.LIGHTLY,
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: ActivityLevelType.FAIRLY,
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: ActivityLevelType.VERY,
                duration: Math.floor((Math.random() * 10) * 60000)
            }
        ]
    }

    const notAllowedLevelsName = 'sedentaries'

    let incorrectActivity1: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains empty fields
    incorrectActivityJSON.levels[0].name = ''
    incorrectActivityJSON.levels[0].duration = undefined
    incorrectActivity1 = incorrectActivity1.fromJSON(incorrectActivityJSON)

    let incorrectActivity2: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains negative duration
    incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
    incorrectActivityJSON.levels[0].duration = -(Math.floor(Math.random() * 10 + 1) * 60000)
    incorrectActivity2 = incorrectActivity2.fromJSON(incorrectActivityJSON)

    let incorrectActivity3: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains ivalid name
    incorrectActivityJSON.levels[0].name = notAllowedLevelsName
    incorrectActivity3 = incorrectActivity3.fromJSON(incorrectActivityJSON)

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
            console.log('Failure on Before from physical.activities.patch test: ', err)
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

    describe('PATCH /children/:child_id/physicalactivities/:physicalactivity_id', () => {

        beforeEach(async () => {
            try {

                // save default physical activity for default child
                const resultDefaultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, defaultActivity, defaultChild.id)
                defaultActivity.id = resultDefaultActivity.id
                defaultActivity.child_id = resultDefaultActivity.child_id

            } catch (err) {
                console.log('Failure on Before from physical.activities.patch test: ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deletePhysicalActivities()
            } catch (err) {
                console.log('Failure on Before from physical.activities.patch test: ', err)
            }
        })

        context('when the user update a physical activity of the child successfully', () => {

            it('physical.activities.patch001: should return status code 200 and updated start_time, end_time and duration for educator user', () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: otherActivity.start_time,
                    end_time: otherActivity.end_time,
                    duration: otherActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(otherActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.patch002: should return status code 200 and updated start_time, end_time, duration and calories for application user', () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: otherActivity.start_time,
                    end_time: otherActivity.end_time,
                    duration: otherActivity.duration,
                    calories: otherActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(otherActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherActivity.duration)
                        expect(res.body.calories).to.eql(otherActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.patch003: should return status code 200 and updated levels for family user', async () => {

                const walkActivity: PhysicalActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)

                const result = await trck.savePhysicalActivitiy(accessDefaultChildToken, walkActivity, defaultChild.id)
                walkActivity.id = result.id
                walkActivity.child_id = result.child_id

                const body = {
                    name: walkActivity.name,
                    start_time: walkActivity.start_time,
                    end_time: walkActivity.end_time,
                    duration: walkActivity.duration,
                    calories: walkActivity.calories,
                    steps: walkActivity.steps ? walkActivity.steps : undefined,
                    levels: walkActivity.levels ? otherActivity.levels : undefined, // only levels will be updated
                    child_id: walkActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${walkActivity.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(walkActivity.id)
                        expect(res.body.name).to.eql(walkActivity.name)
                        expect(res.body.start_time).to.eql(walkActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(walkActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(walkActivity.duration)
                        expect(res.body.calories).to.eql(walkActivity.calories)
                        if (walkActivity.steps) {
                            expect(res.body.steps).to.eql(walkActivity.steps)
                        }
                        if (walkActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(otherActivity.levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        expect(res.body.child_id).to.eql(walkActivity.child_id)
                    })
            })

        }) // update physical activity successfully

        describe('when a duplicate error occurrs', () => {

            it('physical.activities.patch004: should return status code 409 and info message about invalid Date, because start_time is equal to that of another activity', async () => {

                const result = await trck.savePhysicalActivitiy(accessDefaultChildToken, otherActivity, defaultChild.id)
                otherActivity.id = result.id
                otherActivity.child_id = result.child_id

                const current_date = new Date()

                const body = {
                    name: otherActivity.name,
                    start_time: defaultActivity.start_time, // start_time of otherActivity is equal start_time of defaultActivity and both to belong the same child
                    end_time: current_date,
                    duration: current_date.getTime() - defaultActivity.start_time!.getTime(),
                    calories: otherActivity.calories,
                    steps: otherActivity.steps ? otherActivity.steps : undefined,
                    levels: otherActivity.levels ? otherActivity.levels : undefined,
                    child_id: otherActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${otherActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED)
                    })

            })
        })

        describe('when a validation error occurs', () => {

            it('physical.activities.patch005: should return status code 400 and info message about invalid Date, because start_time is greater than end_time', () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultEnd_time, // start_time greater than end_time
                    end_time: defaultStart_time, // end_time smaller than start_time
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? otherActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })

            })

            it('physical.activities.patch006: should return status code 400 and info message about invalid Date, because start_time is invalid', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: new Date('2018-13-19T14:40:00Z'), // invalid Month(13)
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_DATE)
                    })

            })

            it('physical.activities.patch007: should return status code 400 and info message about invalid duration, because duration value does not match values passed in start_time and end_time parameters', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration! + 10, // duration value does not match values passed in start_time and end_time parameters
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_DOES_NOT_MATCH)
                    })

            })

            it('physical.activities.patch008: should return status code 400 and info message about negative duration', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: -defaultActivity.duration!, // negative duration
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_DURATION)
                    })

            })

            it('physical.activities.patch009: should return status code 400 and info message about negative calories', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: -defaultActivity.calories!, // negative calories
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_CALORIES)
                    })

            })

            it('physical.activities.patch010: should return status code 400 and info message about invalid steps, because steps value provided is a text', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: 'invalid steps', // steps must be integers
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        // the error message should state that the steps are invalid, not that the id provided is invalid
                        expect(err.body.message).to.not.eql('Some ID provided, does not have a valid format.')
                        expect(err.body.description).to.not.eql('A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.')
                        // what error message to expect when the steps are invalid ?
                    })

            })

            it('physical.activities.patch011: should return status code 400 and info message about invalid levels, because the levels array has an item that contains empty fields', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: incorrectActivity1.levels ? incorrectActivity1.levels : undefined, // The levels array has an item that contains empty fields
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_IS_INVALID)
                    })

            })

            it('physical.activities.patch012: should return status code 400 and info message about invalid levels, because the levels array has an item that contains negative duration', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: incorrectActivity2.levels ? incorrectActivity2.levels : undefined, // The levels array has an item that contains negative duration
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_DURATION_IS_NEGATIVE)
                    })

            })

            it('physical.activities.patch013: should return status code 400 and info message about invalid levels, because the levels array has an item that contains invalid name', async () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: incorrectActivity3.levels ? incorrectActivity3.levels : undefined, // The levels array has an item that contains ivalid name
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The name of level provided \"${notAllowedLevelsName}\" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })

            it('physical.activities.patch014: should return status code 400 and info message about child not found', async () => {

                const non_existent_child_id = '111a111a111a11111aa111aa'
                const activity: PhysicalActivity = new PhysicalActivityMock()

                // posting a new physical activity for a non-existent child
                const result = await trck.savePhysicalActivitiy(accessTokenEducator, activity, non_existent_child_id)
                activity.id = result.id
                activity.child_id = non_existent_child_id

                const body = {
                    name: activity.name,
                    start_time: activity.start_time,
                    end_time: activity.end_time,
                    duration: activity.duration,
                    calories: activity.calories,
                    steps: activity.steps ? activity.steps : undefined,
                    levels: activity.levels ? activity.levels : undefined,
                    child_id: non_existent_child_id
                }

                // updating the physical activity registered for a non-existent child
                return request(URI)
                    .patch(`/children/${non_existent_child_id}/physicalactivities/${activity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.????)
                    })
            })

            it('physical.activities.patch015: should return status code 400 and info message from invalid child_id', () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${acc.INVALID_ID}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('physical.activities.patch016: should return status code 400 and info message from invalid activity_id', () => {

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${acc.INVALID_ID}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
                    })
            })

        }) // validation error occurs

        describe('when physical activity is not found', () => {

            it('physical.activities.patch017: should return status code 404 and info message from physical activity not found', () => {

                const non_existent_activity_id = '111a111a111a11111aa111aa'

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${non_existent_activity_id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission for update PhysicalActivity', () => {

            const body = {
                name: defaultActivity.name,
                start_time: defaultActivity.start_time,
                end_time: defaultActivity.end_time,
                duration: defaultActivity.duration,
                calories: defaultActivity.calories,
                steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                child_id: defaultActivity.child_id
            }

            it('physical.activities.patch018: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.patch019: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.patch020: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission


        describe('when not informed the acess token', () => {

            it('physical.activities.patch021: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when update a physical activity of a child that has been deleted', () => {

            it('physical.activities.patch022: should return status code 404 and info message from physical activity not found', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request(URI)
                    .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })
        })
    })
})
