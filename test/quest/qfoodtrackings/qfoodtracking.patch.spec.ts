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
import { QfoodtrackingMock, QFoodTrackingTypeMock } from '../../mocks/quest-service/qfoodtracking.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: QFoodtracking', () => {

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

    const QFoodTracking1: QfoodtrackingMock = new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST)

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
            console.log('Failure on Before from qfoodtracking.patch test: ', err.message)
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

    describe('PATCH /qfoodtrackings/:qfoodtracking.id', () => {

        beforeEach(async () => {
            try {
                const resultQFoodTracking1 = await quest.saveQFoodTracking(accessDefaultChildToken, QFoodTracking1)
                QFoodTracking1.id = resultQFoodTracking1.id

            } catch (err) {
                console.log('Failure in before from qfoodtracking.patch test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQFoodTracking()
            } catch (err) {
                console.log('Failure in after from qfoodtracking.patch test: ', err.message)
            }
        })

        context('when update QFoodtracking successfully', () => {

            it('qfoodtracking.patch001: should return status code 204 and no content for educator user', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                const newDate = new Date()
                questionnaire.date = newDate.toISOString()

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

            it('qfoodtracking.patch002: should return status code 204 and no content for family', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                questionnaire.id = 'questionario_id' // even though it was passed in the request, the id of the kept questionnaire is what was originally saved
                questionnaire.type = QFoodTrackingTypeMock.CEIA
                questionnaire.categories_array = ['rice', '1', 'fish', '2']

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.deep.eql({})
                    })
            })

        }) // getting a QFoodtracking successfully

        context('when a error occurs', () => {
            it('qfoodtracking.patch003: should return an error, because the object is empty ', async () => {

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('qfoodtracking.patch004: should return an error, because the date format is invalid', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                questionnaire.date = '02/12/2019'

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('qfoodtracking.patch005: should return an error, because type is a number', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                questionnaire.type = 1

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('qfoodtracking.patch006: should return an error, because categories_array is a text', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                questionnaire.categories_array = 'two breads'

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('qfoodtracking.patch007: should return an error, because child id is empty', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                questionnaire.child_id = ''

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the updated QFoodTracking not exist', () => {

            it('qfoodtracking.patch008: should return an error, because QFoodTracking.id is invalid', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                const INVALID_ID = '123'

                return request(URI)
                    .patch(`/qfoodtrackings/${INVALID_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('qfoodtracking.patch009: should return an error, because QFoodTracking not found', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)
                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .patch(`/qfoodtrackings/${NON_EXISTENT_ID}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get QFoodTracking of a specific child', () => {

            it('qfoodtracking.patch010: should return status code 403 and info message from insufficient permissions for admin', () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('qfoodtracking.patch011: should return status code 403 and info message from insufficient permissions for child', () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('qfoodtracking.patch012: should return status code 403 and info message from insufficient permissions for health professional', () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('qfoodtracking.patch013: should return status code 403 and info message from insufficient permissions for application', () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .send(questionnaire)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('qfoodtracking.patch014: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                    return request(URI)
                        .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
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
                it('qfoodtracking.patch015: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                    return request(URI)
                        .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
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
            it('qfoodtracking.patch016: should return the status code 401 and the authentication failure informational message', () => {
                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${QFoodTracking1.id}`)
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
            const questionnaire: QfoodtrackingMock = new QfoodtrackingMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    const resultQuestionnaire = await quest.saveQFoodTracking(childToken, questionnaire)
                    questionnaire.id = resultQuestionnaire.id

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from qfoodtracking.patch test: ', err.message)
                }
            })
            it('qfoodtracking.patch017: should return an error, because child not exist', async () => {

                const questionnaire: any = QFoodTracking1.fromJSON(QFoodTracking1)

                return request(URI)
                    .patch(`/qfoodtrackings/${questionnaire.id}`)
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