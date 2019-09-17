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
import { SleepPatternDataSet } from '../../../src/tracking-service/model/sleep.pattern.data.set';
import { SleepPattern } from '../../../src/tracking-service/model/sleep.pattern';

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
    const otherSleep: Sleep = new SleepMock()

    const DEFAULT_START_TIME: Date = new Date()
    const DEFAULT_END_TIME: Date = new Date(new Date(DEFAULT_START_TIME)
        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds

    /**
     * wrong Data Set Items
     */
    const wrongDataSetItemNameJSON: any = {
        start_time: new Date('2018-08-18T01:30:30Z'),
        name: 'restlesss', // invalid name
        duration: Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min
    }

    const wrongDataSetItemDateJSON: any = {
        start_time: new Date('2018-15-19T01:30:30Z'), //invalid month(15)
        name: 'asleep',
        duration: Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min
    }

    const wrongDataSetItemDurationJSON: any = {
        start_time: new Date('2018-08-18T01:30:30Z'),
        name: 'asleep',
        duration: -60000 // negative duration
    }

    // required field "duration" is missing
    const invalidDataSetItemJSON: any = {
        start_time: new Date('2018-08-18T01:30:30Z'),
        name: 'asleep',
        // duration: Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min
    }


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
            console.log('Failure on Before from sleep.patch test: ', err)
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

    describe('PATCH /users/children/:child_id/sleep/:sleep_id', () => {

        beforeEach(async () => {
            try {

                // save default sleep for default child
                const resultDefaultSleep = await trck.saveSleep(accessDefaultChildToken, defaultSleep, defaultChild.id)
                defaultSleep.id = resultDefaultSleep.id
                defaultSleep.child_id = resultDefaultSleep.child_id

            } catch (err) {
                console.log('Failure on Before from sleep.patch test [1] : ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure on After from sleep.patch test: ', err)
            }
        })

        context('when the user update a sleep of the child successfully', () => {

            it('sleep.patch001: should return status code 200 and updated start_time, end_time and duration for educator user', () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.patch002: should return status code 200 and updated sleep for application user', () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: otherSleep.pattern,
                    child_id: otherSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        otherSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.patch003: should return status code 200 and updated sleep for family user', async () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: otherSleep.pattern,
                    child_id: otherSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        otherSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

        }) // update sleep successfully

        describe('when a duplicate error occurrs', () => {

            it('sleep.patch004: should return status code 409 and info message about invalid Date, because start_time is equal to that of another sleep', async () => {

                const result = await trck.saveSleep(accessDefaultChildToken, otherSleep, defaultChild.id)
                otherSleep.id = result.id
                otherSleep.child_id = result.child_id

                const current_date = new Date()

                const body = {
                    start_time: defaultSleep.start_time, // start_time of otherActivity is equal start_time of defaultActivity and both to belong the same child
                    end_time: current_date,
                    duration: current_date.getTime() - defaultSleep.start_time!.getTime(), // end_time - start_time
                    pattern: otherSleep.pattern,
                    child_id: otherSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${otherSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_409_SLEEP_IS_ALREADY_REGISTERED)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('sleep.patch005: should return status code 400 and info message about invalid Date, because start_time is greater than end_time', () => {

                const body = {
                    start_time: DEFAULT_END_TIME, // start_time greater than end_time
                    end_time: DEFAULT_START_TIME, // end_time smaller than start_time
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })

            })

            it('sleep.patch006: should return status code 400 and info message about invalid Date, because start_time is invalid', () => {

                const body = {
                    start_time: new Date('2018-09-40T14:40:00Z'), // invalid day(40) 
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_DATE)
                    })

            })

            it('sleep.patch007: should return status code 400 and info message about invalid duration, because duration value does not match values passed in start_time and end_time parameters', () => {

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration! + 10, // duration value does not match values passed in start_time and end_time parameters
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_DURATION_DOES_NOT_MATCH)
                    })

            })

            it('sleep.patch008: should return status code 400 and info message about negative duration', () => {

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: -defaultSleep.duration!, // negative duration
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION)
                    })

            })

            it('sleep.patch009: should return status code 400 and info message from validatio error, because sleep pattern data set array has a invalid item with invalid name', () => {

                const notSuportedName = wrongDataSetItemNameJSON.name
                const mixedPattern: SleepPattern = new SleepPattern()
                mixedPattern.data_set = defaultSleep.pattern!.data_set.slice() // copy by value

                // add a item with invalid name in mixedPattern pattern data set
                mixedPattern.data_set.push(new SleepPatternDataSet().fromJSON(wrongDataSetItemNameJSON))

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: mixedPattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`The sleep pattern name provided \"${notSuportedName}\" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed patterns are: awake, asleep, restless.')
                    })
            })

            it('sleep.patch010: should return status code 400 and info message from validatio error, because sleep pattern data set array has a invalid item with invalid start_time', () => {

                const mixedPattern: SleepPattern = new SleepPattern()
                mixedPattern.data_set = defaultSleep.pattern!.data_set.slice() // copy by value

                // add a item with invalid date in mixedPattern pattern data set
                mixedPattern.data_set.push(new SleepPatternDataSet().fromJSON(wrongDataSetItemDateJSON))

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: mixedPattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_DATE)
                    })
            })

            it('sleep.patch011: should return status code 400 and info message from validatio error, because sleep pattern data set array has a invalid item with negative duration', () => {

                const mixedPattern: SleepPattern = new SleepPattern()
                mixedPattern.data_set = defaultSleep.pattern!.data_set.slice() // copy by value

                // add a item with invalid date in mixedPattern pattern data set
                mixedPattern.data_set.push(new SleepPatternDataSet().fromJSON(wrongDataSetItemDurationJSON))

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: mixedPattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_NEGATIVE_DURATION_OF_SLEEP_PATTERN_DATASET)
                    })
            })

            it('sleep.patch012: should return status code 400 and info message about invalid levels, because the levels array has an item that contains empty fields', () => {

                const mixedPattern: SleepPattern = new SleepPattern()
                mixedPattern.data_set = defaultSleep.pattern!.data_set.slice() // copy by value

                // add a item with invalid date in mixedPattern pattern data set
                mixedPattern.data_set.push(new SleepPatternDataSet().fromJSON(invalidDataSetItemJSON))

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: mixedPattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_PATTERN_DATASET_DURATION_IS_REQUIRED)
                    })
            })

            it('sleep.patch013: should return status code 400 and info message about child not found', async () => {

                const non_existent_child_id = '111a111a111a11111aa111aa'
                const sleep: Sleep = new SleepMock()

                try {
                    // posting a new sleep for a non-existent child
                    const result = await trck.saveSleep(accessTokenEducator, sleep, non_existent_child_id)
                    sleep.id = result.id
                    sleep.child_id = non_existent_child_id
                } catch (err) {
                    console.log('Error on before from test (sleep.patch012)', err.message)
                }

                const body = {
                    start_time: sleep.start_time,
                    end_time: sleep.end_time,
                    duration: sleep.duration,
                    pattern: sleep.pattern,
                    child_id: sleep.child_id
                }

                // updating the sleep registered for a non-existent child
                return request(URI)
                    .patch(`/users/children/${non_existent_child_id}/sleep/${sleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.SLEEP.????)
                    })
            })

        }) // validation error occurs

        describe('when sleep is not found', () => {

            it('sleep.patch014: should return status code 404 and info message from sleep not found', () => {

                const non_existent_sleep_id = '111a111a111a11111aa111aa'

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern!,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${non_existent_sleep_id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_404_SLEEP_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission for update sleep', () => {

            const body = {
                start_time: defaultSleep.start_time,
                end_time: defaultSleep.end_time,
                duration: defaultSleep.duration,
                pattern: defaultSleep.pattern!,
                child_id: defaultSleep.child_id
            }

            it('sleep.patch015: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.patch016: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.patch017: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
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

            it('sleep.patch018: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when update a sleep of a child that has been deleted', () => {

            it('sleep.patch019: should return status code 404 and info message from sleep not found', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern!,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_404_SLEEP_NOT_FOUND)
                    })
            })
        })
    })
})