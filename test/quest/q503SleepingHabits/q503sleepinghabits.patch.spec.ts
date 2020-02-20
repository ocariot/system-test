import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { quest } from '../../utils/quest.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { questionnaireDB } from '../../../src/quizzes/database/quests.db'
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
import { Q503SleepingHabitsMock } from '../../mocks/quest-service/q503sleepinghabits.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q503SleepingHabits', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenAnotherEducator: string
    let accessTokenAnotherFamily: string

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
    const anotherChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const Q503SleepingHabits: Q503SleepingHabitsMock = new Q503SleepingHabitsMock()

    const Q503SleepingHabits2: Q503SleepingHabitsMock = new Q503SleepingHabitsMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token
            accessDefaultApplicationToken = tokens.application.access_token

            // Save institution and associating all user for her
            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            anotherChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution
            defaultApplication.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            defaultFamily.children = new Array<Child>(resultDefaultChild, resultAnotherChild)
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild, resultAnotherChild)

            // Registering users
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

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            // Associating defaultChildrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from q503sleepinghabits.patch test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await questionnaireDB.removeCollections()
            await accountDB.dispose()
            await questionnaireDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('PATCH /q503sleepinghabits/:q503sleepinghabits.id', () => {

        beforeEach(async () => {
            try {
                Q503SleepingHabits.child_id = defaultChild.id
                const resultQ503SleepingHabits = await quest.saveQ503SleepingHabits(accessDefaultEducatorToken, Q503SleepingHabits)
                Q503SleepingHabits.id = resultQ503SleepingHabits.id
            } catch (err) {
                console.log('Failure in before from q503sleepinghabits.patch test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ503Sleepinghabits()
            } catch (err) {
                console.log('Failure in after from q503sleepinghabits.patch test: ', err.message)
            }
        })

        context('when update Q503SleepingHabits successfully', () => {

            it('q503sleepinghabits.patch001: should return status code 204 and no content for educator user', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                const newDate = new Date()
                questionnaire.date = newDate.toISOString()
                questionnaire.time_sleep = 'Depois das 12 pm'
                questionnaire.time_wake_up = 'Depois das 9am'

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

            it('q503sleepinghabits.patch002: should return status code 204 and no content for family', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.id = 'questionario_id' // even though it was passed in the request, the id of the kept questionnaire is what was originally saved
                questionnaire.time_sleep = ''
                questionnaire.time_nap = 'false'
                questionnaire.state = 'Incomplete'

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

        }) // getting a Q503SleepingHabits successfully

        context('when a error occurs', () => {
            it('q503sleepinghabits.patch003: should return an error, because the object is empty ', async () => {

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch004: should return an error, because the date format is invalid', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.date = '02/12/2019'

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch005: should return an error, because time_sleep is a null', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.time_sleep = null

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch006: should return an error, because time_wake_up is a number', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.time_wake_up = 10

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch007: should return an error, because child id is empty', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.child_id = ''

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch008: should return an error, because percentage is a number', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.percentage = 1

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch009: should return an error, because date is null', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                questionnaire.date = null

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        describe('when a duplicate occurs', () => {
            before(async () => {
                try {
                    await quest.saveQ503SleepingHabits(accessDefaultEducatorToken, Q503SleepingHabits2)
                } catch (err) {
                    console.log('Failure in Before from q503sleepinghabits.patch test: ', err.message)
                }
            })
            it('q503sleepinghabits.patch010: should return an error, because the Q503Sleepinghabits is already registered', () => {

                const questionnaireDuplicated: any = Q503SleepingHabits2.fromJSON(Q503SleepingHabits2)

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaireDuplicated)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the updated Q503SleepingHabits not exist', () => {

            it('q503sleepinghabits.patch011: should return an error, because Q503SleepingHabits.id is invalid', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                const INVALID_ID = '123'

                return request(URI)
                    .patch(`/q503sleepinghabits/${INVALID_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.patch012: should return an error, because Q503SleepingHabits not found', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)
                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .patch(`/q503sleepinghabits/${NON_EXISTENT_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get Q503SleepingHabits of a specific child', () => {

            it('q503sleepinghabits.patch013: should return status code 403 and info message from insufficient permissions for admin', () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.patch014: should return status code 403 and info message from insufficient permissions for child', () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.patch015: should return status code 403 and info message from insufficient permissions for health professional', () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.patch016: should return status code 403 and info message from insufficient permissions for application', () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q503sleepinghabits.patch017: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                    return request(URI)
                        .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                        .send(questionnaire)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q503sleepinghabits.patch018: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                    return request(URI)
                        .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                        .send(questionnaire)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('q503sleepinghabits.patch019: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            const child: Child = new ChildMock()
            const questionnaire: Q503SleepingHabitsMock = new Q503SleepingHabitsMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    const resultQuestionnaire = await quest.saveQ503SleepingHabits(childToken, questionnaire)
                    questionnaire.id = resultQuestionnaire.id

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from q503sleepinghabits.patch test: ', err.message)
                }
            })
            it('q503sleepinghabits.patch020: should return an error, because child not exist', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .patch(`/q503sleepinghabits/${questionnaire.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})