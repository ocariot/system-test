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
import { PhysicalActivityMock } from '../../mocks/tracking-service/physical.activity.mock'

describe('Routes: users.children.physicalactivities', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

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

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

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
    incorrectActivityJSON.levels[0].duration = -(Math.floor(Math.random() * 10) * 60000)
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

        } catch (err) {
            console.log('Failure on Before from physical.activities.post test: ', err.message)
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

    describe('POST /users/children/:child_id/physicalactivities', () => {
        let physicalActivity: PhysicalActivity

        beforeEach(async () => {
            try {
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
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post002: should return status code 201 and the saved PhysicalActivity by the educator user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post003: should return status code 201 and the saved PhysicalActivity by family user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post004: should return status code 201 and the saved PhysicalActivity by application user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

        }) //user posting new physical activity successfully

        context('when posting a new physical activity with only required parameters', () => {

            it('physical.activities.post005: should return status code 201 and the saved PhysicalActivity without steps', () => {

                delete physicalActivity.steps
                delete physicalActivity.levels

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('physical.activities.post006: should return status code 201 and the saved PhysicalActivity without levels', () => {

                delete physicalActivity.levels
                delete physicalActivity.steps

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels)
                            expect(res.body.levels).to.eql(physicalActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('physical.activities.post007: should return status code 400 and info message from validation error, because physical activity name is not provided', () => {

                delete physicalActivity.name

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NAME_IS_REQUIRED)
                    })
            })

            it('physical.activities.post008: should return status code 400 and info message from validation error, because physical activity start_time is not provided', () => {

                delete physicalActivity.start_time

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_START_TIME_IS_REQUIRED)
                    })
            })

            it('physical.activities.post009: should return status code 400 and info message from validation error, because physical activity duration is not provided', () => {

                delete physicalActivity.duration

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_IS_REQUIRED)
                    })
            })

            it('physical.activities.post010: should return status code 400 and info message from validation error, because physical activity calories is not provided', () => {

                delete physicalActivity.calories

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_CALORIES_IS_REQUIRED)
                    })
            })

            it('physical.activities.post011: should return status code 400 and info message from validation error, because physical activity end_time is not provided', () => {

                delete physicalActivity.end_time

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_END_TIME_IS_REQUIRED)
                    })
            })

            it('physical.activities.post012: should return status code 400 and info message from validation error, because physical activity name and duration does not provided', () => {

                delete physicalActivity.name
                delete physicalActivity.duration

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_PARAMETERS_NAME_AND_DURATION_IS_REQUIRED)
                    })
            })

            it('physical.activities.post013: should return status code 400 and info message from validation error, because all required parameters does not provided', () => {

                delete physicalActivity.name
                delete physicalActivity.start_time
                delete physicalActivity.end_time
                delete physicalActivity.duration
                delete physicalActivity.calories

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ALL_PARAMETERS_IS_REQUIRED)
                    })
            })

            it('physical.activities.post014: should return status code 400 and info message from validatio error, because date is invalid', () => {

                physicalActivity.start_time = new Date('2018-13-19T14:40:00Z')

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_DATE)
                    })
            })

            it('physical.activities.post015: should return status code 400 and info message from validatio error, because start_time is greater than end_time', async () => {

                physicalActivity.end_time = new Date()
                await sleep(100)//function sleep for 100 miliseconds
                physicalActivity.start_time = new Date()

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })
            })

            it('physical.activities.post016: should return status code 400 and info message from validatio error, because duration is negative', () => {

                physicalActivity.duration = -1178000

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_DURATION)
                    })
            })

            it('physical.activities.post017: should return status code 400 and info message from validatio error, because duration does not match values passed in start_time and end_time', () => {

                physicalActivity.duration ? physicalActivity.duration += 1 : undefined

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_DURATION_DOES_NOT_MATCH)
                    })
            })

            it('physical.activities.post018: should return status code 400 and info message from validation error, because calories is negative', () => {

                physicalActivity.calories = -1

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_CALORIES)
                    })
            })

            it('physical.activities.post019: should return status code 400 and info message from validation error, because steps number is negative', () => {

                physicalActivity.steps = -1

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_STEPS)
                    })
            })

            it('physical.activities.post020: should return status code 400 and info message from validation error, because level:name are not in a valid format', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity1.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_NAME_IS_INVALID)
                    })
            })

            it('physical.activities.post021: should return status code 400 and info message from validation error, because level:name is not supported', () => {

                const invalidLevelName = 'sedentaries'
                let incorrectActivity: PhysicalActivity = new PhysicalActivityMock()
                incorrectActivityJSON.levels[0].name = invalidLevelName
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The name of level provided \"${invalidLevelName}\" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })

            it('physical.activities.post022: should return status code 400 and info message from validation error, because level:duration is negative', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity2.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_LEVEL_DURATION_IS_NEGATIVE)
                    })
            })

            it('physical.activities.post023: should return status code 400 and info message from validation error, because child not exist', () => {

                return request(URI)
                    .post(`/users/children/${acc.NON_EXISTENT_ID}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.????)
                    })
            })

            it('physical.activities.post024: should return status code 400 and info message from validation error, because child_id is invalid', () => {

                return request(URI)
                    .post(`/users/children/${acc.INVALID_ID}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('physical.activities.post025: should return status code 400 and info message from validation error, because level:name is not allowed', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectActivity3.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The name of level provided \"${notAllowedLevelsName}\" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })

        }) // validation error occurs

        context('when posting a new PhysicalActivity for another user that not to be a child', () => {

            it('physical.activities.post026: should return ??? for admin', async () => {

                return request(URI)
                    .post(`/users/children/${await acc.getAdminID()}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post027: should return ??? for educator', () => {

                return request(URI)
                    .post(`/users/children/${defaultEducator.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post028: should return ??? for health professional', () => {

                return request(URI)
                    .post(`/users/children/${defaultHealthProfessional.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post029: should return ??? for family', () => {

                return request(URI)
                    .post(`/users/children/${defaultFamily.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post030: should return ??? for application', () => {

                return request(URI)
                    .post(`/users/children/${defaultApplication.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

        }) // another user that not to be a child

        describe('when the child posting a new PhysicalActivity for another child', () => {

            it('physical.activities.post031: should return status code 400 and info message ???', async () => {

                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)

                if (anotherChild.username && anotherChild.password) {
                    anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                }

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })

            })
        })

        context('when the user does not have permission for register PhysicalActivity', () => {

            it('physical.activities.post032: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(physicalActivity.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('physical.activities.post033: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(physicalActivity.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })
        }) // does not have permission

        describe('when not informed the acess token', () => {

            it('physical.activities.post034: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(physicalActivity.toJSON())
                    .expect(401)
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
                    .post(`/users/children/${defaultChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(physicalActivity.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED)
                    })
            })

        })
    })
})

const sleep = (milliseconds) => { return new Promise(resolve => setTimeout(resolve, milliseconds)) }
