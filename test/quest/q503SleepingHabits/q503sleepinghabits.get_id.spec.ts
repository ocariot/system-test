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
    let accessAnotherChildToken: string
    let accessTokenAnotherHealthProfessional: string
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

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessAnotherChildToken = tokens.child.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherHealthProfessional = tokens.health_professional.access_token
            accessTokenAnotherFamily = tokens.family.access_token

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

            if (defaultApplication.username && defaultApplication.password) {
                accessDefaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            // Associating defaultChildrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from q503sleepinghabits.get_id test: ', err.message)
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

    describe('GET /q503sleepinghabits/:q503sleepinghabits.id', () => {

        beforeEach(async () => {
            try {
                Q503SleepingHabits.child_id = defaultChild.id
                const resultQ503SleepingHabits = await quest.saveQ503SleepingHabits(accessDefaultEducatorToken, Q503SleepingHabits)
                Q503SleepingHabits.id = resultQ503SleepingHabits.id
            } catch (err) {
                console.log('Failure in before from q503sleepinghabits.get_id test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ503Sleepinghabits()
            } catch (err) {
                console.log('Failure in after from q503sleepinghabits.get_id test: ', err.message)
            }
        })

        context('when get Q503SleepingHabits successfully', () => {

            it('q503sleepinghabits.get_id001: should return status code 200 and the Q503SleepingHabits for admin user', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('q503sleepinghabits.get_id002: should return status code 200 and the Q503SleepingHabits for educator', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('q503sleepinghabits.get_id003: should return status code 200 and the Q503SleepingHabits for health professional', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('q503sleepinghabits.get_id004: should return status code 200 and the Q503SleepingHabits for family', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('q503sleepinghabits.get_id005: should return status code 200 and the Q503SleepingHabits for application', async () => {

                const questionnaire: any = Q503SleepingHabits.fromJSON(Q503SleepingHabits)

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

        }) // getting a Q503SleepingHabits successfully

        context('when the Q503SleepingHabits not found', () => {

            it('q503sleepinghabits.get_id006: should return an error, because Q503SleepingHabits.id is invalid', async () => {

                const INVALID_ID = '123'

                return request(URI)
                    .get(`/q503sleepinghabits/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.get_id007: should return an error, because Q503SleepingHabits not found', async () => {

                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .get(`/q503sleepinghabits/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get Q503SleepingHabits of a specific child', () => {

            it('q503sleepinghabits.get_id008: should return status code 403 and info message from insufficient permissions for child', async () => {

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.get_id009: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessAnotherChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('q503sleepinghabits.get_id010: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherHealthProfessional))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q503sleepinghabits.get_id011: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q503sleepinghabits.get_id012: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
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
            it('q503sleepinghabits.get_id013: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/q503sleepinghabits/${Q503SleepingHabits.id}`)
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

                    const resultQuestionnaire = await quest.saveQ503SleepingHabits(accessDefaultEducatorToken, questionnaire)
                    questionnaire.id = resultQuestionnaire.id

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from q503sleepinghabits.get_id test: ', err.message)
                }
            })
            it('q503sleepinghabits.get_id014: should return an error, because Q503SleepingHabits not found', async () => {

                return request(URI)
                    .get(`/q503sleepinghabits/${questionnaire.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})