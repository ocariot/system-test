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
import { Q1SocioDemographicsMock } from '../../mocks/quest-service/q1SocioDemographicsMock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q1SocioDemographics', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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

    const Q1SocioDemographics: Q1SocioDemographicsMock = new Q1SocioDemographicsMock(defaultChild)

    const Q1SocioDemographics2: Q1SocioDemographicsMock = new Q1SocioDemographicsMock(defaultChild)

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
            console.log('Failure on Before from q1sociodemographics.patch test: ', err.message)
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

    describe('PATCH /q1sociodemographics/:q1sociodemographics.id', () => {

        beforeEach(async () => {
            try {
                Q1SocioDemographics.child_id = defaultChild.id
                const result = await quest.saveQ1SocioDemographics(accessDefaultFamilyToken, Q1SocioDemographics)
                Q1SocioDemographics.id = result.id
            } catch (err) {
                console.log('Failure in before from q1sociodemographics.patch test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ1SocioDemographic()
            } catch (err) {
                console.log('Failure in after from q1sociodemographics.patch test: ', err.message)
            }
        })

        context('when update Q1SocioDemographics successfully', () => {

            it('q1sociodemographics.patch001: should return status code 204 and no content for family', async () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)
                const ages_household_members_array = questionnaire.ages_household_members
                ages_household_members_array.push(Math.floor((Math.random() * 4 + 9)))

                const newDate = new Date()
                questionnaire.date = newDate.toISOString()
                questionnaire.parental_identity_q1 = 'father'
                questionnaire.respondent_gender = 'male'
                questionnaire.number_siblings = '2'
                questionnaire.number_of_household_members = 5
                questionnaire.ages_household_members = ages_household_members_array

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

        }) // getting a Q1SocioDemographics successfully

        context('when a error occurs', () => {
            let questionnaire: any

            beforeEach(async () => {
                try {
                    questionnaire = Q1SocioDemographics.fromJSON(Q1SocioDemographics)
                } catch (err) {
                    console.log('Failure in before from q1sociodemographics.patch test: ', err.message)
                }
            })
            it('q1sociodemographics.patch002: should return an error, because the object is empty ', async () => {

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch003: should return an error, because the date format is invalid', async () => {

                questionnaire.date = '02/12/2019'

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch004: should return an error, because respondent_gender is null', async () => {

                questionnaire.respondent_gender = null

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch005: should return an error, because number_children is a number', async () => {

                questionnaire.number_children = 10

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch006: should return an error, because child id is empty', async () => {

                questionnaire.child_id = ''

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch007: should return an error, because number_siblings is a number', async () => {

                questionnaire.number_siblings = 1

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch008: should return an error, because date is null', () => {

                questionnaire.date = null

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
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
                    Q1SocioDemographics2.child_id = defaultChild.id
                    await quest.saveQ1SocioDemographics(accessDefaultFamilyToken, Q1SocioDemographics2)
                } catch (err) {
                    console.log('Failure in Before from q1sociodemographics.patch test: ', err.message)
                }
            })
            it('q1sociodemographics.patch009: should return an error, because the Q1SocioDemographics is already registered', () => {

                const questionnaireDuplicated: any = Q1SocioDemographics2.fromJSON(Q1SocioDemographics2)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaireDuplicated)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the updated Q1SocioDemographics not exist', () => {

            it('q1sociodemographics.patch010: should return an error, because Q1SocioDemographics.id is invalid', async () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)
                const INVALID_ID = '123'

                return request(URI)
                    .patch(`/q1sociodemographics/${INVALID_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.patch011: should return an error, because Q1SocioDemographics not found', async () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)
                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .patch(`/q1sociodemographics/${NON_EXISTENT_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get Q1SocioDemographics of a specific child', () => {

            it('q1sociodemographics.patch012: should return status code 403 and info message from insufficient permissions for educator', async () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.patch013: should return status code 403 and info message from insufficient permissions for admin', () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.patch014: should return status code 403 and info message from insufficient permissions for child', () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.patch015: should return status code 403 and info message from insufficient permissions for health professional', () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.patch016: should return status code 403 and info message from insufficient permissions for application', () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q1sociodemographics.patch017: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                    return request(URI)
                        .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
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
                it('q1sociodemographics.patch018: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                    return request(URI)
                        .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
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
            it('q1sociodemographics.patch019: should return the status code 401 and the authentication failure informational message', () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${Q1SocioDemographics.id}`)
                    .send(questionnaire)
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
            const questionnaire: Q1SocioDemographicsMock = new Q1SocioDemographicsMock(child)

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const resultQuestionnaire = await quest.saveQ1SocioDemographics(accessDefaultFamilyToken, questionnaire)
                    questionnaire.id = resultQuestionnaire.id

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from q1sociodemographics.patch test: ', err.message)
                }
            })
            it('q1sociodemographics.patch020: should return an error, because child not exist', async () => {

                const questionnaire: any = Q1SocioDemographics.fromJSON(Q1SocioDemographics)

                return request(URI)
                    .patch(`/q1sociodemographics/${questionnaire.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})