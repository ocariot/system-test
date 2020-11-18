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
import * as HttpStatus from 'http-status-codes'

describe('Routes: children.logs', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let anotherChildToken
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const anotherChild: Child = new ChildMock()
    const dateStartLogsSaved = '2019-01-01' // start date that logs will be saved
    const amount_logs = 3 // how many logs will the arrays have

    let logsArrSTEPS: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.STEPS, amount_logs) // array with logs of type STEPS
    let logsArrCALORIES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.CALORIES, amount_logs) // array with logs of type CALORIES
    let logsArrACTIVE_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.ACTIVE_MINUTES, amount_logs) // array with logs of type ACTIVE_MINUTES
    let logsArrLIGHTLY_ACTIVE_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.LIGHTLY_ACTIVE_MINUTES, amount_logs) // array with logs of type LIGHTLY_ACTIVE_MINUTES
    let logsArrSEDENTARY_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.SEDENTARY_MINUTES, amount_logs) // array with logs of type SEDENTARY_MINUTES


    
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
            anotherChild.institution = defaultInstitution
            
            const resulChild: any = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resulChild.id
            
            accessTokenChild = await acc.auth(defaultChild.username!, defaultChild.password!)
            
            const resultAnotherChild: any = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id
            
            anotherChildToken = await acc.auth(anotherChild.username!, anotherChild.password!)

            await trck.saveLogs(accessTokenChild, LogType.STEPS, logsArrSTEPS, defaultChild.id)
            await trck.saveLogs(accessTokenChild, LogType.CALORIES, logsArrCALORIES, defaultChild.id)
            await trck.saveLogs(accessTokenChild, LogType.ACTIVE_MINUTES, logsArrACTIVE_MINUTES, defaultChild.id)
            await trck.saveLogs(accessTokenChild, LogType.LIGHTLY_ACTIVE_MINUTES, logsArrLIGHTLY_ACTIVE_MINUTES, defaultChild.id)
            await trck.saveLogs(accessTokenChild, LogType.SEDENTARY_MINUTES, logsArrSEDENTARY_MINUTES, defaultChild.id)

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
            console.log('Failure on Before from children.logs.get_all test: ', err)
        }
    })

    describe('GET /children/:child_id/logs/date/:date_start/:date_end', () => {

        context('when the user get all logs for each resource of the child successfully', () => {

            it('logs.get_all001: should return status code 200 and the all logs registered for each resource for admin user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_all002: should return status code 200 and the all logs registered for each resource for own child', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_all003: should return status code 200 and the all logs registered for each resource for educator user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_all004: should return status code 200 and the all logs registered for each resource for health professional user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_all005: should return status code 200 and the all logs registered for each resource for family user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_all006: should return status code 200 and the all logs registered for each resource for application user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.active_minutes.length).to.eql(3)
                        expect(res.body.calories.length).to.eql(3)
                        expect(res.body.lightly_active_minutes.length).to.eql(3)
                        expect(res.body.sedentary_minutes.length).to.eql(3)
                        expect(res.body.steps.length).to.eql(3)

                        for (let i = 0; i < res.body.active_minutes.length; i++) {
                            expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.calories.length; i++) {
                            expect(res.body.calories[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body.calories[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                        for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                            expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                            expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                        for (let i = 0; i < res.body.steps.length; i++) {
                            expect(res.body.steps[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body.steps[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            describe('when the log for specified dates not found', () => {

                it('logs.get_all007: should return status code 200 and the array of each resource with zero value in the logs for the specified date.', () => {
                    let count = 0 // auxiliary variable to count how many logs were not logged for the specified date
                    const date_start = '2018-12-27'// initial date the search will be performed
                    const date_end = '2018-12-31'// final date the search will be performed

                    return request(URI)
                        .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(HttpStatus.OK)
                        .then(res => {
                            expect(res.body.active_minutes.length).to.eql(5)
                            expect(res.body.calories.length).to.eql(5)
                            expect(res.body.lightly_active_minutes.length).to.eql(5)
                            expect(res.body.sedentary_minutes.length).to.eql(5)
                            expect(res.body.steps.length).to.eql(5)

                            for (let i = 0; i < res.body.active_minutes.length; i++) {
                                if (res.body.active_minutes[i].value != 0) {
                                    count++
                                }
                            }
                            for (let i = 0; i < res.body.calories.length; i++) {
                                if (res.body.calories[i].value != 0) {
                                    count++
                                }
                            }
                            for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                                if (res.body.lightly_active_minutes[i].value != 0) {
                                    count++
                                }
                            }
                            for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                                if (res.body.sedentary_minutes[i].value != 0) {
                                    count++
                                }
                            }
                            for (let i = 0; i < res.body.steps.length; i++) {
                                if (res.body.steps[i].value != 0) {
                                    count++
                                }
                            }

                            expect(count).to.eql(0)
                        })
                })
            }) // log not found

            context('When the child has logs registered for only 3 resources', () => {

                beforeEach(async () => {
                    try {
                        await trackingDB.deletePhysicalActivitiesLogs()
                    } catch (error) {
                        console.log('Failure in physical.activities.log.get_all test: ', error.message)
                    }

                    await trck.saveLogs(accessTokenChild, LogType.ACTIVE_MINUTES, logsArrACTIVE_MINUTES, defaultChild.id)
                    await trck.saveLogs(accessTokenChild, LogType.LIGHTLY_ACTIVE_MINUTES, logsArrLIGHTLY_ACTIVE_MINUTES, defaultChild.id)
                    await trck.saveLogs(accessTokenChild, LogType.SEDENTARY_MINUTES, logsArrSEDENTARY_MINUTES, defaultChild.id)
                })
                afterEach(async () => {
                    try {
                        await trackingDB.deletePhysicalActivitiesLogs()
                    } catch (error) {
                        console.log('Failure in physical.activities.log.get_all test: ', error.message)
                    }
                })

                it('logs.get_all008: should return status code 200 and the all logs registered for each resource for admin user.', () => {
                    let countSteps = 0 // auxiliary variable to count how many logs were not logged for the resource STEPS and the specified date
                    let countCalories = 0 // auxiliary variable to count how many logs were not logged for the resource CALORIES and the specified date
                    const date_start = '2019-01-01'// initial date the search will be performed
                    const date_end = '2019-01-03'// final date the search will be performed

                    return request(URI)
                        .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(HttpStatus.OK)
                        .then(res => {
                            expect(res.body.active_minutes.length).to.eql(3)
                            expect(res.body.calories.length).to.eql(3)
                            expect(res.body.lightly_active_minutes.length).to.eql(3)
                            expect(res.body.sedentary_minutes.length).to.eql(3)
                            expect(res.body.steps.length).to.eql(3)

                            for (let i = 0; i < res.body.active_minutes.length; i++) {
                                expect(res.body.active_minutes[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                                expect(res.body.active_minutes[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                            }
                            for (let i = 0; i < res.body.calories.length; i++) {
                                if(res.body.calories[i].value == 0){
                                    countCalories++
                                }
                            }
                            for (let i = 0; i < res.body.lightly_active_minutes.length; i++) {
                                expect(res.body.lightly_active_minutes[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                                expect(res.body.lightly_active_minutes[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                            }
                            for (let i = 0; i < res.body.sedentary_minutes.length; i++) {
                                expect(res.body.sedentary_minutes[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                                expect(res.body.sedentary_minutes[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                            }
                            for (let i = 0; i < res.body.steps.length; i++) {
                                if(res.body.steps[i].value == 0){
                                    countSteps++
                                }
                            }

                            expect(countSteps).to.eql(3)
                            expect(countCalories).to.eql(3)
                        })
                })
            })
        })// get physical activity successfully

        describe('when a validation error occurs', () => {

            it('logs.get_all009: should return status code 400 and info message from invalid year in date', () => {
                const date_start = '20199-05-05' // initial date the search will be performed with year wrong
                const date_end = '2019-08-08' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_DATE(date_start))
                    })
            })

            it('logs.get_all010: should return status code 400 and info message from invalid month in date', () => {
                const date_start = '2019-10-05' // initial date the search will be performed
                const date_end = '2019-13-05' // final date the search will be performed with month wrong

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_DATE(date_end))
                    })
            })

            it('logs.get_all011: should return status code 400 and info message from from invalid day in date', () => {
                const date_start = '2019-08-32' // initial date the search will be performed with day wrong
                const date_end = '2019-05-07'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body.code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(err.body.message).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_DATE(date_start).message)
                    })
            })

            it('logs.get_all012: should return status code 400 and info message from invalid child_id', () => {
                const INVALID_ID = '123'// invalid id of the child
                const date_start = '2019-03-01'// initial date the search will be performed
                const date_end = '2019-04-10'// final date the search will be performed

                return request(URI)
                    .get(`/children/${INVALID_ID}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('logs.get_all013: should return status code 400 and info message from validation error, because child not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'// non existent id of the child
                const date_start = '2019-09-05'// initial date the search will be performed
                const date_end = '2019-10-05'// final date the search will be performed

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.LOGS.ERROR_400_CHILD_NOT_FOUND(NON_EXISTENT_ID))
                    })
            })
        })// validation error occurs

        describe('when the child try to view all logs for each resource from another child', () => {

            it('logs.get_all014: should return status code 403 and info message from insufficient permissions for another child user', async () => {
                const date_start = '2019-02-10'// initial date the search will be performed
                const date_end = '2019-03-15'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when not informed the acess token', () => {

            it('logs.get_all015: should return the status code 401 and the authentication failure informational message', () => {
                const date_start = '2020-02-10'// initial date the search will be performed
                const date_end = '2020-03-15'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})

function getArrLogs(dateStart: string, type: LogType, amount: number) { 
    const oldDate = new Date(dateStart)
    const body: any = []

    for (let i = 0; i < amount; i++) {
        const atualDate = new Date(oldDate.setDate(oldDate.getDate() + 1))
        const month = atualDate.getMonth() + 1

        let monthString = month.toString()
        const day = atualDate.getDate()

        let dayString = day.toString()

        // Pass the month to the valid format
        if (monthString.length === 1) {
            monthString = "0" + monthString
        }

        // Pass the day to the valid format
        if (dayString.length === 1) {
            dayString = "0" + dayString
        }

        const dateString = `${atualDate.getFullYear()}-${monthString}-${dayString}`
        const mock = new LogMock(type)
        mock.date = dateString
        body.push(mock)
    }
    return body
}
