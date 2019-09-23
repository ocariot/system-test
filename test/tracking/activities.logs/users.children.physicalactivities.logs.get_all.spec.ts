import request from 'supertest'
import { expect } from 'chai'
import { accountDB } from '../../../src/account-service/database/account.db'
import { trackingDB } from '../../../src/tracking-service/database/tracking.db'
import { LogMock } from '../../mocks/tracking-service/log.mock'
import { Log } from '../../../src/tracking-service/model/log'
import { LogType } from '../../../src/tracking-service/model/log'
import { Child } from '../../../src/account-service/model/child'
import { ChildMock } from '../../mocks/account-service/child.mock'
import { InstitutionMock } from '../../mocks/account-service/institution.mock'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { trck } from '../../utils/tracking.utils'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: users.children.physicalactivities.logs', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const AMOUNT_LOGS = 10 // amount of logs that will be inserted into the array PHYSICAL_ACTIVITIES_LOGS


    // Mock objects for Log of type STEPS
    const logsStepsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < AMOUNT_LOGS; i++) {
        logsStepsArr.push(new LogMock(LogType.STEPS))
    }

    // Mock objects for Log of type CALORIES
    const logsCaloriesArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < AMOUNT_LOGS; i++) {
        logsCaloriesArr.push(new LogMock(LogType.CALORIES))
    }

     // date_start and date_end that will be used in the search
    let LOG_DATE_START
    let LOG_DATE_END

    // copy by value of Log arrays (steps and calories) that will be sorted
    const logsSortedSteps = logsStepsArr.slice() 
    const logsSortedCalories = logsCaloriesArr.slice()

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            accessTokenAdmin = await acc.getAdminToken()

            const resultInstitution: any = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution

            const resulChild: any = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resulChild.id

            accessTokenChild = await acc.auth(defaultChild.username!, defaultChild.password!)

            await trck.saveLogs(accessTokenChild, LogType.STEPS, logsStepsArr, defaultChild.id)
            await trck.saveLogs(accessTokenChild, LogType.CALORIES, logsCaloriesArr, defaultChild.id)

            logsSortedSteps.sort((a, b) => { return a.date < b.date ? 1 : 0 }) // descending sort by date
            logsSortedCalories.sort((a, b) => { return a.date < b.date ? 1 : 0 }) // descending sort by date

            // smallest and largest date among log arrays (logSteps and logCalories)
            LOG_DATE_START = logsSortedSteps[AMOUNT_LOGS - 1].date < logsSortedCalories[AMOUNT_LOGS - 1].date ? logsSortedSteps[AMOUNT_LOGS - 1].date : logsSortedCalories[AMOUNT_LOGS - 1].date
            LOG_DATE_END = logsSortedSteps[0].date > logsSortedCalories[0].date ? logsSortedSteps[0].date : logsSortedCalories[0].date

        } catch (e) {
            console.log('before error', e.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await trackingDB.removeCollections()
            await accountDB.dispose()
            await trackingDB.dispose()

        } catch (err) {
            console.log('Failure on Before from physicalactivities.logs.get_all test: ', err)
        }
    })

    describe('GET /users/children/:child_id/physicalactivities/logs/date/:date_start/:date_end', () => {

        context('when the user get all logs for each resource of the child successfully', () => {

            it('logs.get_all001: should return status code 200 and the all logs registered for each resource for admin user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            it('logs.get_all002: should return status code 200 and the all logs registered for each resource for own child', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            it('logs.get_all003: should return status code 200 and the all logs registered for each resource for educator user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            it('logs.get_all004: should return status code 200 and the all logs registered for each resource for health professional user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            it('logs.get_all005: should return status code 200 and the all logs registered for each resource for family user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            it('logs.get_all006: should return status code 200 and the all logs registered for each resource for application user', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsSortedSteps[i].date)
                            expect(res.body.steps[i].value).to.eql(logsSortedSteps[i].value)
                        }

                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsSortedCalories[i].date)
                            expect(res.body.calories[i].value).to.eql(logsSortedCalories[i].value)
                        }

                        expect(res.body.active_minutes.length).to.eql(0)
                    })
            })

            describe('when the log for specified dates not found', () => {

                it('logs.get_all007: should return status code 200 and an empty array', () => {
                    const date_star = '1950-05-05'
                    const date_ed = '1975-05-05'

                    return request(URI)
                        .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${date_star}/${date_ed}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.steps.length).to.eql(0)
                            expect(res.body.calories.length).to.eql(0)
                            expect(res.body.active_minutes.length).to.eql(0)
                        })
                })
            }) // log not found

        })// get physical activity successfully

        describe('when a validation error occurs', () => {

            it('logs.get_all008: should return status code 400 and info message from invalid year in date', () => {
                const wrongYear = '20199-05-05' // date with year wrong
                const date_end = '2019-08-08'

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${wrongYear}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`Date parameter: ${wrongYear}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })

            // In the current version of the API, if month on the log date is invalid the system catches the error as if the child ID were invalid, so this test will fail
            it('logs.get_all009: should return status code 400 and info message from invalid month in date', () => {
                const date_start = '2019-10-05'
                const wrongMonth = '2019-13-05' // date with month wrong

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${date_start}/${wrongMonth}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`Date parameter: ${wrongMonth}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })

            // In the current version of the API, if day on the log date is invalid the system catches the error as if the child ID were invalid, so this test will fail
            it('logs.get_all010: should return status code 400 and info message from from invalid day in date', () => {
                const wrongDay = '2019-08-32' // date with day wrong
                const date_end = '2019-05-07'

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${wrongDay}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`Date parameter: ${wrongDay}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })

            it.only('logs.get_all011: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .get(`/users/children/${acc.INVALID_ID}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            // In the current version of the API the system will log for any valid ID, so this test will fail
            it('logs.get_all012: should return status code 400 and info message from validation error, because child not exist', () => {

                return request(URI)
                    .get(`/users/children/${acc.NON_EXISTENT_ID}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql('?????')
                    })
            })

        })// validation error occurs

        // In the current version of the API, the system allows one child to view another child's logs, so this test will fail.
        describe('when the child try to view all logs for each resource from another child', () => {

            it('logs.get_all014: should return status code 403 and informational message that child not have permission', async () => {
                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)
                anotherChildToken = await acc.auth(anotherChild.username!, anotherChild.password!)

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        })

        describe('when not informed the acess token', () => {

            it('logs.get_all015: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}/physicalactivities/logs/date/${LOG_DATE_START}/${LOG_DATE_END}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })

            })
        })

    })

})