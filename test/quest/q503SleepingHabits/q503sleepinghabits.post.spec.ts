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
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Q503SleepingHabitsMock } from '../../mocks/quest-service/q503sleepinghabits.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q503SleepingHabits', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenAnotherChild: string
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
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const defaultQ503SleepingHabits: Q503SleepingHabitsMock = new Q503SleepingHabitsMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherChild = tokens.child.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token

            // Save institution and associating all user for her
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
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)

            // Associating Q503SleepingHabits with the child
            defaultQ503SleepingHabits.child_id = defaultChild.id

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
            console.log('Failure on Before from q503sleepinghabits.post test: ', err.message)
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

    describe('POST /q503sleepinghabits', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ503Sleepinghabits()
            } catch (err) {
                console.log('Failure on Before in q503sleepinghabits.post test: ', err.message)
            }
        })

        context('when the user posting a Q503Sleepinghabits for the child successfully', () => {
            let q503SleepingHabits: Q503SleepingHabitsMock
            let q503SleepingHabitsJSON: any

            beforeEach(async () => {
                try {
                    q503SleepingHabits = new Q503SleepingHabitsMock()
                    q503SleepingHabits.child_id = defaultChild.id
                    q503SleepingHabitsJSON = q503SleepingHabits.fromJSON(q503SleepingHabits)
                } catch (err) {
                    console.log('Failure on Before in q503sleepinghabits.post test: ', err.message)
                }
            })

            it('q503sleepinghabits.post002: should return status code 200 and the saved Q503Sleepinghabits by the educator', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(q503SleepingHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(q503SleepingHabitsJSON)
                    })
            })

            it('q503sleepinghabits.post003: should return status code 200 and the saved Q503Sleepinghabits by the family', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(q503SleepingHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(q503SleepingHabitsJSON)
                    })
            })

            it('q503sleepinghabits.post005: should return status code 200, even when provided a invalid id for the Q503Sleepinghabits', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.id = '123'

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(incorrectQ503SleepingHabits)
                    })
            })

        }) // posting a Q503Sleepinghabits  successfully

        describe('when the posting a empty Object for the child', () => {
            it('q503sleepinghabits.post006: should return status code 200 and the saved a Q503Sleepinghabits only with auto-generated id and date fields', () => {

                const body = {}

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(body)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                    })
            })
        })

        describe('when posting the same Q503Sleepinghabits twice for the same child', () => {
            before(async () => {
                try {
                    defaultQ503SleepingHabits.child_id = defaultChild.id
                    await quest.saveQ503SleepingHabits(accessDefaultEducatorToken, defaultQ503SleepingHabits)
                } catch (err) {
                    console.log('Failure in q503sleepinghabits.post test: ', err.message)
                }
            })
            it('q503sleepinghabits.post007: should return an error, because the same Q503Sleepinghabits already registered for the child', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('q503sleepinghabits.post008: should return an error, because child_id is invalid', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.child_id = '123'

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post009: should return an error, because child not exist', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.child_id = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('q503sleepinghabits.post010: should return an error, because date is null', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.date = null

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post011: should return an error, because child_id is null', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.child_id = null

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post012: should return an error, because percentage is null', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.percentage = null

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('q503sleepinghabits.post013: should return an error, because time_sleep is a number', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.time_sleep = 1

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post014: should return an error, because time_nap is a boolean', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.time_nap = true

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

            it('q503sleepinghabits.post015: should return an error, because date format is invalid', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.date = '2019/12/03T15:28:47.319Z'

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post016: should return an error, because month is invalid', () => {
                const incorrectQ503SleepingHabits = getQ503SleepingHabitsJSON()
                incorrectQ503SleepingHabits.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the user does not have permission for register Q503Sleepinghabits', () => {

            it('q503sleepinghabits.post001: should return status code 200 and the saved Q503Sleepinghabits for child', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.post004: should return status code 200 and the saved Q503Sleepinghabits by the application', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.post017: should return status code 403 and info message from insufficient permissions for admin', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.post018: should return status code 403 and info message from insufficient permissions for Health Professional', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q503sleepinghabits.post019: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q503sleepinghabits.post020: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q503sleepinghabits')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(defaultQ503SleepingHabits)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q503sleepinghabits.post021: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q503sleepinghabits')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(defaultQ503SleepingHabits)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

        context('when posting a new Q503Sleepinghabits for another user that not to be a child', () => {

            it('q503sleepinghabits.post022: should return an error, when try create a Q503Sleepinghabits for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()
                defaultQ503SleepingHabits.child_id = ADMIN_ID

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post023: should return an error, when try create a Q503Sleepinghabits for educator', () => {

                defaultQ503SleepingHabits.child_id = defaultEducator.id

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post024: should return an error, when try create a Q503Sleepinghabits for health professional', () => {

                defaultQ503SleepingHabits.child_id = defaultHealthProfessional.id

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post025: should return an error, when try create a Q503Sleepinghabits for family', () => {

                defaultQ503SleepingHabits.child_id = defaultFamily.id

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q503sleepinghabits.post026: should return an error, when try create a Q503Sleepinghabits for application', () => {

                defaultQ503SleepingHabits.child_id = defaultApplication.id

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        }) // another user that not to be a child

        describe('when not informed the acess token', () => {
            it('q503sleepinghabits.post027: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultQ503SleepingHabits)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            it('q503sleepinghabits.post028: should return an error, because child not exist', async () => {

                defaultQ503SleepingHabits.child_id = defaultChild.id
                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .post('/q503sleepinghabits')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ503SleepingHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

    })
})

function getQ503SleepingHabitsJSON() {

    const incorrectQ503SleepingHabitsJSON: any = {
        id: '5dd572e805560300431b1004',
        child_id: '5a62be07de34500146d9c544',
        date: '2019-11-07T19:40:45.124Z',
        percentage: 'true',
        time_sleep: 'Entre 8 pm-9 pm', //[1,5]
        time_wake_up: 'Entre 6 am-7 am',//[0,4]
        time_nap: 'true', // 1: true, 2: false
        state: 'Complete'
    }

    return incorrectQ503SleepingHabitsJSON
}