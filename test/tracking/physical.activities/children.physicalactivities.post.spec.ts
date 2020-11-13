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
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { Application } from '../../../src/account-service/model/application'
import { ApplicationMock } from '../../mocks/account-service/application.mock'
import { PhysicalActivity } from '../../../src/tracking-service/model/physical.activity'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'
import { PhysicalActivityMock, ActivityTypeMock } from '../../mocks/tracking-service/physical.activity.mock'
import { HeartRateZone } from '../../../src/tracking-service/model/heart.rate.zone'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { Activity } from '../../../src/tracking-service/model/activity'
import * as HttpStatus from 'http-status-codes'

describe('Routes: children.physicalactivities', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAnotherEducator: string
    let accessTokenAnotherFamily: string

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string
    let accessDefaultApplicationToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const notAllowedLevelsName = 'sedentaries'
    let incorrectActivityJSON: any

    let incorrectActivity1: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains empty fields
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.levels[0].name = ''
    incorrectActivityJSON.levels[0].duration = undefined
    incorrectActivity1 = incorrectActivity1.fromJSON(incorrectActivityJSON)

    let incorrectActivity2: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains negative duration
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.levels[0].duration = -(Math.floor(Math.random() * 10 + 1) * 60000)
    incorrectActivity2 = incorrectActivity2.fromJSON(incorrectActivityJSON)

    let incorrectActivity3: PhysicalActivity = new PhysicalActivityMock() // The levels array has an item that contains ivalid name
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.levels[0].name = notAllowedLevelsName
    incorrectActivity3 = incorrectActivity3.fromJSON(incorrectActivityJSON)

    // The PhysicalActivityHeartRate is invalid (the average parameter is undefined)
    let incorrectActivity4: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.heart_rate.average = undefined
    incorrectActivity4 = incorrectActivity4.fromJSON(incorrectActivityJSON)

    // The PhysicalActivityHeartRate is invalid (the "out of range" min parameter is empty)
    let incorrectActivity5: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON = getIncorrectActivityJSON()
    delete incorrectActivityJSON.heart_rate.out_of_range_zone.min
    incorrectActivity5 = incorrectActivity5.fromJSON(incorrectActivityJSON)

    // The PhysicalActivityHeartRate is invalid (the "fat burn zone" duration parameter is negative)
    let incorrectActivity6: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.heart_rate.fat_burn_zone.duration *= -1
    incorrectActivity6 = incorrectActivity6.fromJSON(incorrectActivityJSON)

    const invalidMonthDate = '2018-13-19T14:40:00Z' //Date with invalid month
    let incorrectActivity7: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.start_time = invalidMonthDate // The start_time contains an invalid Date, because month is invalid (13)
    incorrectActivity7 = incorrectActivityJSON

    const invalidLevelName = 'sedentaries'
    let incorrectActivity8: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON = getIncorrectActivityJSON()
    incorrectActivityJSON.levels[0].name = invalidLevelName
    incorrectActivity8 = incorrectActivity8.fromJSON(incorrectActivityJSON)

    const AMOUNT_OF_CORRECT_ACTIVITIES = 3
    const correctActivities: Array<PhysicalActivity> = []
    const mixedActivities: Array<PhysicalActivity> = []
    const wrongActivities: Array<PhysicalActivity> = []

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution
            defaultApplication.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            //getting tokens for each 'default user'
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            if (defaultApplication.username && defaultApplication.password) {
                accessDefaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            // Associating defaultChildrenGroup with educator
            const resultChildrenGroup = await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            defaultChildrenGroup.id = resultChildrenGroup.id

            /* populating the activity arrays (correctActivities and mixedActivities) */
            for (let i = 0; i < AMOUNT_OF_CORRECT_ACTIVITIES; i++) {
                correctActivities[i] = new PhysicalActivityMock()
                await sleep(20) // function sleep for 20 miliseconds so that the start_time of each activity is different
            }

            mixedActivities.push(new PhysicalActivityMock())
            mixedActivities.push(incorrectActivity1)

            wrongActivities.push(incorrectActivity2)
            wrongActivities.push(incorrectActivity4)
            wrongActivities.push(incorrectActivity5)
            wrongActivities.push(incorrectActivity6)

        } catch (err) {
            console.log('Failure on efore from physical.activities.post test: ', err.message)
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

    describe('POST /children/:child_id/physicalactivities', () => {
        let physicalActivity: PhysicalActivity

        beforeEach(async () => {
            try {
                // Correct physical activity generated with all fields
                physicalActivity = new PhysicalActivityMock()
            } catch (err) {
                console.log('Failure in physical.activities.post test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deletePhysicalActivities()
            } catch (err) {
                console.log('Failure in physical.activities.post test: ', err.message)
            }
        })

        context('when the user posting a PhysicalActivity with success', () => {

            it('physical.activities.post001: should return status code 201 and the saved PhysicalActivity by the child user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body.distance).to.eql(physicalActivity.distance)
                        if (res.body.steps) {
                            expect(res.body.steps).to.eql(physicalActivity.steps)
                        }
                        if (physicalActivity.levels) {
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (physicalActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(physicalActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post002: should return status code 201 and the saved PhysicalActivity by the educator user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body.distance).to.eql(physicalActivity.distance)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        if (physicalActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(physicalActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post003: should return status code 201 and the saved PhysicalActivity by family user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body.distance).to.eql(physicalActivity.distance)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        if (physicalActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(physicalActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post004: should return status code 201 and the saved PhysicalActivity by application user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body.distance).to.eql(physicalActivity.distance)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        if (physicalActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(physicalActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            context('when saved an list of activities', () => {

                describe('when all the activities are correct and still do not saved', () => {
                    it('physical.activities.post045: should return status code 207, create each PhysicalActivity and return a response with description of sucess each activity', () => {

                        const body: any = []

                        correctActivities.forEach(activity => {
                            const bodyElem = {
                                name: activity.name,
                                start_time: activity.start_time,
                                end_time: activity.end_time,
                                duration: activity.duration,
                                calories: activity.calories,
                                steps: activity.steps ? activity.steps : undefined,
                                distance: activity.distance ? activity.distance : undefined,
                                levels: activity.levels ? activity.levels : undefined,
                                heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                            }
                            body.push(bodyElem)
                        })
                        return request(URI)
                            .post(`/children/${defaultChild.id}/physicalactivities`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                for (let i = 0; i < res.body.success.length; i++) {
                                    expect(res.body.success[i].code).to.eql(201)
                                    expect(res.body.success[i].item).to.have.property('id')
                                    expect(res.body.success[i].item.name).to.eql(correctActivities[i].name)
                                    expect(res.body.success[i].item.start_time).to.eql(Activity.formatDate(correctActivities[i].start_time!))
                                    expect(res.body.success[i].item.end_time).to.eql(Activity.formatDate(correctActivities[i].end_time!))
                                    expect(res.body.success[i].item.duration).to.eql(correctActivities[i].duration)
                                    expect(res.body.success[i].item.calories).to.eql(correctActivities[i].calories)
                                    if (correctActivities[i].steps) {
                                        expect(res.body.success[i].item.steps).to.eql(correctActivities[i].steps)
                                    }
                                    expect(res.body.success[i].item.distance).to.eql(correctActivities[i].distance)
                                    if (correctActivities[i].levels) {
                                        expect(res.body.success[i].item.levels)
                                            .to.eql(correctActivities[i].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                    }
                                    if (correctActivities[i].heart_rate) {
                                        expect(res.body.success[i].item.heart_rate).to.eql(correctActivities[i].heart_rate!.toJSON())
                                    }
                                    expect(res.body.success[i].item.child_id).to.eql(defaultChild.id)
                                }

                                expect(res.body.error.length).to.eql(0)
                            })
                    })
                })

                describe('when all the activities are correct but already exists in the repository', () => {
                    before(async () => {
                        try {
                            for (let i = 0; i < correctActivities.length; i++) {
                                await trck.savePhysicalActivitiy(accessDefaultChildToken, correctActivities[i], defaultChild.id)
                            }
                        } catch (err) {
                            console.log('Failure in physical.activities.post : ', err.message)
                        }
                    })
                    it('physical.activities.post046: should return status code 207, and return a response with description of conflict in each activity', () => {

                        const body: any = []

                        correctActivities.forEach(activity => {
                            const bodyElem = {
                                name: activity.name,
                                start_time: activity.start_time,
                                end_time: activity.end_time,
                                duration: activity.duration,
                                calories: activity.calories,
                                steps: activity.steps ? activity.steps : undefined,
                                distance: activity.distance ? activity.distance : undefined,
                                levels: activity.levels ? activity.levels : undefined,
                                heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                            }
                            body.push(bodyElem)
                        })
                        return request(URI)
                            .post(`/children/${defaultChild.id}/physicalactivities`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                for (let i = 0; i < res.body.error.length; i++) {
                                    expect(res.body.error[i].code).to.eql(409)
                                    expect(res.body.error[i].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED.message)
                                    expect(res.body.error[i].item.name).to.eql(correctActivities[i].name)
                                    expect(res.body.error[i].item.start_time).to.eql(Activity.formatDate(correctActivities[i].start_time!))
                                    expect(res.body.error[i].item.end_time).to.eql(Activity.formatDate(correctActivities[i].end_time!))
                                    expect(res.body.error[i].item.duration).to.eql(correctActivities[i].duration)
                                    expect(res.body.error[i].item.calories).to.eql(correctActivities[i].calories)
                                    if (correctActivities[i].steps) {
                                        expect(res.body.error[i].item.steps).to.eql(correctActivities[i].steps)
                                    }
                                    expect(res.body.error[i].item.distance).to.eql(correctActivities[i].distance)
                                    if (correctActivities[i].levels) {
                                        expect(res.body.error[i].item.levels)
                                            .to.eql(correctActivities[i].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                    }
                                    if (correctActivities[i].heart_rate) {
                                        expect(res.body.error[i].item.heart_rate).to.eql(correctActivities[i].heart_rate!.toJSON())
                                    }
                                    expect(res.body.error[i].item.child_id).to.eql(defaultChild.id)
                                }

                                expect(res.body.success.length).to.eql(0)
                            })
                    })
                })

                describe('when there are correct and incorrect activities in the body', () => {
                    it('physical.activities.post047: should return status code 207, and return a response with description of sucess and error in each activity', () => {

                        const body: any = []

                        mixedActivities.forEach(activity => {
                            const bodyElem = {
                                name: activity.name,
                                start_time: activity.start_time,
                                end_time: activity.end_time,
                                duration: activity.duration,
                                calories: activity.calories,
                                steps: activity.steps ? activity.steps : undefined,
                                distance: activity.distance ? activity.distance : undefined,
                                levels: activity.levels ? activity.levels : undefined,
                                heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/physicalactivities`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.success.length).to.eql(1)
                                expect(res.body.error.length).to.eql(1)

                                // Success item
                                expect(res.body.success[0].code).to.eql(201)
                                expect(res.body.success[0].item).to.have.property('id')
                                expect(res.body.success[0].item.name).to.eql(mixedActivities[0].name)
                                expect(res.body.success[0].item.start_time).to.eql(Activity.formatDate(mixedActivities[0].start_time!))
                                expect(res.body.success[0].item.end_time).to.eql(Activity.formatDate(mixedActivities[0].end_time!))
                                expect(res.body.success[0].item.duration).to.eql(mixedActivities[0].duration)
                                expect(res.body.success[0].item.calories).to.eql(mixedActivities[0].calories)
                                if (mixedActivities[0].steps) {
                                    expect(res.body.success[0].item.steps).to.eql(mixedActivities[0].steps)
                                }
                                expect(res.body.success[0].item.distance).to.eql(mixedActivities[0].distance)
                                if (mixedActivities[0].levels) {
                                    expect(res.body.success[0].item.levels)
                                        .to.eql(mixedActivities[0].levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                }
                                if (mixedActivities[0].heart_rate) {
                                    expect(res.body.success[0].item.heart_rate).to.eql(mixedActivities[0].heart_rate.toJSON())
                                }
                                expect(res.body.success[0].item.child_id).to.eql(defaultChild.id)

                                // Error item
                                expect(res.body.error[0].code).to.eql(400)
                                expect(res.body.error[0].message).to.eql('One or more request fields are invalid...')
                                expect(res.body.error[0].description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                            })
                    })
                })

                describe('when all the activities are incorrect', () => {
                    it('physical.activities.post048: should return status code 207, and return a response with description of error in each activity', () => {

                        const body: any = []

                        wrongActivities.forEach(activity => {
                            const bodyElem = {
                                name: activity.name,
                                start_time: activity.start_time,
                                end_time: activity.end_time,
                                duration: activity.duration,
                                calories: activity.calories,
                                steps: activity.steps ? activity.steps : undefined,
                                distance: activity.distance ? activity.distance : undefined,
                                levels: activity.levels ? activity.levels : undefined,
                                heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/physicalactivities`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.error.length).to.eql(4)

                                // incorrectActivity2
                                expect(res.body.error[0].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('levels.duration').message)
                                expect(res.body.error[0].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('levels.duration').description)
                                
                                // expect(res.body.error[0].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_DURATION_ARE_NEGATIVE.message)
                                // expect(res.body.error[0].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_DURATION_ARE_NEGATIVE.description)        
                                
                                // incorrectActivity4
                                expect(res.body.error[1].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_AVERAGE_ARE_REQUIRED.message)
                                expect(res.body.error[1].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_AVERAGE_ARE_REQUIRED.description)
                                
                                // incorrectActivity5
                                expect(res.body.error[2].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_OUT_OF_RANGE_ZONE_ARE_REQUIRED.message)
                                expect(res.body.error[2].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_OUT_OF_RANGE_ZONE_ARE_REQUIRED.description)
                                
                                // incorrectActivity6
                                expect(res.body.error[3].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('heart_rate.fat_burn_zone.duration').message)
                                expect(res.body.error[3].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('heart_rate.fat_burn_zone.duration').description)
                                // expect(res.body.error[3].message).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_FAT_BURN_ZONE_NEGATIVE_DURATION.message)
                                // expect(res.body.error[3].description).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_FAT_BURN_ZONE_NEGATIVE_DURATION.description)

                                for (let i = 0; i < wrongActivities.length; i++) {
                                    expect(res.body.error[0].code).to.eql(400)
                                    expect(res.body.error[0].item.name).to.eql(wrongActivities[0].name)
                                    expect(res.body.error[0].item.start_time).to.eql(Activity.formatDate(wrongActivities[0].start_time!))
                                    expect(res.body.error[0].item.end_time).to.eql(Activity.formatDate(wrongActivities[0].end_time!))
                                    expect(res.body.error[0].item.duration).to.eql(wrongActivities[0].duration)
                                    expect(res.body.error[0].item.calories).to.eql(wrongActivities[0].calories)
                                    if (wrongActivities[0].steps) {
                                        expect(res.body.error[0].item.steps).to.eql(wrongActivities[0].steps)
                                    }
                                    expect(res.body.error[0].item.distance).to.eql(wrongActivities[0].distance)
                                    if (wrongActivities[0].levels) {
                                        expect(res.body.error[0].item.levels)
                                            .to.eql(wrongActivities[0].levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                                    }
                                    if (wrongActivities[0].heart_rate) {
                                        expect(res.body.error[0].item.heart_rate).to.eql(wrongActivities[0].heart_rate.toJSON())
                                    }
                                }

                                expect(res.body.success.length).to.eql(0)
                            })
                    })
                })
            })

        }) //user posting new physical activity successfully

        context('when posting a new physical activity with only required parameters', () => {

            it('physical.activities.post044: should return status code 201 and the saved PhysicalActivity without distance', () => {

                delete physicalActivity.distance

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body).to.not.have.property('distance')
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        if (physicalActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(physicalActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post005: should return status code 201 and the saved PhysicalActivity without steps', () => {

                const swimActivity = new PhysicalActivityMock(ActivityTypeMock.SWIM)

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(swimActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(swimActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(swimActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(swimActivity.end_time!))
                        expect(res.body.duration).to.eql(swimActivity.duration)
                        expect(res.body.calories).to.eql(swimActivity.calories)
                        expect(res.body.distance).to.eql(swimActivity.distance)
                        expect(res.body).to.not.have.property('steps')
                        if (swimActivity.levels)
                            expect(res.body.levels).to.eql(swimActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        if (swimActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(swimActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post006: should return status code 201 and the saved PhysicalActivity without levels', () => {

                const walkActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)
                delete walkActivity.levels

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(walkActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(walkActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(walkActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(walkActivity.end_time!))
                        expect(res.body.duration).to.eql(walkActivity.duration)
                        expect(res.body.calories).to.eql(walkActivity.calories)
                        expect(res.body.distance).to.eql(walkActivity.distance)
                        expect(res.body).to.not.have.property('levels')
                        if (walkActivity.steps) expect(res.body.steps).to.eql(walkActivity.steps)
                        if (walkActivity.heart_rate) expect(res.body.heart_rate).to.deep.equal(walkActivity.heart_rate)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post036: should return status code 201 and the saved PhysicalActivity without heart_rate', () => {

                delete physicalActivity.heart_rate

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CREATED)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(Activity.formatDate(physicalActivity.start_time!))
                        expect(res.body.end_time).to.eql(Activity.formatDate(physicalActivity.end_time!))
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        expect(res.body.distance).to.eql(physicalActivity.distance)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body).to.not.have.property('heart_rate')
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('physical.activities.post007: should return status code 400 and info message from validation error, because physical activity name is not provided', () => {

                delete physicalActivity.name

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NAME_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post008: should return status code 400 and info message from validation error, because physical activity start_time is not provided', () => {

                delete physicalActivity.start_time

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_START_TIME_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post009: should return status code 400 and info message from validation error, because physical activity duration is not provided', () => {

                delete physicalActivity.duration

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post010: should return status code 400 and info message from validation error, because physical activity calories is not provided', () => {

                delete physicalActivity.calories

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_CALORIES_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post011: should return status code 400 and info message from validation error, because physical activity end_time is not provided', () => {

                delete physicalActivity.end_time

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_END_TIME_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post012: should return status code 400 and info message from validation error, because physical activity name and duration does not provided', () => {

                delete physicalActivity.name
                delete physicalActivity.duration

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_AND_NAME_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post013: should return status code 400 and info message from validation error, because all required parameters does not provided', () => {

                delete physicalActivity.name
                delete physicalActivity.start_time
                delete physicalActivity.end_time
                delete physicalActivity.duration
                delete physicalActivity.calories

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ALL_PARAMETERS_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post014: should return status code 400 and info message from validation error, because date is invalid', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity7)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_FORMAT_DATE_TIME(invalidMonthDate))
                    })
            })

            it('physical.activities.post015: should return status code 400 and info message from validation error, because start_time is greater than end_time', async () => {

                physicalActivity.end_time = new Date()
                await sleep(100) // function sleep for 100 miliseconds
                physicalActivity.start_time = new Date()

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })
            })

            it('physical.activities.post016: should return status code 400 and info message from validation error, because duration is negative', () => {

                physicalActivity.duration = -1178000

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('duration'))
                    })
            })

            it('physical.activities.post017: should return status code 400 and info message from validation error, because duration does not match values passed in start_time and end_time', () => {

                physicalActivity.duration ? physicalActivity.duration += 1 : undefined

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_DOES_NOT_MATCH)
                    })
            })

            it('physical.activities.post018: should return status code 400 and info message from validation error, because calories is negative', () => {

                physicalActivity.calories = -1

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NUMBER_EQUAL_TO_OR_GREATER_THAN_ZERO('calories'))
                    })
            })

            it('physical.activities.post019: should return status code 400 and info message from validation error, because steps number is negative', () => {

                physicalActivity.steps = -1

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('steps'))
                    })
            })

            it('physical.activities.post020: should return status code 400 and info message from validation error, because level:name are not in a valid format', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity1)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_IN_INVALID_FORMAT)
                    })
            })

            it('physical.activities.post021: should return status code 400 and info message from validation error, because level:name is not supported', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity8)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_NOT_ALLOWED)
                    })
            })

            it('physical.activities.post022: should return status code 400 and info message from validation error, because level:duration is negative', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity2)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('levels.duration'))
                    })
            })

            /* HEART_RATE INVALID */
            it('physical.activities.post037: should return status code 400 and info message from validation error, because heart_rate is empty', () => {

                physicalActivity.heart_rate = new HeartRateZone()

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ALL_PARAMETERS_OF_HEART_RATE_ARE_REQUIRED)
                    })
            })

            it('physical.activities.post038: should return status code 400 and info message from validation error, because fat_burn_zone and peak_zone of heart_rate were not provided', () => {

                delete physicalActivity.heart_rate!.fat_burn_zone
                delete physicalActivity.heart_rate!.peak_zone

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('heart_rate.fat_burn_zone, heart_rate.peak_zone are required!')
                    })
            })

            it('physical.activities.post039: should return status code 400 and info message from validation error, because average of heart_rate is negative', () => {

                physicalActivity.heart_rate!.average! *= -1

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_GREATER_THAN_ZERO('heart_rate.average'))
                    })

            })

            it('physical.activities.post040: should return status code 400 and info message from validation error, because min of fat_burn_zone is negative', () => {

                physicalActivity.heart_rate!.fat_burn_zone!.min! *= -1

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_GREATER_THAN_ZERO('heart_rate.fat_burn_zone.min'))
                    })
            })

            it('physical.activities.post041: should return status code 400 and info message from validation error, because cardio_zone duration is negative', () => {

                physicalActivity.heart_rate!.cardio_zone!.duration! *= -1

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('heart_rate.cardio_zone.duration'))
                    })
            })

            it('physical.activities.post042: should return status code 400 and info message from validation error, because peak_zone duration is not provided', () => {

                delete physicalActivity.heart_rate!.peak_zone!.duration

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_PEAK_ZONE_DURATION_ARE_REQUIRED)
                    })
            })
            /* /HEART_RATE INVALID */

            it('physical.activities.post023: should return status code 403 and info message from validation error, because the id from inexistent child does not match user id', () => {

                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .post(`/children/${NON_EXISTENT_ID}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post024: should return status code 400 and info message from validation error, because child_id is invalid', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .post(`/children/${INVALID_ID}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('physical.activities.post025: should return status code 400 and info message from validation error, because level:name is not allowed', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity3)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_NOT_ALLOWED)
                    })
            })

            // SOME FIELDS HAVE NULL VALUE
            it('physical.activities.post050: should return status code 400 and info message from validation error, because activity name is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.name = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_NAME)
                    })
            })

            it('physical.activities.post051: should return status code 400 and info message from validation error, because end_time is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.end_time = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_FORMAT_DATE_TIME('null'))
                    })
            })

            it('physical.activities.post052: should return status code 400 and info message from validation error, because distance is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.distance = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NUMBER_EQUAL_TO_OR_GREATER_THAN_ZERO('distance'))
                    })
            })

            it('physical.activities.post053: should return status code 400 and info message from validation error, because level:name is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.levels[2].name = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_IN_INVALID_FORMAT)
                    })
            })

            it('physical.activities.post054: should return status code 400 and info message from validation error, because level:duration is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.levels[2].duration = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_EQUAL_TO_OR_GREATER_THAN_ZERO('levels.duration'))
                    })
            })

            it('physical.activities.post055: should return status code 400 and info message from validation error, because average of heart_rate is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.heart_rate.average = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_GREATER_THAN_ZERO('heart_rate.average'))
                    })
            })

            it('physical.activities.post056: should return status code 400 and info message from validation error, because fat_burn_zone.min is null', () => {

                const incorrectActivity = getIncorrectActivityJSON()
                incorrectActivity.heart_rate.fat_burn_zone.min = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity)
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INTEGER_GREATER_THAN_ZERO('heart_rate.fat_burn_zone.min'))
                    })
            })
            // SOME FIELDS HAS NULL VALUE

        }) // validation error occurs

        context('when posting a new PhysicalActivity for another user that not to be a child', () => {

            it('physical.activities.post026: should return 403 and info message from error, when try create a activity for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()

                return request(URI)
                    .post(`/children/${ADMIN_ID}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post027: should return 403 and info message from error, when try create a activity for educator', () => {

                return request(URI)
                    .post(`/children/${defaultEducator.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post028: should return 403 and info message from error, when try create a activity for health professional', () => {

                return request(URI)
                    .post(`/children/${defaultHealthProfessional.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post029: should return 403 and info message from error, when try create a activity for family', () => {

                return request(URI)
                    .post(`/children/${defaultFamily.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post030: should return 403 and info message from error, when try create a activity for application', () => {

                return request(URI)
                    .post(`/children/${defaultApplication.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // another user that not to be a child

        context('when the user does not have permission for register PhysicalActivity', () => {

            it('physical.activities.post031: should return status code 403 and info message from insufficient permissions for another child user', async () => {

                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)

                if (anotherChild.username && anotherChild.password) {
                    anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                }

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('physical.activities.post032: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('physical.activities.post033: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('physical.activities.post036: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', async () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(physicalActivity.toJSON())
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child is not associated with the family', () => {
                it('physical.activities.post049: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', async () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/physicalactivities`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(physicalActivity.toJSON())
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // does not have permission

        describe('when not informed the acess token', () => {
            it('physical.activities.post034: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            it('physical.activities.post035: should return status code 409 and info message about duplicate itens', async () => {

                try {
                    await trck.savePhysicalActivitiy(accessDefaultChildToken, physicalActivity, defaultChild.id)
                } catch (err) {
                    console.log('Failure in physical.activities.post test: ', err.message)
                }

                return request(URI)
                    .post(`/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(HttpStatus.CONFLICT)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED)
                    })
            })
        })
    })
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getIncorrectActivityJSON() {

    //Mock through JSON
    const incorrectActivityJSON: any = {
        start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
        end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
        duration: 1178000,
        name: 'walk',
        calories: 200,
        steps: 1000,
        ditance: 800,
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
        ],
        heart_rate: {
            average: 107,
            out_of_range_zone: {
                min: 30,
                max: 91,
                duration: 360000
            },
            fat_burn_zone: {
                min: 91,
                max: 127,
                duration: 600000
            },
            cardio_zone: {
                min: 127,
                max: 154,
                duration: 200000
            },
            peak_zone: {
                min: 154,
                max: 220,
                duration: 123000
            }
        }
    }
    return incorrectActivityJSON
}