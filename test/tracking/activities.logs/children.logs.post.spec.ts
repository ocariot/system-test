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
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { Educator } from '../../../src/account-service/model/educator'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { acc } from '../../utils/account.utils'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: children.physicalactivities.logs', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string
    let accessTokenAnotherChild: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const anotherChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()
    const defaultFamily: Family = new FamilyMock()
    const AMOUNT_LOGS = 5 // amount of logs that will be inserted into the array correctLogs and mixedLogs
    
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
            defaultEducator.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            const resultChild: any = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id
            
            const resultAnotherChild: any = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id
            
            defaultChildrenGroup.children = new Array<Child>(resultChild, resultAnotherChild)
            defaultFamily.children = new Array<Child>(resultChild, resultAnotherChild)
            
            const resultEducator: any = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id
            
            const resultFamily: any = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id
            

            if (defaultChild.username && defaultChild.password) {
                accessTokenChild = await acc.auth(defaultChild.username, defaultChild.password)
            }
            
            if (anotherChild.username && anotherChild.password) {
                accessTokenAnotherChild = await acc.auth(anotherChild.username, anotherChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessTokenEducator = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessTokenFamily = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            await acc.saveChildrenGroupsForEducator(accessTokenEducator, defaultEducator, defaultChildrenGroup)

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

    describe('POST /children/:child_id/logs/:resource', () => {

        context('when posting a new Log with success', () => {
            let correctLogsArr: Array<Log> // Mock correct logs array

            beforeEach(async () => {
                correctLogsArr = new Array<Log>()
                for (let i = 0; i < AMOUNT_LOGS; i++) correctLogsArr.push(new LogMock())
            })
            afterEach(async () => {
                try {
                    await trackingDB.deletePhysicalActivitiesLogs()
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })

            it('children.logs.post001: should return status code 207 and the saved log by the child user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(correctLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('children.logs.post002: should return status code 207 and the saved log by the educator user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .send(correctLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('children.logs.post003: should return status code 207 and the saved log by the family user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .send(correctLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('children.logs.post004: should return status code 207 and the saved log by the application user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .send(correctLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
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
            let mixedLogsArr: Array<Log>

            beforeEach(async () => {
                mixedLogsArr = new Array<Log>()
                for (let i = 0; i < AMOUNT_LOGS; i++) mixedLogsArr.push(new LogMock())
            })
            afterEach(async () => {
                try {
                    await trackingDB.deletePhysicalActivitiesLogs()
                } catch (err) {
                    console.log('Failure in physical.activities.log.post test: ', err.message)
                }
            })


            it('children.logs.post005: should return status code 207 and info message from validation error, because log date is not provided ', () => {

                // Incorrect Log without date
                const Log: any = {
                    value: 2303
                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.SEDENTARY_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }
                        
                        expect(res.body.error[0].item.value).to.eql(Log.value)
                        delete res.body.error[0].item

                        expect(res.body.error[0]).to.eql(ApiGatewayException.LOGS.ERROR_400_DATE_IS_REQUIRED)

                    })
            })

            it('children.logs.post006: should return status code 207 and info message from validation error, because log value is not provided', () => {

                // Incorrect Log without value
                const Log: any = {
                    date: '2019-06-06'
                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        expect(res.body.error[0].item.date).to.eql(Log.date)
                        delete res.body.error[0].item

                        expect(res.body.error[0]).to.eql(ApiGatewayException.LOGS.ERROR_400_VALUE_IS_REQUIRED)
                    })
            })

            it('children.logs.post007: should return status code 207 and info message from validation error, because all required parameters does not provided', () => {

                // incorrect log without all parameters
                const Log: any = {

                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        expect(res.body.error[0].item).to.eql({})
                        delete res.body.error[0].item

                        expect(res.body.error[0]).to.eql(ApiGatewayException.LOGS.ERROR_400_DATE_AND_VALUE_IS_REQUIRED)
                    })
            })

            it('children.logs.post008: should return status code 207 and info message from validation error, because the year given in date of the log is invalid', () => {

                const Log: any = {
                    date: '20199-05-08', // incorrect date with year wrong
                    value: 5200
                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        expect(res.body.error[0].item.value).to.eql(Log.value)
                        expect(res.body.error[0].item.date).to.eql(Log.date)
                        delete res.body.error[0].item

                        expect(res.body.error[0]).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_DATE(Log.date))
                    })
            })

            it('children.logs.post009: should return status code 207 and info message from validation error, because log value is negative', () => {

                const Log: any = {
                    date: '2019-09-10',
                    value: -1550 // incorrect value with value negative
                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        delete res.body.error[0].item
                        expect(res.body.error[0]).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_NUMBER_GREATHER_THAN_OR_EQUALS_TO_ZERO('value'))
                    })
            })

            it('children.logs.post010: should return status code 207 and info message from validation error, because log value is a string', () => {

                const Log: any = {
                    date: '2019-08-08',
                    value: 'invalid-value' // incorrect value with string in value
                }

                mixedLogsArr.push(Log)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.STEPS}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(201)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        delete res.body.error[0].item
                        expect(res.body.error[0]).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_NUMBER_GREATHER_THAN_OR_EQUALS_TO_ZERO('value'))
                    })
            })

            it('children.logs.post011: should return status code 207 and info message from validation error, because specified resource does not exist', () => {
                const invalid_resource = 'WALKING-SKATE'

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${invalid_resource}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        expect(res.body.success.length).to.eql(0)
                        res.body.error.map(error => delete error.item)

                        res.body.error.forEach(error => {
                            expect(error).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_RESOURCE)
                        })
                    })
            })

            it('children.logs.post012: should return status code 207 and in the body info message from validation error', () => {
                const incorrectLogsArr = new Array<Log>()

                const Log1: any = {
                    date: '2019-08-08',
                    value: 'values is string' // incorrect value with string in value
                }

                const Log2: any = {
                    date: '2019-09-10',
                    value: -2500 // incorrect value with value negative
                }

                const Log3: any = {
                    date: '2019-05-35', // incorrect date with year wrong
                    value: 5200
                }

                incorrectLogsArr.push(Log1, Log2, Log3)

                return request(URI)
                    .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(incorrectLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        expect(res.body.success.length).to.eql(0)

                        res.body.error.map(error => delete error.item)
                        expect(res.body.error[0]).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_NUMBER_GREATHER_THAN_OR_EQUALS_TO_ZERO('value'))
                        expect(res.body.error[1]).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_NUMBER_GREATHER_THAN_OR_EQUALS_TO_ZERO('value'))
                        
                        expect(res.body.error[2].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[2].message).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_DATE(Log3.date).message)

                    })
            })

            it('children.logs.post013: should return status code 207 and info message from validation error, because child_id is invalid', () => {
                const INVALID_ID = '123' // invalid id of the child

                return request(URI)
                    .post(`/children/${INVALID_ID}/logs/${LogType.LIGHTLY_ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.MULTI_STATUS)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID.code)
                            expect(res.body.error[i].message).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID.message)
                            expect(res.body.error[i].description).to.eql(ApiGatewayException.LOGS.ERROR_400_INVALID_CHILD_ID.description)
                            expect(res.body.error[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.error[i].item.value).to.eql(mixedLogsArr[i].value)
                        }
                        expect(res.body.success.length).to.eql(0)
                    })
            })

            it('children.logs.post014: should return status code 403 and info message from validation error, because the non-existent child id does not match to user id.', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child

                return request(URI)
                    .post(`/children/${NON_EXISTENT_ID}/logs/${LogType.ACTIVE_MINUTES}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(mixedLogsArr)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            context('when the user does not have permission for register Log', () => {

                // In the current version of the API the system allows one child to log a log for another child, so this test will fail
                it('children.logs.post015: should return status code 403 and info message from insufficient permissions for another child user', async () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                        .send(mixedLogsArr)
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('children.logs.post016: should return status code 403 and info message from insufficient permissions for admin user', () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .send(mixedLogsArr)
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })

                it('children.logs.post017: should return status code 403 and info message from insufficient permissions for health professionals', () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/logs/${LogType.STEPS}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .send(mixedLogsArr)
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })
            })// does not have permission

            context('when not informed the acess token', () => {

                it('children.logs.post018: should return the status code 401 and the authentication failure informational message', () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/logs/${LogType.CALORIES}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer ')
                        .send(mixedLogsArr)
                        .expect(HttpStatus.UNAUTHORIZED)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })
            })
        })
    })
})

