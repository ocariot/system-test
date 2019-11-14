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
import { Sleep, SleepType } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'
import { PhasesPatternType, StagesPatternType } from '../../../src/tracking-service/model/sleep.pattern.data.set'

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
    const defaultSleepSummary: any = getSummary(defaultSleep)

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

            // save default sleep for default child
            const resultDefaultsleep = await trck.saveSleep(accessDefaultChildToken, defaultSleep, defaultChild.id)
            defaultSleep.id = resultDefaultsleep.id
            defaultSleep.child_id = resultDefaultsleep.child_id

        } catch (err) {
            console.log('Failure on Before from sleep.get_id test: ', err)
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

    describe('GET /children/:child_id/sleep/:sleep_id', () => {

        context('when the user get a specific sleep of the child successfully', () => {

            it('sleep.get_id001: should return status code 200 and and the specific sleep for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

            it('sleep.get_id002: should return status code 200 and and the specific sleep for own child', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

            it('sleep.get_id003: should return status code 200 and and the specific sleep for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

            it('sleep.get_id004: should return status code 200 and and the specific sleep for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

            it('sleep.get_id005: should return status code 200 and and the specific sleep for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

            it('sleep.get_id006: should return status code 200 and and the specific sleep for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultSleep.id)
                        expect(res.body).to.have.property('start_time', defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time', defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration', defaultSleep.duration)
                        expect(res.body).to.have.property('type', defaultSleep.type)
                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })
                        expect(res.body.pattern.summary).to.have.deep.eql(defaultSleepSummary)
                        expect(res.body).to.have.property('child_id', defaultSleep.child_id)
                    })
            })

        }) // get sleep successfully

        describe('when sleep is not found', () => {

            const NON_EXISTENT_ID = '111111111111111111111111'

            it('sleep.get_id007: should return status code 404 and info message from sleep not found, because the child_id provided not exist', () => {

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_404_SLEEP_NOT_FOUND)
                    })
            })

            it('sleep.get_id008: should return status code 404 and info message from sleep not found', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_404_SLEEP_NOT_FOUND)
                    })
            })

        }) // sleep not found

        describe('when a validation error occurs', () => {

            const INVALID_ID = '123'

            it('sleep.get_id009: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .get(`/children/${INVALID_ID}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('sleep.get_id010: should return status code 400 and info message from invalid sleep_id, because sleep_id is invalid', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_SLEEP_ID)
                    })
            })

        }) // validation error occurs

        describe('when not informed the acess token', () => {

            it('sleep.get_id011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get a specific sleep of a child that has been deleted', () => {
            it('sleep.get_id012: should return status code 404 and info message from sleep not found', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_404_SLEEP_NOT_FOUND)
                    })
            })
        })
    })
})

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