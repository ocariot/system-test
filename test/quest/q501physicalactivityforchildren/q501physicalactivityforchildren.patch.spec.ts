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
import { Q501PhysicalActivityForChildrenMock } from '../../mocks/quest-service/q501physicalactivityforchildren.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q501PhysicalActivityForChildren', () => {

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

    const Q501PhysicalActivityForChildren: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

    const Q501PhysicalActivityForChildren2: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

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
            console.log('Failure on Before from q501physicalactivityforchildren.patch test: ', err.message)
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

    describe('PATCH /q501physicalactivityforchildren/:q501physicalactivityforchildren.id', () => {

        beforeEach(async () => {
            try {
                const result = await quest.saveQ501PhysicalActivityForChildren(accessDefaultChildToken, Q501PhysicalActivityForChildren)
                Q501PhysicalActivityForChildren.id = result.id
            } catch (err) {
                console.log('Failure in before from q501physicalactivityforchildren.patch test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ501PhysicalActivityForChildren()
            } catch (err) {
                console.log('Failure in after from q501physicalactivityforchildren.patch test: ', err.message)
            }
        })

        context('when update Q501PhysicalActivityForChildren successfully', () => {

            it('q501physicalactivityforchildren.patch001: should return status code 204 and no content for educator user', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                const newDate = new Date()
                questionnaire.date = newDate.toISOString()
                questionnaire.a = '5' // how many times a week did the child walk as exercise
                questionnaire.b = '5'// how many times a week did the child ride a bicycle as an exercise
                questionnaire.c = '5'// how many times a week did the child swim as exercise

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

            it('q501physicalactivityforchildren.patch002: should return status code 204 and no content for family', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.id = 'questionario_id' // even though it was passed in the request, the id of the kept questionnaire is what was originally saved
                questionnaire.a_7 = '5' // how often did the child perform physical activity on Monday - (5: oftentimes)
                questionnaire.b_7 = '5' // how often did the child perform physical activity on Tuesday - (5: oftentimes)
                questionnaire.c_7 = '5' // how often did the child perform physical activity on Wednesday - (5: oftentimes)
                questionnaire.f_7 = '1' // how often did the child perform physical activity on Sunday - (5: none)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

        }) // getting a Q501PhysicalActivityForChildren successfully

        context('when a error occurs', () => {
            it('q501physicalactivityforchildren.patch003: should return an error, because the object is empty ', async () => {

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch004: should return an error, because the date format is invalid', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.date = '02/12/2019'

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch005: should return an error, because some of the values is null', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.a = null // how many times a week did the child walk as exercise

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch006: should return an error, because scoring_PAQC is a number', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.scoring_PAQC = 10

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch007: should return an error, because child id is empty', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.child_id = ''

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch008: should return an error, because percentage is a number', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.percentage = 1

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch009: should return an error, because date is null', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                questionnaire.date = null

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
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
                    await quest.saveQ501PhysicalActivityForChildren(accessDefaultEducatorToken, Q501PhysicalActivityForChildren2)
                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.patch test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.patch010: should return an error, because the Q501PhysicalActivityForChildren is already registered', () => {

                const questionnaireDuplicated: any = Q501PhysicalActivityForChildren2.fromJSON(Q501PhysicalActivityForChildren2)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaireDuplicated)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the updated Q501PhysicalActivityForChildren not exist', () => {

            it('q501physicalactivityforchildren.patch011: should return an error, because Q501PhysicalActivityForChildren.id is invalid', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                const INVALID_ID = '123'

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${INVALID_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.patch012: should return an error, because Q501PhysicalActivityForChildren not found', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${NON_EXISTENT_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get Q501PhysicalActivityForChildren of a specific child', () => {

            it('q501physicalactivityforchildren.patch013: should return status code 403 and info message from insufficient permissions for admin', () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.patch014: should return status code 403 and info message from insufficient permissions for child', () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.patch015: should return status code 403 and info message from insufficient permissions for health professional', () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.patch016: should return status code 403 and info message from insufficient permissions for application', () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q501physicalactivityforchildren.patch017: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                    return request(URI)
                        .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                        .send(questionnaire)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q501physicalactivityforchildren.patch018: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                    return request(URI)
                        .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                        .send(questionnaire)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('q501physicalactivityforchildren.patch019: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${Q501PhysicalActivityForChildren.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            const child: Child = new ChildMock()
            const questionnaire: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    const resultQuestionnaire = await quest.saveQ501PhysicalActivityForChildren(childToken, questionnaire)
                    questionnaire.id = resultQuestionnaire.id

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.patch test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.patch020: should return an error, because child not exist', async () => {

                const questionnaire: any = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${questionnaire.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        describe('when the child is no longer sick', () => {
            const questionnaireForSickChild: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

            before(async () => {
                try {
                    await questionnaireDB.deleteQ501PhysicalActivityForChildren()
                    questionnaireForSickChild.paqc_10 = '1' // indicates if the child was ill in the last week (1: yes)
                    questionnaireForSickChild.paqc_11 = 'I had the flu' //

                    await quest.saveQ501PhysicalActivityForChildren(accessDefaultChildToken, questionnaireForSickChild)

                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.patch test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.patch021: should return status code 204 and no content', async () => {

                const questionnaire: any = questionnaireForSickChild.fromJSON(questionnaireForSickChild)
                questionnaire.paqc_10 = '2' // indicates if the child was ill in the last week (2: false)

                return request(URI)
                    .patch(`/q501physicalactivityforchildren/${questionnaire.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(async res => {
                        expect(res.body).to.eql({})

                        const result = await quest.getQ501PhysicalActivityForChildrenByID(accessDefaultChildToken, questionnaire.id)
                        expect(result.paqc_10).to.eql('2')
                        expect(result.paqc_11).to.eql('')
                    })
            })
        })
    })
})