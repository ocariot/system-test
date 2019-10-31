// import request from 'supertest'
// import { expect } from 'chai'
// import { acc } from '../../utils/account.utils'
// import { accountDB } from '../../../src/account-service/database/account.db'
// import { trck } from '../../utils/tracking.utils'
// import { trackingDB } from '../../../src/tracking-service/database/tracking.db'
// import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
// import { Institution } from '../../../src/account-service/model/institution'
// import { Child } from '../../../src/account-service/model/child'
// import { ChildMock } from '../../mocks/account-service/child.mock'
// import { PhysicalActivity } from '../../../src/tracking-service/model/physical.activity'
// import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'
// import { ActivityTypeMock, PhysicalActivityMock } from '../../mocks/tracking-service/physical.activity.mock'
//
// describe('Routes: children.physicalactivities', () => {
//
//     const URI: string = process.env.AG_URL || 'https://localhost:8081'
//
//     let accessTokenAdmin: string
//     let accessTokenEducator: string
//     let accessTokenHealthProfessional: string
//     let accessTokenFamily: string
//     let accessTokenApplication: string
//
//     const defaultInstitution: Institution = new Institution()
//     defaultInstitution.type = 'default type'
//     defaultInstitution.name = 'default name'
//     defaultInstitution.address = 'default address'
//     defaultInstitution.latitude = 0
//     defaultInstitution.longitude = 0
//
//     const defaultChild: Child = new ChildMock()
//
//     let accessDefaultChildToken: string
//
//     const defaultActivity: PhysicalActivity = new PhysicalActivityMock()
//
//     //Mock through JSON
//     const incorrectActivityJSON: any = {
//         start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
//         end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
//         duration: 1178000,
//         name: 'walk',
//         calories: 200,
//         steps: 1000,
//         distance: 800,
//         levels: [
//             {
//                 name: ActivityLevelType.SEDENTARY,
//                 duration: Math.floor((Math.random() * 10) * 60000)
//             },
//             {
//                 name: ActivityLevelType.LIGHTLY,
//                 duration: Math.floor((Math.random() * 10) * 60000)
//             },
//             {
//                 name: ActivityLevelType.FAIRLY,
//                 duration: Math.floor((Math.random() * 10) * 60000)
//             },
//             {
//                 name: ActivityLevelType.VERY,
//                 duration: Math.floor((Math.random() * 10) * 60000)
//             }
//         ],
//         heart_rate: {
//             average: 107,
//             out_of_range_zone: {
//                 min: 30,
//                 max: 91,
//                 duration: 0
//             },
//             fat_burn_zone: {
//                 min: 91,
//                 max: 127,
//                 duration: 600000
//             },
//             cardio_zone: {
//                 min: 127,
//                 max: 154,
//                 duration: 0
//             },
//             peak_zone: {
//                 min: 154,
//                 max: 220,
//                 duration: 0
//             }
//         }
//     }
//
//     let incorrectActivity1: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the average parameter is negative)
//     incorrectActivity1.heart_rate!.average! = -150
//
//     let incorrectActivity2: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the "out of range" min parameter is negative)
//     incorrectActivity2.heart_rate!.out_of_range_zone!.min = -30
//
//     let incorrectActivity3: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the "fat_burn_zone" max parameter is empty)
//     delete incorrectActivity3.heart_rate!.fat_burn_zone!.max
//
//     let incorrectActivity4: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the "peak_zone" duration parameter is a text)
//     incorrectActivityJSON.heart_rate.peak_zone.duration = 'asText'
//     incorrectActivity4 = incorrectActivity4.fromJSON(incorrectActivityJSON)
//
//     let incorrectActivity5: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the average parameter is a text)
//     incorrectActivityJSON.heart_rate.average = 'asText'
//     incorrectActivityJSON.heart_rate.cardio_zone.duration = 0 // correcting
//     incorrectActivity5 = incorrectActivity5.fromJSON(incorrectActivityJSON)
//
//     let incorrectActivity6: PhysicalActivity = new PhysicalActivityMock() // The PhysicalActivityHeartRate is invalid (the "cardio_zone" is empty)
//     delete incorrectActivity6.heart_rate!.cardio_zone
//
//     before(async () => {
//         try {
//             await accountDB.connect()
//             await trackingDB.connect()
//
//             const tokens = await acc.getAuths()
//             accessTokenAdmin = tokens.admin.access_token
//             accessTokenEducator = tokens.educator.access_token
//             accessTokenHealthProfessional = tokens.health_professional.access_token
//             accessTokenFamily = tokens.family.access_token
//             accessTokenApplication = tokens.application.access_token
//
//             const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
//             defaultInstitution.id = resultDefaultInstitution.id
//             defaultChild.institution = resultDefaultInstitution
//
//             const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
//             defaultChild.id = resultDefaultChild.id
//
//             // getting default child token
//             if (defaultChild.username && defaultChild.password) {
//                 accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
//             }
//
//         } catch (err) {
//             console.log('Failure on Before from physical.activities.patch test: ', err)
//         }
//     })
//     after(async () => {
//         try {
//             await accountDB.removeCollections()
//             await trackingDB.removeCollections()
//             await accountDB.dispose()
//             await trackingDB.dispose()
//         } catch (err) {
//             console.log('DB ERROR', err)
//         }
//     })
//
//     describe('PATCH /children/:child_id/physicalactivities/:physicalactivity_id', () => {
//
//         beforeEach(async () => {
//             try {
//                 // save default physical activity for default child
//                 const resultDefaultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, defaultActivity, defaultChild.id)
//                 defaultActivity.id = resultDefaultActivity.id
//                 defaultActivity.child_id = resultDefaultActivity.child_id
//
//             } catch (err) {
//                 console.log('Failure on Before from physical.activities.patch test: ', err)
//             }
//         })
//
//         afterEach(async () => {
//             try {
//                 trackingDB.deletePhysicalActivities()
//             } catch (err) {
//                 console.log('Failure on Before from physical.activities.patch test: ', err)
//             }
//         })
//
//         context('when the user update a physical activity of the child successfully', () => {
//
//             it('physical.activities.patch001: should return status code 200 and updated name and calories by educator user', async () => {
//
//                 const bikeActivity: PhysicalActivity = new PhysicalActivityMock(ActivityTypeMock.BIKE)
//
//                 const resultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, bikeActivity, defaultChild.id)
//                 bikeActivity.id = resultActivity.id
//                 bikeActivity.child_id = resultActivity.child_id
//
//                 const newActivityName = ActivityTypeMock.SWIM
//                 const newActivityCalories = bikeActivity.calories! + 100
//
//                 const body = {
//                     name: newActivityName,
//                     calories: newActivityCalories
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${bikeActivity.id}`)
//                     .send(body)
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .set('Content-Type', 'application/json')
//                     .expect(200)
//                     .then(res => {
//                         expect(res.body.id).to.eql(bikeActivity.id)
//                         expect(res.body.name).to.eql(newActivityName) //updated
//                         expect(res.body.start_time).to.eql(bikeActivity.start_time!.toISOString())
//                         expect(res.body.end_time).to.eql(bikeActivity.end_time!.toISOString())
//                         expect(res.body.duration).to.eql(bikeActivity.duration)
//                         expect(res.body.calories).to.eql(newActivityCalories) //updated
//                         expect(res.body).to.not.have.property('steps')
//                         if (bikeActivity.levels) {
//                             expect(res.body.levels)
//                                 .to.eql(bikeActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
//                         }
//                         if (bikeActivity.heart_rate) {
//                             expect(res.body.heart_rate).to.deep.equals(bikeActivity.heart_rate)
//                         }
//                         expect(res.body.child_id).to.eql(defaultActivity.child_id)
//                     })
//             })
//
//             it('physical.activities.patch002: should return status code 200 and updated steps and distance by application user', async () => {
//
//                 const walkActivity: PhysicalActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)
//
//                 const resultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, walkActivity, defaultChild.id)
//                 walkActivity.id = resultActivity.id
//                 walkActivity.child_id = resultActivity.child_id
//
//                 const newActivitySteps = walkActivity.steps! + 100
//                 const newActivityDistance = walkActivity.distance! + 100
//
//                 const body = {
//                     steps: newActivitySteps,
//                     distance: newActivityDistance
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${walkActivity.id}`)
//                     .send(body)
//                     .set('Authorization', 'Bearer '.concat(accessTokenApplication))
//                     .set('Content-Type', 'application/json')
//                     .expect(200)
//                     .then(res => {
//                         expect(res.body.id).to.eql(walkActivity.id)
//                         expect(res.body.name).to.eql(walkActivity.name)
//                         expect(res.body.start_time).to.eql(walkActivity.start_time!.toISOString())
//                         expect(res.body.end_time).to.eql(walkActivity.end_time!.toISOString())
//                         expect(res.body.duration).to.eql(walkActivity.duration)
//                         expect(res.body.calories).to.eql(walkActivity.calories)
//                         expect(res.body.distance).to.eql(newActivityDistance) //updated
//                         expect(res.body.steps).to.eql(newActivitySteps) //updated
//                         if (walkActivity.levels) {
//                             expect(res.body.levels)
//                                 .to.eql(walkActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
//                         }
//                         if (walkActivity.heart_rate) {
//                             expect(res.body.heart_rate).to.deep.equals(walkActivity.heart_rate)
//                         }
//                         expect(res.body.child_id).to.eql(walkActivity.child_id)
//                     })
//             })
//
//             it('physical.activities.patch003: should return status code 200 and updated levels and heart_rate by family user', async () => {
//
//                 const swimActivity: PhysicalActivity = new PhysicalActivityMock(ActivityTypeMock.SWIM)
//                 const heartRateJSON = swimActivity.heart_rate!.toJSON()
//                 heartRateJSON.average += 100
//
//                 const result = await trck.savePhysicalActivitiy(accessDefaultChildToken, swimActivity, defaultChild.id)
//                 swimActivity.id = result.id
//                 swimActivity.child_id = result.child_id
//
//                 const body = {
//                     levels: [], //update levels for empty array
//                     heart_rate: heartRateJSON
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${swimActivity.id}`)
//                     .send(body)
//                     .set('Authorization', 'Bearer '.concat(accessTokenFamily))
//                     .set('Content-Type', 'application/json')
//                     .expect(200)
//                     .then(res => {
//                         expect(res.body.id).to.eql(swimActivity.id)
//                         expect(res.body.name).to.eql(swimActivity.name)
//                         expect(res.body.start_time).to.eql(swimActivity.start_time!.toISOString())
//                         expect(res.body.end_time).to.eql(swimActivity.end_time!.toISOString())
//                         expect(res.body.duration).to.eql(swimActivity.duration)
//                         expect(res.body.calories).to.eql(swimActivity.calories)
//                         expect(res.body).to.not.have.property('steps')
//                         expect(res.body).to.not.have.property('levels')
//                         expect(res.body.heart_rate).to.deep.equal(heartRateJSON)
//                         expect(res.body.child_id).to.eql(swimActivity.child_id)
//                     })
//             })
//
//         }) // update physical activity successfully
//
//         describe('when a validation error occurs', () => {
//             // NOT UPDATEABLE
//             it('physical.activities.patch004: should return status code 400 and info message about not updateable attributes, because start_time is not updateable', async () => {
//
//                 const body = {
//                     start_time: new Date('2018-12-19T14:40:00Z')
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ATTRIBUTES_NOT_UPDATEABLE)
//                     })
//
//             })
//
//             it('physical.activities.patch005: should return status code 400 and info message about not updateable attributes, because end_time is not updateable', async () => {
//
//                 const body = {
//                     name: ActivityTypeMock.RUN,
//                     start_time: new Date('2018-12-19T14:40:00Z')
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ATTRIBUTES_NOT_UPDATEABLE)
//                     })
//
//             })
//
//             it('physical.activities.patch006: should return status code 400 and info message about not updateable attributes, because duration is not updateable', async () => {
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     duration: defaultActivity.duration
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ATTRIBUTES_NOT_UPDATEABLE)
//                     })
//             })
//
//             it('physical.activities.patch007: should return status code 400 and info message about not updateable attributes, because levels is not updateable', async () => {
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     steps: defaultActivity.steps,
//                     distance: defaultActivity.distance,
//                     levels: defaultActivity.levels
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_ATTRIBUTES_NOT_UPDATEABLE)
//                     })
//
//             })
//             // NOT UPDATEABLE
//
//             it('physical.activities.patch008: should return status code 400 and info message about invalid name, because name must be a string ', () => {
//
//                 const invalidName = 150
//                 const body = { name: invalidName }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body.message).to.eql(`field name must be a string!`)
//                     })
//             })
//
//             it('physical.activities.patch009: should return status code 400 and info message about invalid calories, because calories provided was a text', () => {
//
//                 const invalidCalories = 'asText'
//                 const body = { calories: invalidCalories }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CALORIES)
//                     })
//
//             })
//
//             it('physical.activities.patch010: should return status code 400 and info message about invalid calories, because calories value provided was negative', async () => {
//
//                 const body = {
//                     calories: defaultActivity.calories! * (-1) // negative calories
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_CALORIES)
//                     })
//
//             })
//
//             it('physical.activities.patch011: should return status code 400 and info message about invalid steps, because steps value provided was a text', async () => {
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     steps: 'invalid steps' // steps must be integers
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body.message).to.eql('Steps field is invalid...')
//                         expect(err.body.description).to.eql('Physical Activity validation failed: The value provided is not a valid number!')
//                     })
//
//             })
//
//             it('physical.activities.patch012: should return status code 400 and info message about invalid steps, because steps value provided was negative', async () => {
//
//                 const body = {
//                     calories: defaultActivity.calories,
//                     steps: -2700,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_STEPS)
//                     })
//
//             })
//
//             it('physical.activities.patch013: should return status code 400 and info message about invalid distance, because distance value provided was a text', async () => {
//
//                 const body = { distance: 'invalid_distance' }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_DISTANCE)
//                     })
//
//             })
//
//             it('physical.activities.patch014: should return status code 400 and info message about invalid steps, because steps value provided was negative', async () => {
//
//                 const body = { distance: defaultActivity.distance! * (-1) }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_DISTANCE)
//                     })
//             })
//
//             it('physical.activities.patch015: should return status code 400 and info message about child not found', async () => {
//
//                 const non_existent_child_id = '111a111a111a11111aa111aa'
//                 const activity: PhysicalActivity = new PhysicalActivityMock()
//
//                 // posting a new physical activity for a non-existent child
//                 const result = await trck.savePhysicalActivitiy(accessTokenEducator, activity, non_existent_child_id)
//                 activity.id = result.id
//                 activity.child_id = non_existent_child_id
//
//                 const body = {
//                     name: activity.name,
//                     calories: activity.calories,
//                     distance: activity.distance,
//                     steps: activity.steps ? activity.steps : undefined,
//                     child_id: non_existent_child_id
//                 }
//
//                 // updating the physical activity registered for a non-existent child
//                 return request(URI)
//                     .patch(`/children/${non_existent_child_id}/physicalactivities/${activity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body.message).to.eql(`Child with ID ${non_existent_child_id} is not registered on the platform!`)
//                     })
//             })
//
//             it('physical.activities.patch016: should return status code 400 and info message from invalid child_id', () => {
//
//                 const INVALID_ID = '123'
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     distance: defaultActivity.distance,
//                     steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                     heart_rate: defaultActivity.heart_rate,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${INVALID_ID}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
//                     })
//             })
//
//             it('physical.activities.patch017: should return status code 400 and info message from invalid activity_id', () => {
//
//                 const INVALID_ACTIVITY_ID = '123'
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     distance: defaultActivity.distance,
//                     steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                     heart_rate: defaultActivity.heart_rate,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${INVALID_ACTIVITY_ID}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
//                     })
//             })
//
//             it('physical.activities.patch018: should return status code 400 and info message from invalid activity_id', () => {
//
//                 const INVALID_ACTIVITY_ID = '123'
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     distance: defaultActivity.distance,
//                     steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                     heart_rate: defaultActivity.heart_rate,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${INVALID_ACTIVITY_ID}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
//                     })
//             })
//
//             // INVALID HEART_RATE
//             it('physical.activities.patch019: should return status code 400 and info message from invalid heart rate, because average value provided was negative', () => {
//
//                 const body = { heart_rate: incorrectActivity1.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_NEGATIVE_AVERAGE)
//                     })
//             })
//
//             it('physical.activities.patch020: should return status code 400 and info message from invalid heart rate, because out_of_range_zone min parameter is negative', () => {
//
//                 const body = { heart_rate: incorrectActivity2.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_NEGATIVE_MIN)
//                     })
//             })
//
//             it('physical.activities.patch021: should return status code 400 and info message from invalid heart rate, because fat_burn_zone was not provided', () => {
//
//                 const body = { heart_rate: incorrectActivity3.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_MAX_IS_REQUIRED)
//                     })
//             })
//
//             it('physical.activities.patch022: should return status code 400 and info message from invalid heart rate, because cardio_zone parameter duration is a text', () => {
//
//                 const body = { heart_rate: incorrectActivity4.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_DURATION_IS_INVALID)
//                     })
//             })
//
//             it('physical.activities.patch023: should return status code 400 and info message from invalid heart rate, because cardio_zone parameter duration is a text', () => {
//
//                 const body = { heart_rate: incorrectActivity4.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_DURATION_IS_INVALID)
//                     })
//             })
//
//             it('physical.activities.patch024: should return status code 400 and info message from invalid heart rate, because average value provided was a text', () => {
//
//                 const body = { heart_rate: incorrectActivity5.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_AVERAGE)
//                     })
//             })
//
//             it('physical.activities.patch025: should return status code 400 and info message from invalid heart rate, because peak_zone was not provided', () => {
//
//                 const body = { heart_rate: incorrectActivity6.heart_rate }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(400)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_HEART_RATE_CARDIO_ZONE_IS_REQUIRED)
//                     })
//             })
//             // INVALID HEART_RATE
//
//         }) // validation error occurs
//
//         describe('when physical activity is not found', () => {
//
//             it('physical.activities.patch026: should return status code 404 and info message from physical activity not found', () => {
//
//                 const non_existent_activity_id = '111a111a111a11111aa111aa'
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     distance: defaultActivity.distance,
//                     steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                     heart_rate: defaultActivity.heart_rate,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${non_existent_activity_id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .expect(404)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
//                     })
//             })
//         })
//
//         context('when the user does not have permission for update PhysicalActivity', () => {
//
//             const body = {
//                 name: defaultActivity.name,
//                 calories: defaultActivity.calories,
//                 distance: defaultActivity.distance,
//                 steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                 heart_rate: defaultActivity.heart_rate,
//                 child_id: defaultActivity.child_id
//             }
//
//             it('physical.activities.patch027: should return status code 403 and info message from insufficient permissions for admin user', () => {
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
//                     .expect(403)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
//                     })
//             })
//
//             it('physical.activities.patch028: should return status code 403 and info message from insufficient permissions for child user', () => {
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
//                     .expect(403)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
//                     })
//             })
//
//             it('physical.activities.patch029: should return status code 403 and info message from insufficient permissions for health professional user', () => {
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
//                     .expect(403)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
//                     })
//             })
//
//         }) // user does not have permission
//
//
//         describe('when not informed the acess token', () => {
//
//             it('physical.activities.patch030: should return the status code 401 and the authentication failure informational message', () => {
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send({})
//                     .set('Content-Type', 'application/json')
//                     .set('Authorization', 'Bearer ')
//                     .expect(401)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
//                     })
//             })
//         })
//
//         describe('when update a physical activity of a child that has been deleted', () => {
//
//             it('physical.activities.patch031: should return status code 404 and info message from physical activity not found', async () => {
//
//                 await acc.deleteUser(accessTokenAdmin, defaultChild.id)
//
//                 const body = {
//                     name: defaultActivity.name,
//                     calories: defaultActivity.calories,
//                     distance: defaultActivity.distance,
//                     steps: defaultActivity.steps ? defaultActivity.steps : undefined,
//                     heart_rate: defaultActivity.heart_rate,
//                     child_id: defaultActivity.child_id
//                 }
//
//                 return request(URI)
//                     .patch(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
//                     .send(body)
//                     .set('Authorization', 'Bearer '.concat(accessTokenEducator))
//                     .set('Content-Type', 'application/json')
//                     .expect(404)
//                     .then(err => {
//                         expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
//                     })
//             })
//         })
//     })
// })
