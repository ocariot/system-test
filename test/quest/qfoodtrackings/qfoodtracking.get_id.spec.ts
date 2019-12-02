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

describe('Routes: QFoodtracking', () => {

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

    const QFoodTracking1: QfoodtrackingMock = new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST)
    const QFoodTracking2: QfoodtrackingMock = new QfoodtrackingMock(QFoodTrackingTypeMock.LUNCH)
    const QFoodTracking3: QfoodtrackingMock = new QfoodtrackingMock(QFoodTrackingTypeMock.DINNER)

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

            // // populating qfoodtrackinsArray (Attention: Changing the number or type of questionnaires saved impacts your tests)
            // // QFoodTrackinf for defaultChild
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST))
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.SNACK))
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.LUNCH))
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.AFTERNOON_SNACK))
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.DINNER))
            // qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.CEIA))
            //
            // // QFoodTrackinf for anotherChild
            // qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST))
            // qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.SNACK))
            // qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.LUNCH))
            //
            // // for questionnaires you must associate the username with child_id, otherwise it would not be possible to filter the questionnaires of the child through their id
            // for (let i = 0; i < qFoodTrackingsDefaultChildArray.length; i++) {
            //     qFoodTrackingsDefaultChildArray[i].id = undefined
            //     qFoodTrackingsDefaultChildArray[i].child_id = defaultChild.username
            //     const result = await quest.saveQFoodTracking(accessDefaultChildToken, qFoodTrackingsDefaultChildArray[i])
            //     qFoodTrackingsDefaultChildArray[i].id = result.id
            // }
            //
            // for (let i = 0; i < qFoodTrackingsAnotherChildArray.length; i++) {
            //     qFoodTrackingsAnotherChildArray[i].id = undefined
            //     qFoodTrackingsAnotherChildArray[i].child_id = anotherChild.username
            //     const result = await quest.saveQFoodTracking(accessDefaultChildToken, qFoodTrackingsAnotherChildArray[i])
            //     qFoodTrackingsAnotherChildArray[i].id = result.id
            // }

        } catch (err) {
            console.log('Failure on Before from qfoodtracking.get_id test: ', err.message)
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

    describe('GET /qfoodtrackings/:qfoodtracking.id', () => {

        beforeEach(async () => {
            try {
                const resultQFoodTracking1 = await quest.saveQFoodTracking(accessDefaultChildToken, QFoodTracking1)
                QFoodTracking1.id = resultQFoodTracking1.id

                const resultQFoodTracking2 = await quest.saveQFoodTracking(accessDefaultChildToken, QFoodTracking2)
                QFoodTracking2.id = resultQFoodTracking2.id

                const resultQFoodTracking3 = await quest.saveQFoodTracking(accessDefaultChildToken, QFoodTracking3)
                QFoodTracking3.id = resultQFoodTracking3.id

            } catch (err) {
                console.log('Failure in before from qfoodtracking.get_id test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await questionnaireDB.deleteQFoodTracking()
            } catch (err) {
                console.log('Failure in after from qfoodtracking.get_id test: ', err.message)
            }
        })

        context('when get QFoodtracking successfully', () => {

            it('qfoodtracking.get_id001: should return status code 200 and the QFoodTracking for admin user', async () => {

                const questionnaire: any = fromJSON(QFoodTracking1)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('qfoodtracking.get_id002: should return status code 200 and the QFoodTracking for own child', async () => {

                const questionnaire: any = fromJSON(QFoodTracking2)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking2.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('qfoodtracking.get_id003: should return status code 200 and the QFoodTracking for educator', async () => {

                const questionnaire: any = fromJSON(QFoodTracking2)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking2.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('qfoodtracking.get_id004: should return status code 200 and the QFoodTracking for health professional', async () => {

                const questionnaire: any = fromJSON(QFoodTracking3)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking3.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('qfoodtracking.get_id005: should return status code 200 and the QFoodTracking for family', async () => {

                const questionnaire: any = fromJSON(QFoodTracking3)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking3.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

            it('qfoodtracking.get_id006: should return status code 200 and the QFoodTracking for application', async () => {

                const questionnaire: any = fromJSON(QFoodTracking1)

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(questionnaire)
                    })
            })

        }) // getting a QFoodtracking successfully

        context('when the QFoodTracking not exist', () => {

            it('qfoodtracking.get_id007: should return status code 404, because QFoodTracking.id is invalid', async () => {

                const INVALID_ID = '123'

                return request(URI)
                    .get(`/qfoodtrackings/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(404)
                    .then(err => {
                        expect(err.body.error.message).to.eql(`Entity not found: Qfoodtracking with id "${INVALID_ID}"`)
                    })
            })

            it('qfoodtracking.get_id008: should return status code 404, because QFoodTracking not found', async () => {

                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .get(`/qfoodtrackings/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(404)
                    .then(err => {
                        expect(err.body.error.message).to.eql(`Entity not found: Qfoodtracking with id "${NON_EXISTENT_ID}"`)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get QFoodTracking of a specific child', () => {

            it('qfoodtracking.get_id011: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking1.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessAnotherChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('qfoodtracking.get_id012: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings/${QFoodTracking1.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherHealthProfessional))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('qfoodtracking.get_id013: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings/${QFoodTracking2.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('qfoodtracking.get_id014: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings/${QFoodTracking2.id}`)
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

            it('qfoodtracking.get_id015: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/qfoodtrackings/${QFoodTracking3.id}`)
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
                    console.log('Failure in Before from qfoodtracking.get_id test: ', err.message)
                }
            })
            it.only('qfoodtracking.post016: should return status code 200 and empty list', async () => {

                return request(URI)
                    .get(`/qfoodtrackings/${questionnaire.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.eql([])
                    })
            })
        })
    })
})

function fromJSON(questionnaire: QfoodtrackingMock) {
    const JSON = {
        id: questionnaire.id,
        child_id: questionnaire.child_id,
        date: questionnaire.date!.toISOString(),
        type: questionnaire.type,
        categories_array: questionnaire.categories_array
    }
    return JSON
}