import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
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
import { Q21ChildsHealthConditionsMock } from '../../mocks/quest-service/q21childshealthconditions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q21ChildsHealthConditions', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAnotherFamily: string

    let accessTokenAdmin: string
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

    const defaultQ21ChildsHealthConditions: Q21ChildsHealthConditionsMock = new Q21ChildsHealthConditionsMock(defaultChild)

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherFamily = tokens.family.access_token

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

            defaultQ21ChildsHealthConditions.child_id = resultDefaultChild.id

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            // getting tokens for each 'default user'
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

        } catch (err) {
            console.log('Failure on Before from q21childshealthconditions.post test: ', err.message)
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

    describe('POST /q21childshealthconditions', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ21ChildsHealthCondition()
            } catch (err) {
                console.log('Failure in q21childshealthconditions.post test: ', err.message)
            }
        })

        context('when the user posting a Q21ChildsHealthConditions successfully', () => {

            it('q21childshealthconditions.post001: should return status code 200 and the saved Q21ChildsHealthConditions by the family user', () => {

                const defaultQ21ChildsHealthConditionsJSON: any = defaultQ21ChildsHealthConditions.fromJSON(defaultQ21ChildsHealthConditions)
                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultQ21ChildsHealthConditionsJSON)
                    })
            })

        }) // posting a Q21ChildsHealthConditions successfully

        context('when a validation error occurs', () => {

            let incorrectQ21ChildsHealthConditions: any

            beforeEach(async () => {
                try {
                    incorrectQ21ChildsHealthConditions = getIncorrectQ21ChildsHealthConditionsJSON()
                } catch (err) {
                    console.log('Failure on Before in q21childshealthconditions.post test: ', err.message)
                }
            })

            it('q21childshealthconditions.post002: should return an error, because child_id is invalid', () => {
                incorrectQ21ChildsHealthConditions.child_id = '123'

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post003: should return an error, because child not exist', () => {
                incorrectQ21ChildsHealthConditions.child_id = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('q21childshealthconditions.post004: should return an error, because date is null', () => {
                incorrectQ21ChildsHealthConditions.date = null

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post005: should return an error, because child_id is null', () => {
                incorrectQ21ChildsHealthConditions.child_id = null

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post006: should return an error, because percentage is null', () => {
                incorrectQ21ChildsHealthConditions.percentage = null

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post007: should return an error, because ch_hypertension is null', () => {
                incorrectQ21ChildsHealthConditions.ch_hypertension = null

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('q21childshealthconditions.post008: should return an error, because ch_diabetes is a number', () => {
                incorrectQ21ChildsHealthConditions.ch_diabetes = 1

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post009: should return an error, because weight_birth is a boolean', () => {
                incorrectQ21ChildsHealthConditions.weight_birth = false

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

            it('q21childshealthconditions.post010: should return an error, because date format is invalid', () => {
                incorrectQ21ChildsHealthConditions.date = '2019/12/03T15:28:47.319Z'

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post011: should return an error, because month is invalid', () => {
                incorrectQ21ChildsHealthConditions.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the user does not have permission for register Q21ChildsHealthConditions', () => {

            it('q21childshealthconditions.post012: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q21childshealthconditions.post013: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q21childshealthconditions.post014: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q21childshealthconditions.post015: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q21childshealthconditions.post016: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q21childshealthconditions.post017: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q21childshealthconditions')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(defaultQ21ChildsHealthConditions)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        context('when posting a new Q21ChildsHealthConditions for another user that not to be a child', () => {

            let Q21ChildsHealthConditionsForOtherUsers: Q21ChildsHealthConditionsMock = new Q21ChildsHealthConditionsMock(defaultChild)

            it('q21childshealthconditions.post018: should return an error, when try create a Q21ChildsHealthConditions for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()
                Q21ChildsHealthConditionsForOtherUsers.child_id = ADMIN_ID

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q21ChildsHealthConditionsForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post019: should return an error, when try create a Q21ChildsHealthConditions for educator', () => {

                Q21ChildsHealthConditionsForOtherUsers.child_id = defaultEducator.id

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q21ChildsHealthConditionsForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post020: should return an error, when try create a Q21ChildsHealthConditions for health professional', () => {

                Q21ChildsHealthConditionsForOtherUsers.child_id = defaultHealthProfessional.id

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q21ChildsHealthConditionsForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post021: should return an error, when try create a Q21ChildsHealthConditions for family', () => {

                Q21ChildsHealthConditionsForOtherUsers.child_id = defaultFamily.id

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q21ChildsHealthConditionsForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q21childshealthconditions.post022: should return an error, when try create a Q21ChildsHealthConditions for application', () => {

                Q21ChildsHealthConditionsForOtherUsers.child_id = defaultApplication.id

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q21ChildsHealthConditionsForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        }) // another user that not to be a child        

        describe('when not informed the acess token', () => {
            it('q21childshealthconditions.post023: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            it('q21childshealthconditions.post024: should return an error, because child not exist', async () => {

                defaultQ21ChildsHealthConditions.child_id = defaultChild.id
                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .post('/q21childshealthconditions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQ21ChildsHealthConditions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})

function getIncorrectQ21ChildsHealthConditionsJSON() {

    const JSON = {
        id: 'e3cb6457ff13446ac446af6d',
        date: '2019-11-07T19:40:45.124Z',
        child_id: '5e5d69c09e1694001a57ccbf',
        ch_hypertension: 'No',
        ch_diabetes: 'No',
        ch_hypercholesterolemia: 'No',
        ch_asthma: 'No',
        ch_other1: 'No',
        ch_other2: '',
        ch_celiac: 'No',
        ch_lactose: 'No',
        ch_food_allergy: 'No',
        ch_egg_allergy: 'No',
        ch_milk_allergy: 'No',
        ch_other_allergy1: 'No',
        ch_other_allergy2: '',
        weight_height_birth: 'No',
        weight_birth: 0,
        height_birth: 0,
        breastfeeding_practice: 'Dont know',
        breastfeeding_practice_other: '',
        breastfeeding_exclusive: 'Dont know',
        breastfeeding_exclusive_other: '',
        percentage: 'Percentage of realization',
        state: 'Complete'
    }

    return JSON
}