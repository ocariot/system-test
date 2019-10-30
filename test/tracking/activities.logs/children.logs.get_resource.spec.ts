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
    let anotherChildToken: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const anotherChild: Child = new ChildMock()
    const dateStartLogsSaved = '2019-01-01' // start date that logs will be saved
    const amount_dates = 10 // how many dates will the arrays have

    let logsArrSTEPS: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.STEPS, amount_dates) // array with logs of type STEPS
    let logsArrCALORIES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.CALORIES, amount_dates) // array with logs of type CALORIES
    let logsArrACTIVE_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.ACTIVE_MINUTES, amount_dates) // array with logs of type ACTIVE_MINUTES
    let logsArrLIGHTLY_ACTIVE_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.LIGHTLY_ACTIVE_MINUTES, amount_dates) // array with logs of type LIGHTLY_ACTIVE_MINUTES
    let logsArrSEDENTARY_MINUTES: Array<Log> = getArrLogs(dateStartLogsSaved, LogType.SEDENTARY_MINUTES, amount_dates) // array with logs of type SEDENTARY_MINUTES

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

            const resultAnotherChild: any = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            accessTokenChild = await acc.auth(defaultChild.username!, defaultChild.password!)
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
            console.log('Failure on Before from physicalactivities.logs.get_resource test: ', err)
        }
    })

    describe('GET /children/:child_id/logs/:resource/date/:date_start/:date_end', () => {

        context('when the user get all logs for specified resource of the child successfully', () => {

            it('logs.get_resource001: should return status code 200 and the all logs registered for specific resource for admin user', async () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-10'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.ACTIVE_MINUTES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(10)
                        for (let i = 0; i < res.body.length; i++) { 
                            expect(res.body[i].date).to.eql(logsArrACTIVE_MINUTES[i].date)
                            expect(res.body[i].value).to.eql(logsArrACTIVE_MINUTES[i].value)
                        }
                    })
            })

            it('logs.get_resource002: should return status code 200 and the all logs registered for specific resource for own child', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-03'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.CALORIES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(3)
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                    })
            })

            it('logs.get_resource003: should return status code 200 and the all logs registered for specific resource for educator user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-05'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(5)
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].date).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].date)
                            expect(res.body[i].value).to.eql(logsArrLIGHTLY_ACTIVE_MINUTES[i].value)
                        }
                    })
            })

            it('logs.get_resource004: should return status code 200 and the all logs registered for specific resource for health professional user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-08'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.SEDENTARY_MINUTES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(8)
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].date).to.eql(logsArrSEDENTARY_MINUTES[i].date)
                            expect(res.body[i].value).to.eql(logsArrSEDENTARY_MINUTES[i].value)
                        }
                    })
            })

            it('logs.get_resource005: should return status code 200 and the all logs registered for specific resource for family user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-02'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.STEPS}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].date).to.eql(logsArrSTEPS[i].date)
                            expect(res.body[i].value).to.eql(logsArrSTEPS[i].value)
                        }
                    })
            })

            it('logs.get_resource006: should return status code 200 and the all logs registered for specific resource for application user', () => {
                const date_start = '2019-01-01'// initial date the search will be performed
                const date_end = '2019-01-07'// final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.CALORIES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(7)
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].date).to.eql(logsArrCALORIES[i].date)
                            expect(res.body[i].value).to.eql(logsArrCALORIES[i].value)
                        }
                    })
            })

            it('logs.get_resource007: should return status code 200 and the number of logs for the specified date with zero values', () => {
                const date_start = '2020-01-01'// initial date the search will be performed
                const date_end = '2020-01-10'// final date the search will be performed
                let count = 0 // auxiliary variable to count how many logs were not logged for the specified date

                return request(URI)
                .get(`/children/${defaultChild.id}/logs/${LogType.CALORIES}/date/${date_start}/${date_end}`)
                .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).is.an.instanceOf(Array)
                    expect(res.body.length).to.eql(10)
                    for (let i = 0; i < res.body.length; i++) {
                        if(res.body[i].value == 0) {
                            count++
                        }
                    }
                    expect(count).to.eql(10)
                })
            })

            it('logs.get_resource008: should return status code 200 and five registered logs and five unregistered logs for specified date', () =>{
                const date_start = '2019-01-06'// initial date the search will be performed
                const date_end = '2019-01-15'// final date the search will be performed
                let count = 0 // auxiliary variable to count how many logs were not logged for the specified date

                return request(URI)
                .get(`/children/${defaultChild.id}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}/date/${date_start}/${date_end}`)
                .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).is.an.instanceOf(Array)
                    expect(res.body.length).to.eql(10)
                    for (let i = 0; i < res.body.length; i++) {
                        if(res.body[i].value == 0) {
                            count++
                        }
                    }
                    expect(count).to.eql(5)
                })
            })
        })// get physical activity successfully

        context('when a validation error occurs', () => {

            it('logs.get_resource009: should return status code 400 and info message from invalid date, because year is invalid', () => {
                const data_start = '20199-05-05' // initial date the search will be performed with year wrong
                const date_end = '2019-08-08' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.ACTIVE_MINUTES}/date/${data_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`Date parameter: ${data_start}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })

            it('logs.get_resource010: should return status code 400 and info message from invalid date, because day is invalid', () => {
                const data_start = '2019-05-35' // initial date the search will be performed with day wrong
                const date_end = '2019-08-08' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.ACTIVE_MINUTES}/date/${data_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`Date parameter: ${data_start}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })

            it('logs.get_resource011: should return status code 400 and info message from invalid child_id', () => {
                const INVALID_ID = '123' // invalid id of the child
                const date_start = '2019-08-09' // initial date the search will be performed
                const date_end = '2019-08-29' // final date the search will be performed

                return request(URI)
                    .get(`/children/${INVALID_ID}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('logs.get_resource012: should return status code 400 and info message from validation error, because child not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child
                const date_start = '2019-03-11' // initial date the search will be performed
                const date_end = '2019-05-29' // final date the search will be performed

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/logs/${LogType.STEPS}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.LOGS.ERROR_400_CHILD_NOT_FOUND)
                    })
            })

            it('logs.get_resource013: should return status code 400 and info message from validation error, because specified resource does not exist', () => {
                const invalid_resource = 'WALKING-SKATE'
                const date_start = '2019-01-11' // initial date the search will be performed
                const date_end = '2019-02-11' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${invalid_resource}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(`The name of type provided "${invalid_resource}" is not supported...`)
                        expect(err.body.description).to.eql('The names of the allowed types are: steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')
                    })
            })
        })// validation error occurs

        context('When the child try to view all logs for a specific resource from another child', () => {

            it('logs.get_resource014: should return status code 403 and informational message that child not have permission', () => {
                const date_start = '2019-07-11' // initial date the search will be performed
                const date_end = '2019-08-11' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.CALORIES}/date/${date_start}/${date_end}`)
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        })

        context('when not informed the acess token', () => {

            it('logs.get_resource015: should return the status code 401 and the authentication failure informational message', () => {
                const date_start = '2020-02-11' // initial date the search will be performed
                const date_end = '2020-03-15' // final date the search will be performed

                return request(URI)
                    .get(`/children/${defaultChild.id}/logs/${LogType.SEDENTARY_MINUTES}/date/${date_start}/${date_end}`)
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
