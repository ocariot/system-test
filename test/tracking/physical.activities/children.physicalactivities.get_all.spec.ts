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
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: children.physicalactivities', () => {

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

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const PHYSICAL_ACTIVITIES: Array<PhysicalActivity> = new Array()
    const AMOUNT = 10 // amount of physical activity that will be inserted into the array PHYSICAL_ACTIVITIES

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
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            // Associating the child
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            // registering default users
            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            // getting default users token
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            // associate children groups
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

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

    describe('GET /children/:child_id/physicalactivities', () => {

        context('when the user get all physical activities of the child successfully', () => {

            it('physical.activities.get_all001: should return status code 200 and and a list with all physical activities for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)
                        })

                    })
            })

            it('physical.activities.get_all002: should return status code 200 and and a list with all physical activities for child user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)

                        })
                    })
            })

            it('physical.activities.get_all003: should return status code 200 and and a list with all physical activities for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)

                        })
                    })
            })

            it('physical.activities.get_all004: should return status code 200 and and a list with all physical activities for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)

                        })
                    })
            })

            it('physical.activities.get_all005: should return status code 200 and and a list with all physical activities for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
                            }
                            expect(res.body[index]).to.have.property('child_id', activity.child_id)

                        })
                    })
            })

            it('physical.activities.get_all006: should return status code 200 and and a list with all physical activities for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(AMOUNT)

                        PHYSICAL_ACTIVITIES.forEach(function (activity, index) {

                            expect(res.body[index]).to.have.property('id', activity.id)
                            expect(res.body[index]).to.have.property('name', activity.name)
                            expect(res.body[index]).to.have.property('start_time', activity.start_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('end_time', activity.end_time!.toISOString().split('.')[0])
                            expect(res.body[index]).to.have.property('duration', activity.duration)
                            expect(res.body[index]).to.have.property('calories', activity.calories)
                            expect(res.body[index]).to.have.property('distance', activity.distance)
                            if (activity.steps) {
                                expect(res.body[index]).to.have.property('steps', activity.steps)
                            }
                            if (activity.levels) {
                                expect(res.body[index].levels)
                                    .to.eql(activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (activity.heart_rate) {
                                expect(res.body[index].heart_rate).to.deep.equal(activity.heart_rate)
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
                        .get(`/children/${defaultChild.id}/physicalactivities?page=${PAGE}&limit=${LIMIT}`)
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response

                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES[index].start_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES[index].end_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES[index].calories)
                                expect(activity_res).to.have.property('distance', PHYSICAL_ACTIVITIES[index].distance)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                if (activity_res.heart_rate) {
                                    expect(activity_res.heart_rate).to.deep.equal(PHYSICAL_ACTIVITIES[index].heart_rate)
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
                    PHYSICAL_ACTIVITIES_COPY.sort(function (a1, a2) {
                        return a1.start_time! > a2.start_time! ? 1 : -1
                    })

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities?page=${PAGE}&limit=${LIMIT}&sort=${SORT}`)
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response
                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES_COPY[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES_COPY[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES_COPY[index].start_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES_COPY[index].end_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES_COPY[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES_COPY[index].calories)
                                expect(activity_res).to.have.property('distance', PHYSICAL_ACTIVITIES_COPY[index].distance)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES_COPY[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES_COPY[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                if (activity_res.heart_rate) {
                                    expect(activity_res.heart_rate).to.deep.equal(PHYSICAL_ACTIVITIES_COPY[index].heart_rate)
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
                    PHYSICAL_ACTIVITIES_COPY.sort(function (a1, a2) {
                        return a1.duration! < a2.duration! ? 1 : -1
                    })

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities?sort=-${SORT}`) // sort by the biggest duration
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(AMOUNT)

                            res.body.forEach(function (activity_res, index) { // when the amount of activities is specified, iterate through the response
                                expect(activity_res).to.have.property('id', PHYSICAL_ACTIVITIES_COPY[index].id)
                                expect(activity_res).to.have.property('name', PHYSICAL_ACTIVITIES_COPY[index].name)
                                expect(activity_res).to.have.property('start_time', PHYSICAL_ACTIVITIES_COPY[index].start_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('end_time', PHYSICAL_ACTIVITIES_COPY[index].end_time!.toISOString().split('.')[0])
                                expect(activity_res).to.have.property('duration', PHYSICAL_ACTIVITIES_COPY[index].duration)
                                expect(activity_res).to.have.property('calories', PHYSICAL_ACTIVITIES_COPY[index].calories)
                                expect(activity_res).to.have.property('distance', PHYSICAL_ACTIVITIES_COPY[index].distance)
                                if (activity_res.steps) {
                                    expect(activity_res).to.have.property('steps', PHYSICAL_ACTIVITIES_COPY[index].steps)
                                }
                                if (activity_res.levels) {
                                    expect(activity_res.levels)
                                        .to.eql(PHYSICAL_ACTIVITIES_COPY[index].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                if (activity_res.heart_rate) {
                                    expect(activity_res.heart_rate).to.deep.equal(PHYSICAL_ACTIVITIES_COPY[index].heart_rate)
                                }
                                expect(activity_res).to.have.property('child_id', PHYSICAL_ACTIVITIES_COPY[index].child_id)
                            })
                        })
                })
            })
        }) // get physical activities successfully

        describe('when a validation error occurs', () => {
            it('physical.activities.get_all010: should return status code 400 and info message from child_id is invalid', () => {

                const INVALID_ID = '159'

                return request(URI)
                    .get(`/children/${INVALID_ID}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })
        }) // validation error occurs

        describe('when not informed the acess token', () => {
            it('physical.activities.get_all011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        context('when the user does not have permission for get all physical activities', () => {

            describe('when a child get all physical activities of other child', () => {
                it('physical.activities.get_id013: should return the status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('physical.activities.get_id014: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('physical.activities.get_id015: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child is not associated with the family', () => {
                it('physical.activities.get_id016: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

        describe('when get all physical activities of a child that has been deleted', () => {

            before(async () => {
                try {
                    await acc.deleteUser(accessTokenAdmin, defaultChild.id)
                } catch (err) {
                    console.log('Failure in physical.activities.get_all test: ', err.message)
                }
            })

            it('physical.activities.get_all012: should return status code 403 and info message about child not registered', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultChild.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })
        })
    })
})
