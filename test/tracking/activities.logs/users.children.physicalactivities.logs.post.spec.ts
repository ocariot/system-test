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
    const AMOUNT_LOGS = 10 // amount of logs that will be inserted into the array correctLogs and mixedLogs

    // Mock correct logs array
    const correctLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < AMOUNT_LOGS; i++) {
        correctLogsArr.push(new LogMock())
    }

    // Mocks correct and incorrect logs array
    const mixedLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < AMOUNT_LOGS; i++) {
        mixedLogsArr.push(new LogMock())
    }

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

            const resultChild: any = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            accessTokenChild = await acc.auth(defaultChild.username!, defaultChild.password!)

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
            console.log('DB ERROR', err)
        }
    })

    describe('POST /users/children/:child_id/physicalactivities/logs/:resource', () => {

        context('when posting a new Log with success', () => {
            let body: any = []

            beforeEach(async () => {
                try {
                    body.length = 0
                    correctLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })
            afterEach(async () => {
                try {
                    await trackingDB.deletePhysicalActivitiesLogs()
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })

            it('logs.post001: should return status code 201 and the saved log by the child user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('logs.post002: should return status code 201 and the saved log by the educator user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('logs.post003: should return status code 201 and the saved log by the family user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('logs.post004: should return status code 201 and the saved log by the application user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        }) //user posting new log successfully

        context('when a validation error occurs', () => {
            let body: any = []

            beforeEach(async () => {
                try {
                    body.length = 0
                    mixedLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })
            afterEach(async () => {
                try {
                    await trackingDB.deletePhysicalActivitiesLogs()
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })


            it('logs.post005: should return status code 400 and info message from validation error, because log date is not provided ', () => {

                // Incorrect Log without date
                const Log5: any = {
                    value: 2303
                }

                body.push(Log5)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(body[i].date)
                            expect(res.body.success[i].item.value).to.eql(body[i].value)
                        }


                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Required fields were not provided...')
                            expect(res.body.error[i].description).to.eql('Physical Activity log validation failed: date is required!')
                            expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                        }

                    })
            })

            it('logs.post006: should return status code 400 and info message from validation error, because log value is not provided', () => {

                // Incorrect Log without value
                const Log4: any = {
                    date: '2019-06-06'
                }

                body.push(Log4)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(body[i].date)
                            expect(res.body.success[i].item.value).to.eql(body[i].value)
                        }


                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Required fields were not provided...')
                            expect(res.body.error[i].description).to.eql('Physical Activity log validation failed: value is required!')
                            expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                        }
                    })
            })

            it('logs.post007: should return status code 400 and info message from validation error, because all required parameters does not provided', () => {

                // incorrect log without all parameters
                const Log0: any = {

                }

                body.push(Log0)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(body[i].date)
                            expect(res.body.success[i].item.value).to.eql(body[i].value)
                        }


                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Required fields were not provided...')
                            expect(res.body.error[i].description).to.eql('Physical Activity log validation failed: date, value is required!')
                            expect(res.body.error[i].item).to.eql({})
                        }
                    })
            })

            context('when invalid dates are provided', () => {

                it('logs.post008: should return status code 400 and info message from validation error, because the year given in date of the log is invalid', () => {
                    const Log1: any = {
                        date: '20199-05-08', // incorrect date with year wrong
                        value: 5200
                    }

                    body.push(Log1)

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .send(body)
                        .expect(201)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(201)
                                expect(res.body.success[i].item.date).to.eql(body[i].date)
                                expect(res.body.success[i].item.value).to.eql(body[i].value)
                            }

                            expect(res.body.error[0].message).to.eql(`Date parameter: ${body[AMOUNT_LOGS].date}, is not in valid ISO 8601 format.`)
                            expect(res.body.error[0].description).to.eql('Date must be in the format: yyyy-MM-dd')

                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(400)
                                expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                                expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                            }
                        })
                })

                // In the current version of the API, if month on the log date is invalid the system catches the error as if the child ID were invalid, so this test will fail
                it('logs.post09: should return status code 400 and info message from validation error, because the month given in date of the log is invalid', () => {
                    const Log01: any = {
                        date: '2019-13-05', // incorrect date with month wrong
                        value: 2500
                    }

                    body.push(Log01)

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .send(body)
                        .expect(201)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(201)
                                expect(res.body.success[i].item.date).to.eql(body[i].date)
                                expect(res.body.success[i].item.value).to.eql(body[i].value)
                            }

                            expect(res.body.error[0].message).to.eql(`Date parameter: ${body[AMOUNT_LOGS].date}, is not in valid ISO 8601 format.`)
                            expect(res.body.error[0].description).to.eql('Date must be in the format: yyyy-MM-dd')

                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(400)
                                expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                                expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                            }
                        })
                })

                // In the current version of the API, if day on the log date is invalid the system catches the error as if the child ID were invalid, so this test will fail
                it('logs.post010: should return status code 400 and info message from validation error, because the day given in date of the log is invalid', () => {

                    const Log001: any = {
                        date: '2019-08-32', // incorrect date with day wrong
                        value: 1458
                    }

                    body.push(Log001)

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.CALORIES}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .send(body)
                        .expect(201)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(201)
                                expect(res.body.success[i].item.date).to.eql(body[i].date)
                                expect(res.body.success[i].item.value).to.eql(body[i].value)
                            }
                            body[3].date

                            expect(res.body.error[0].message).to.eql(`Date parameter: ${body[AMOUNT_LOGS].date}, is not in valid ISO 8601 format.'`)
                            expect(res.body.error[0].description).to.eql('Date must be in the format: yyyy-MM-dd')

                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(400)
                                expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                                expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                            }
                        })
                })

            })

            it('logs.post011: should return status code 400 and info message from validation error, because log value is negative', () => {

                const Log2: any = {
                    date: '2019-09-10',
                    value: -1550 // incorrect value with value negative
                }

                body.push(Log2)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.CALORIES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(body[i].date)
                            expect(res.body.success[i].item.value).to.eql(body[i].value)
                        }

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Value field is invalid...')
                            expect(res.body.error[i].description).to.eql('Physical Activity log validation failed: The value provided has a negative value!')
                            expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                            expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                        }
                    })
            })

            it('logs.post012: should return status code 400 and info message from validation error, because log value is a string', () => {

                const Log3: any = {
                    date: '2019-08-08',
                    value: 'invalid-value' // incorrect value with string in value
                }

                body.push(Log3)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(body[i].date)
                            expect(res.body.success[i].item.value).to.eql(body[i].value)
                        }


                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Value field is invalid...')
                            expect(res.body.error[i].description).to.eql('Physical Activity log validation failed: The value received is not a number')
                            expect(res.body.error[i].item.date).to.eql(body[i + AMOUNT_LOGS].date)
                            expect(res.body.error[i].item.value).to.eql(body[i + AMOUNT_LOGS].value)
                        }
                    })
            })

            it('logs.post013: should return status code 400 and info message from validation error, because specified resource does not exist', () => {
                const invalid_resource = 'WALKING-SKATE'

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${invalid_resource}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql(`The name of type provided "${invalid_resource}" is not supported...`)
                            expect(res.body.error[i].description).to.eql('The names of the allowed types are: steps, calories, active_minutes.')
                        }
                    })
            })

            it('logs.post014: should return status code 400 and info message from validation error, because child_id is invalid', () => {

                return request(URI)
                    .post(`/users/children/${acc.INVALID_ID}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(201)
                    .then(res => {
                        expect(res.body.success.length).to.eql(0)

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('Parameter {child_id} is not in valid format!')
                            expect(res.body.error[i].description).to.eql('A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.')
                            expect(res.body.error[i].item.date).to.eql(body[i].date)
                            expect(res.body.error[i].item.value).to.eql(body[i].value)
                        }
                    })
            })

            // In the current version of the API the system will log for any valid ID, so this test will fail
            it('logs.post015: should return status code 400 and info message from validation error, because child not exist', () => {

                return request(URI)
                    .post(`/users/children/${acc.NON_EXISTENT_ID}/physicalactivities/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .then(res => {
                        expect(res.body.success.length).to.eql(0)

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(400)
                            expect(res.body.error[i].message).to.eql('???????')
                            expect(res.body.error[i].description).to.eql('???????')
                            expect(res.body.error[i].item.date).to.eql(body[i].date)
                            expect(res.body.error[i].item.value).to.eql(body[i].value)
                        }
                    })
            })

            // In the current version of the API the system allows one child to log a log for another child, so this test will fail
            describe('when the child posting a new Log for another child', () => {

                it('logs.post016: should return status code 403 and informational message that child not have permission', async () => {

                    const anotherChild: Child = new ChildMock()
                    let anotherChildToken

                    anotherChild.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, anotherChild)
                    anotherChildToken = await acc.auth(anotherChild.username!, anotherChild.password!)

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.CALORIES}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(anotherChildToken))
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the user does not have permission for register Log', () => {

                it('logs.post017: should return status code 403 and info message from insufficient permissions for admin user', () => {

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })

                it('logs.post018: should return status code 403 and info message from insufficient permissions for health professionals', () => {

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })
            })// does not have permission

            describe('when not informed the acess token', () => {

                it('logs.post019: should return the status code 401 and the authentication failure informational message', () => {

                    return request(URI)
                        .post(`/users/children/${defaultChild.id}/physicalactivities/logs/${LogType.CALORIES}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer ')
                        .send(body)
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })
            })
        })
    })
})

