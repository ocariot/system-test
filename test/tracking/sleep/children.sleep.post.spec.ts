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
import { Sleep, SleepType } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'
import {
    PhasesPatternType,
    StagesPatternType
} from '../../../src/tracking-service/model/sleep.pattern.data.set'

describe('Routes: children.sleep', () => {

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

    let incorrectSleepJSON: any
    const notAllowedPatternName = 123456789
    const notSuportedName = 'awaki'

    // Sleep pattern data_set contains an item where name is empty
    let incorrectSleep7: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepClassicJSON()
    delete incorrectSleepJSON.pattern.data_set[0].name
    incorrectSleep7 = incorrectSleep7.fromJSON(incorrectSleepJSON)

    // Sleep duration is a text
    let incorrectSleep1: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepClassicJSON()
    incorrectSleepJSON.duration = '4sT3xt'
    incorrectSleep1 = incorrectSleep1.fromJSON(incorrectSleepJSON)

    // Sleep pattern data_set contains an item that has the name as a number
    let incorrectSleep2: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepStagesJSON()
    incorrectSleepJSON.pattern.data_set[0].name = notAllowedPatternName
    incorrectSleep2 = incorrectSleep2.fromJSON(incorrectSleepJSON)

    // Sleep pattern data_set contains an item that has the duration as a text
    let incorrectSleep3: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepStagesJSON()
    incorrectSleepJSON.pattern.data_set[0].duration = '4sT3xt'
    incorrectSleep3 = incorrectSleep3.fromJSON(incorrectSleepJSON)

    // Sleep pattern data_set contains an item that has an invalid start_time
    let incorrectSleep4: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepClassicJSON()
    incorrectSleepJSON.pattern.data_set[0].start_time = new Date('2018-12-32T01:30:30Z')
    incorrectSleep4 = incorrectSleep4.fromJSON(incorrectSleepJSON)

    // Sleep pattern data_set contains an item that has an invalid name
    let incorrectSleep5: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepClassicJSON()
    incorrectSleepJSON.pattern.data_set[0].name = 'awaki'
    incorrectSleep5 = incorrectSleep5.fromJSON(incorrectSleepJSON)

    // Sleep pattern data_set contains an item that has an negative duration
    let incorrectSleep6: Sleep = new SleepMock()
    incorrectSleepJSON = getIncorrectSleepClassicJSON()
    incorrectSleepJSON.pattern.data_set[0].duration = -60000
    incorrectSleep6 = incorrectSleep6.fromJSON(incorrectSleepJSON)

    const AMOUNT_OF_CORRECT_SLEEPS = 3
    const correctSleeps: Array<Sleep> = []
    const correctSleepsSummary: Array<any> = []
    const mixedSleeps: Array<Sleep> = []
    const mixedSleepsSummary: Array<any> = []
    const wrongSleeps: Array<Sleep> = []


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

            /* populating the sleep arrays */
            for (let i = 0; i < AMOUNT_OF_CORRECT_SLEEPS; i++) {
                correctSleeps[i] = new SleepMock()
                correctSleepsSummary.push(getSummary(correctSleeps[i]))
                await sleep(20) // function sleep for 20 miliseconds so that the start_time of each sleep is different
            }

            mixedSleeps.push(new SleepMock())
            mixedSleepsSummary.push(getSummary(mixedSleeps[0]))
            mixedSleeps.push(incorrectSleep1)

            wrongSleeps.push(incorrectSleep3)
            wrongSleeps.push(incorrectSleep5)
            wrongSleeps.push(incorrectSleep6)
            wrongSleeps.push(incorrectSleep7)

        } catch (err) {
            console.log('Failure on Before from sleep.post test: ', err.message)
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

    describe('POST /children/:child_id/sleep', () => {
        let sleepClassic: Sleep
        let sleepStages: Sleep

        let summarySleepClassic: any
        let summarySleepStages: any

        beforeEach(async () => {
            try {
                sleepClassic = new SleepMock(SleepType.CLASSIC)
                sleepStages = new SleepMock(SleepType.STAGES)

                summarySleepClassic = getSummary(sleepClassic)
                summarySleepStages = getSummary(sleepStages)

            } catch (err) {
                console.log('Failure in sleep.post test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure in sleep.post test: ', err.message)
            }
        })

        context('when the user posting a Sleep with success', () => {

            it('sleep.post001: should return status code 201 and the saved Sleep by the child user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleepClassic.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleepClassic.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleepClassic.duration)
                        expect(res.body.type).to.eql(sleepClassic.type)
                        sleepClassic.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(summarySleepClassic)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post002: should return status code 201 and the saved Sleep by the educator user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(sleepStages.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleepStages.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleepStages.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleepStages.duration)
                        sleepStages.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(summarySleepStages)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post003: should return status code 201 and the saved Sleep by the family user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(sleepClassic.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleepClassic.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleepClassic.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleepClassic.duration)
                        expect(res.body.type).to.eql(sleepClassic.type)
                        sleepClassic.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(summarySleepClassic)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post004: should return status code 201 and the saved Sleep by the application user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(sleepStages.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleepStages.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleepStages.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleepStages.duration)
                        sleepStages.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(summarySleepStages)
                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

        }) //user posting new sleep successfully

        context('when a validation error occurs', () => {

            it('sleep.post005: should return status code 400 and info message from validation error, because sleep start_time is not provided', () => {

                delete sleepClassic.start_time

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_REQUIRED)
                    })
            })

            it('sleep.post006: should return status code 400 and info message from validation error, because sleep start_time is greater than end_time', async () => {

                sleepClassic.end_time = new Date()
                await sleep(100)
                sleepClassic.start_time = new Date()

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })
            })

            it('sleep.post007: should return status code 400 and info message from validation error, because sleep end_time is not provided', () => {

                delete sleepClassic.end_time

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_END_TIME_IS_REQUIRED)
                    })
            })

            it('sleep.post008: should return status code 400 and info message from validation error, because sleep duration is not provided', () => {

                delete sleepClassic.duration

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_IS_REQUIRED)
                    })
            })

            it('sleep.post009: should return status code 400 and info message from validation error, because sleep duration is negative', () => {

                sleepClassic.duration = -sleepClassic.duration!

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION)
                    })
            })

            it('sleep.post010: should return status code 400 and info message from validation error, because sleep duration is a text', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep1)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_IS_INVALID)
                    })
            })

            it('sleep.post011: should return status code 400 and info message from validation error, because sleep duration does not match values passed in start_time and end_time', () => {

                sleepClassic.duration = sleepClassic.duration! + 1

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_DOES_NOT_MATCH)
                    })
            })

            it('sleep.post012: should return status code 400 and info message from validation error, because sleep pattern data set is not provided', () => {

                delete sleepClassic.pattern

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_PATTERN_IS_REQUIRED)
                    })
            })

            it('sleep.post013: should return status code 400 and info message from validation error, because sleep pattern data set array has a invalid item with invalid name', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep5)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The sleep pattern name provided "${notSuportedName}" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed patterns are: asleep, restless, awake.')
                    })
            })

            it('sleep.post014: should return status code 400 and info message from validation error, because sleep pattern data set array has a invalid item with invalid start_time', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep4)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_DATE)
                    })
            })

            it('sleep.post015: should return status code 400 and info message from validation error, because sleep pattern data set array has a invalid item with negative duration', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep6)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION_OF_SLEEP_PATTERN_DATASET)
                    })
            })

            it('sleep.post016: should return status code 400 and info message from validation error, because Sleep pattern data_set name is not provided', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep7)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_NAME_IS_REQUIRED)
                    })
            })

            it('sleep.post017: should return status code 400 and info message from validation error, because Sleep pattern data_set name is a number', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep2)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The sleep pattern name provided "${notAllowedPatternName}" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed patterns are: asleep, restless, awake.')
                    })
            })

            it('sleep.post018: should return status code 400 and info message from validation error, because Sleep pattern data_set duration is a text', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectSleep3)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Some (or several) duration field of sleep pattern is invalid...')
                        expect(err.body.description).to.eql('Sleep Pattern dataset validation failed: The value provided is not a valid number!')
                    })
            })

            it('sleep.post019: should return status code 400 and info message from validation error, because child not exist', () => {

                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .post(`/children/${NON_EXISTENT_ID}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(`Child with ID ${NON_EXISTENT_ID} is not registered on the platform!`)
                    })
            })

            it('sleep.post020: should return status code 400 and info message from validation error, because child_id is invalid', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .post(`/children/${INVALID_ID}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_CHILD_ID)
                    })
            })

        }) // validation error occurs

        context('when saved an list of sleeps', () => {

            describe('when all the sleep are correct and still do not saved', () => {
                it('sleep.post021: should return status code 207, create each Sleep and return a response with description of sucess each sleep', () => {

                    const body: any = []

                    correctSleeps.forEach(sleep => {
                        const bodyElem = {
                            start_time: sleep.start_time,
                            end_time: sleep.end_time,
                            duration: sleep.duration,
                            pattern: sleep.pattern,
                            type: sleep.type
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post(`/children/${defaultChild.id}/sleep`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .send(body)
                        .expect(207)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(201)
                                expect(res.body.success[i].item).to.have.property('id')
                                expect(res.body.success[i].item.start_time).to.eql(correctSleeps[i].start_time!.toISOString())
                                expect(res.body.success[i].item.end_time).to.eql(correctSleeps[i].end_time!.toISOString())
                                expect(res.body.success[i].item.duration).to.eql(correctSleeps[i].duration)
                                expect(res.body.success[i].item.type).to.eql(correctSleeps[i].type)
                                correctSleeps[i].pattern!.data_set.forEach(function (elem, index) {
                                    expect(res.body.success[i].item.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                                    expect(res.body.success[i].item.pattern.data_set[index].name).to.eql(elem.name)
                                    expect(res.body.success[i].item.pattern.data_set[index].duration).to.eql(elem.duration)
                                })
                                expect(res.body.success[i].item.pattern.summary).to.have.deep.eql(correctSleepsSummary[i])
                                expect(res.body.success[i].item.child_id).to.eql(defaultChild.id)
                            }
                            expect(res.body.error.length).to.eql(0)
                        })
                })
            })

            describe('when all the sleeps are correct but already exists in the repository', () => {
                before(async () => {
                    try {
                        for (let i = 0; i < correctSleeps.length; i++) {
                            await trck.saveSleep(accessDefaultChildToken, correctSleeps[i], defaultChild.id)
                        }
                    } catch (err) {
                        console.log('Failure in physical.activities.post : ', err.message)
                    }
                })
                it('sleep.post022: should return status code 207, and return a response with description of conflict in each sleep', () => {

                    const body: any = []

                    correctSleeps.forEach(sleep => {
                        const bodyElem = {
                            start_time: sleep.start_time,
                            end_time: sleep.end_time,
                            duration: sleep.duration,
                            pattern: sleep.pattern,
                            type: sleep.type
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post(`/children/${defaultChild.id}/sleep`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .send(body)
                        .expect(207)
                        .then(res => {
                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(409)
                                expect(res.body.error[i].item.start_time).to.eql(correctSleeps[i].start_time!.toISOString())
                                expect(res.body.error[i].item.end_time).to.eql(correctSleeps[i].end_time!.toISOString())
                                expect(res.body.error[i].item.duration).to.eql(correctSleeps[i].duration)
                                expect(res.body.error[i].item.type).to.eql(correctSleeps[i].type)
                                correctSleeps[i].pattern!.data_set.forEach(function (elem, index) {
                                    expect(res.body.error[i].item.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                                    expect(res.body.error[i].item.pattern.data_set[index].name).to.eql(elem.name)
                                    expect(res.body.error[i].item.pattern.data_set[index].duration).to.eql(elem.duration)
                                })
                                expect(res.body.error[i].item.child_id).to.eql(defaultChild.id)
                            }
                            expect(res.body.success.length).to.eql(0)
                        })
                })
            })

            describe('when there are correct and incorrect sleeps in the body', () => {
                it('sleep.post023: should return status code 207, and return a response with description of sucess and error in each sleep', () => {

                    const body: any = []

                    mixedSleeps.forEach(sleep => {
                        const bodyElem = {
                            start_time: sleep.start_time,
                            end_time: sleep.end_time,
                            duration: sleep.duration,
                            pattern: sleep.pattern,
                            type: sleep.type
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post(`/children/${defaultChild.id}/sleep`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .send(body)
                        .expect(207)
                        .then(res => {

                            // Sucess item
                            expect(res.body.success[0].code).to.eql(201)
                            expect(res.body.success[0].item).to.have.property('id')
                            expect(res.body.success[0].item.start_time).to.eql(mixedSleeps[0].start_time!.toISOString())
                            expect(res.body.success[0].item.end_time).to.eql(mixedSleeps[0].end_time!.toISOString())
                            expect(res.body.success[0].item.duration).to.eql(mixedSleeps[0].duration)
                            expect(res.body.success[0].item.type).to.eql(mixedSleeps[0].type)
                            mixedSleeps[0].pattern!.data_set.forEach(function (elem, index) {
                                expect(res.body.success[0].item.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body.success[0].item.pattern.data_set[index].name).to.eql(elem.name)
                                expect(res.body.success[0].item.pattern.data_set[index].duration).to.eql(elem.duration)
                            })
                            expect(res.body.success[0].item.pattern.summary).to.have.deep.eql(mixedSleepsSummary[0])
                            expect(res.body.success[0].item.child_id).to.eql(defaultChild.id)

                            // Error
                            expect(res.body.error[0].code).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_IS_INVALID.code)
                            expect(res.body.error[0].message).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_IS_INVALID.message)
                            expect(res.body.error[0].description).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_IS_INVALID.description)
                        })
                })
            })

            describe('when all the sleeps are incorrect', () => {
                it('sleep.post024: should return status code 207, and return a response with description of error in each sleep', () => {

                    const body: any = []

                    wrongSleeps.forEach(sleep => {
                        const bodyElem = {
                            start_time: sleep.start_time,
                            end_time: sleep.end_time,
                            duration: sleep.duration,
                            pattern: sleep.pattern,
                            type: sleep.type
                        }
                        body.push(bodyElem)
                    })

                    return request(URI)
                        .post(`/children/${defaultChild.id}/sleep`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .send(body)
                        .expect(207)
                        .then(res => {

                            // incorrectSleep3
                            expect(res.body.error[0].code).to.eql(400)
                            expect(res.body.error[0].message).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_DURATION_IS_INVALID.message)
                            expect(res.body.error[0].description).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_DURATION_IS_INVALID.description)

                            // incorrectSleep5
                            expect(res.body.error[1].code).to.eql(400)
                            expect(res.body.error[1].message).to.eql(`The sleep pattern name provided "${notSuportedName}" is not supported...`)
                            expect(res.body.error[1].description).to.eql('The names of the allowed patterns are: asleep, restless, awake.')

                            // incorrectSleep6
                            expect(res.body.error[2].code).to.eql(400)
                            expect(res.body.error[2].message).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION_OF_SLEEP_PATTERN_DATASET.message)
                            expect(res.body.error[2].description).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION_OF_SLEEP_PATTERN_DATASET.description)

                            // incorrectSleep7
                            expect(res.body.error[3].code).to.eql(400)
                            expect(res.body.error[3].message).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_NAME_IS_REQUIRED.message)
                            expect(res.body.error[3].description).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_NAME_IS_REQUIRED.description)

                        })
                })
            })
        })

        context('when posting a new Sleep for another user that not to be a child', () => {

            it('sleep.post025: should return 400 and info message from error, when try create a sleep for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()

                return request(URI)
                    .post(`/children/${ADMIN_ID}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${ADMIN_ID} is not registered on the platform!`)
                    })
            })

            it('sleep.post026: should return 400 and info message from error, when try create a sleep for for educator', () => {

                return request(URI)
                    .post(`/children/${defaultEducator.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultEducator.id} is not registered on the platform!`)
                    })
            })

            it('sleep.post027: should return 400 and info message from error, when try create a sleep for for health professional', () => {

                return request(URI)
                    .post(`/children/${defaultHealthProfessional.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultHealthProfessional.id} is not registered on the platform!`)
                    })
            })

            it('sleep.post028: should return 400 and info message from error, when try create a sleep for for family', () => {

                return request(URI)
                    .post(`/children/${defaultFamily.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultFamily.id} is not registered on the platform!`)
                    })
            })

            it('sleep.post029: should return 400 and info message from error, when try create a sleep for for application', () => {

                return request(URI)
                    .post(`/children/${defaultApplication.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultApplication.id} is not registered on the platform!`)
                    })
            })

        }) // create sleep for another user that not to be a child

        describe('when the child posting a new Sleep for another child', () => {

            it('sleep.post030: should return status code 400 and info message from error', async () => {

                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)

                if (anotherChild.username && anotherChild.password) {
                    anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                }

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .send(sleepClassic.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })

            })
        })

        context('when the user does not have permission for register Sleep', () => {

            it('sleep.post031: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(sleepClassic.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('sleep.post032: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(sleepClassic.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

        }) // user does not have permission for register Sleep

        describe('when not informed the acess token', () => {

            it('sleep.post033: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(sleepClassic.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            let sleepDuplicated: Sleep = new SleepMock()
            before(async () => {
                try {
                    await trck.saveSleep(accessDefaultChildToken, sleepDuplicated, defaultChild.id)
                } catch (err) {
                    console.log('Failure in sleep.post test: ', err.message)
                }
            })
            it('sleep.post034: should return status code 409 and info message about duplicate itens', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleepDuplicated.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_409_SLEEP_IS_ALREADY_REGISTERED)
                    })
            })
        })
    })
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getSummary(sleep: Sleep) {
    let summary: any = getSummaryJSON(sleep.type)

    if (sleep.type === SleepType.CLASSIC) {
        sleep.pattern!.data_set.forEach(item => {
            if (item.name === PhasesPatternType.ASLEEP) {
                summary.asleep.count += 1
                summary.asleep.duration += item.duration
            } else if (item.name === PhasesPatternType.AWAKE) {
                summary.awake.count += 1
                summary.awake.duration += item.duration
            } else if (item.name === PhasesPatternType.RESTLESS) {
                summary.restless.count += 1
                summary.restless.duration += item.duration
            }
        })
    } else {
        sleep.pattern!.data_set.forEach(item => {
            if (item.name === StagesPatternType.AWAKE) {
                summary.awake.count += 1
                summary.awake.duration += item.duration
            } else if (item.name === StagesPatternType.LIGHT) {
                summary.light.count += 1
                summary.light.duration += item.duration
            } else if (item.name === StagesPatternType.DEEP) {
                summary.deep.count += 1
                summary.deep.duration += item.duration
            } else if (item.name === StagesPatternType.REM) {
                summary.rem.count += 1
                summary.rem.duration += item.duration
            }
        })
    }

    return summary
}

function getSummaryJSON(type?: SleepType) {
    let summaryJSON: any
    if (type === SleepType.CLASSIC) {
        summaryJSON = {
            asleep: {
                count: 0,
                duration: 0
            },
            awake: {
                count: 0,
                duration: 0
            },
            restless: {
                count: 0,
                duration: 0
            }
        }
    } else {
        summaryJSON = {
            light: {
                count: 0,
                duration: 0
            },
            awake: {
                count: 0,
                duration: 0
            },
            deep: {
                count: 0,
                duration: 0
            },
            rem: {
                count: 0,
                duration: 0
            }
        }
    }

    return summaryJSON
}

function getIncorrectSleepClassicJSON() {
    const incorrectSleepJSON: any = {
        start_time: '2018-08-18T01:40:30Z',
        end_time: '2018-08-18T09:52:30Z',
        duration: 29520000,
        pattern: {
            data_set: [
                {
                    start_time: '2018-08-18T01:40:30.00Z',
                    name: 'restless',
                    duration: 60000
                },
                {
                    start_time: '2018-08-18T01:41:30.00Z',
                    name: 'asleep',
                    duration: 360000
                },
                {
                    start_time: '2018-08-18T01:42:30.00Z',
                    name: 'awake',
                    duration: 240000
                },
                {
                    start_time: '2018-08-18T01:43:30.00Z',
                    name: 'restless',
                    duration: 60000
                },
                {
                    start_time: '2018-08-18T01:44:30.00Z',
                    name: 'asleep',
                    duration: 360000
                },
                {
                    start_time: '2018-08-18T01:45:30.00Z',
                    name: 'awake',
                    duration: 240000
                }
            ]
        },
        type: 'classic'
    }

    return incorrectSleepJSON
}

function getIncorrectSleepStagesJSON() {
    const incorrectSleepJSON: any = {
        start_time: '2018-08-18T01:40:30Z',
        end_time: '2018-08-18T09:52:30Z',
        duration: 29520000,
        pattern: {
            data_set: [
                {
                    start_time: '2018-08-18T01:40:30.00Z',
                    name: 'awake',
                    duration: 60000
                },
                {
                    start_time: '2018-08-18T01:41:30.00Z',
                    name: 'light',
                    duration: 360000
                },
                {
                    start_time: '2018-08-18T01:42:30.00Z',
                    name: 'deep',
                    duration: 240000
                },
                {
                    start_time: '2018-08-18T01:43:30.00Z',
                    name: 'rem',
                    duration: 60000
                },
                {
                    start_time: '2018-08-18T01:44:30.00Z',
                    name: 'awake',
                    duration: 60000
                },
                {
                    start_time: '2018-08-18T01:45:30.00Z',
                    name: 'light',
                    duration: 360000
                },
                {
                    start_time: '2018-08-18T01:46:30.00Z',
                    name: 'deep',
                    duration: 240000
                },
                {
                    start_time: '2018-08-18T01:47:30.00Z',
                    name: 'rem',
                    duration: 60000
                }
            ]
        },
        type: 'classic'
    }

    return incorrectSleepJSON
}