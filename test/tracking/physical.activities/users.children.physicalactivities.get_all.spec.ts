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

describe('Routes: users.children.physicalactivities', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
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
    const PHYSICAL_ACTIVITIES: Array<PhysicalActivity> = new Array()
    const AMOUNT = 10 // amount of physical activity that will be inserted into the array PHYSICAL_ACTIVITIES

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

            // saves AMOUNT physical activities in an array that simulates the database (most recent activity first).
            // PHYSICAL_ACTIVITIES[0] = last saved activity, PHYSICAL_ACTIVITIES[1] = penultimate activity saved ...
            for (let i = (AMOUNT - 1); i >= 0; i--) {
                const newPhysicalActivity: PhysicalActivity = new PhysicalActivityMock()
                const result = await trck.savePhysicalActivitiy(accessDefaultChildToken, newPhysicalActivity, defaultChild.id)
                newPhysicalActivity.id = result.id
                newPhysicalActivity.child_id = result.child_id
                PHYSICAL_ACTIVITIES[i] = newPhysicalActivity
            }

        } catch (err) {
            console.log('Failure on Before from physical.activities.get_all test: ', err)
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

    describe('GET /users/children/:child_id/physicalactivities', () => {

        context('when the user get all physical activities of the child successfully', () => {

            it('physical.activities.get_all001: should return status code 200 and and a list with all physical activities for admin user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            it('physical.activities.get_all002: should return status code 200 and and a list with all physical activities for child user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            it('physical.activities.get_all003: should return status code 200 and and a list with all physical activities for educator user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            it('physical.activities.get_all004: should return status code 200 and and a list with all physical activities for health professional user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            it('physical.activities.get_all005: should return status code 200 and and a list with all physical activities for family user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            it('physical.activities.get_all006: should return status code 200 and and a list with all physical activities for application user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })
                    })
            })

            context('when get all physical activities with some specification', () => {

                it('physical.activities.get_all007: should return status code 200 and a list with the five most recently registered physical activities', () => {

                    const PAGE = 1
                    const LIMIT = 5

                    return request(URI)
                        .get(`/users/children/${defaultChild.id}/physicalactivities?page=${PAGE}&limit=${LIMIT}`)
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response

                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES[index].start_time!.toISOString())
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES[index].end_time!.toISOString())
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES[index].calories)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                expect(activity_res).to.have.property('child_id', PHYSICAL_ACTIVITIES[index].child_id)
                            })
                        })
                })

                it('physical.activities.get_all008: should return status code 200 and a list with tree physical activities sorted by the lowest start_time', () => {

                    const PAGE = 1
                    const LIMIT = 3
                    const SORT = 'start_time'

                    // copy by value of the PHYSICAL_ACTIVITIES
                    const PHYSICAL_ACTIVITIES_COPY = PHYSICAL_ACTIVITIES.slice()

                    // sort by the lowest activity start_time
                    PHYSICAL_ACTIVITIES_COPY.sort(function (a1, a2) { return a1.start_time! > a2.start_time! ? 1 : -1 })

                    return request(URI)
                        .get(`/users/children/${defaultChild.id}/physicalactivities?page=${PAGE}&limit=${LIMIT}&sort=${SORT}`)
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response
                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES_COPY[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES_COPY[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES_COPY[index].start_time!.toISOString())
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES_COPY[index].end_time!.toISOString())
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES_COPY[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES_COPY[index].calories)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES_COPY[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES_COPY[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                expect(activity_res).to.have.property('child_id', PHYSICAL_ACTIVITIES_COPY[index].child_id)
                            })
                        })
                })

                it('physical.activities.get_all009: should return status code 200 and a list with all physical activities sorted by greater duration', () => {

                    const SORT = 'duration'

                    // copy by value of the PHYSICAL_ACTIVITIES
                    const PHYSICAL_ACTIVITIES_COPY = PHYSICAL_ACTIVITIES.slice()

                    // sort by the biggest duration
                    PHYSICAL_ACTIVITIES_COPY.sort(function (a1, a2) { return a1.duration! < a2.duration! ? 1 : -1 })

                    return request(URI)
                        .get(`/users/children/${defaultChild.id}/physicalactivities?sort=-${SORT}`) // sort by the biggest duration
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(AMOUNT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response
                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES_COPY[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES_COPY[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES_COPY[index].start_time!.toISOString())
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES_COPY[index].end_time!.toISOString())
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES_COPY[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES_COPY[index].calories)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES_COPY[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES_COPY[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                expect(activity_res).to.have.property('child_id', PHYSICAL_ACTIVITIES_COPY[index].child_id)
                            })
                        })
                })
            })
        }) // get physical activities successfully

        describe('when a validation error occurs', () => {

            it('physical.activities.get_all010: should return status code 400 and info message from child_id is invalid', () => {

                return request(URI)
                    .get(`/users/children/${acc.INVALID_ID}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })            

        }) // validation error occurs

        describe('when not informed the acess token', () => {

            it('physical.activities.get_all011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get all physical activities of a child that has been deleted', () => {

            it('physical.activities.get_all012: should return status code 200 and empty list', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                .get(`/users/children/${defaultChild.id}/physicalactivities`)
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).is.an.instanceOf(Array)
                    expect(res.body.length).to.eql(0)                
                })
            })
        })

    })
})