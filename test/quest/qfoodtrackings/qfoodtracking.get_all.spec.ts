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
import {
    QFoodTrackingBreakFastFoodsMock, QFoodTrackingMealFoodsMock,
    QfoodtrackingMock,
    QFoodTrackingTypeMock
} from '../../mocks/quest-service/qfoodtracking.mock'
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

    const qFoodTrackingsDefaultChildArray: Array<QfoodtrackingMock> = new Array<QfoodtrackingMock>()
    const qFoodTrackingsAnotherChildArray: Array<QfoodtrackingMock> = new Array<QfoodtrackingMock>()

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

            // populating qfoodtrackinsArray (Attention: Changing the number or type of questionnaires saved impacts your tests)
            // QFoodTrackinf for defaultChild
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST))
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.SNACK))
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.LUNCH))
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.AFTERNOON_SNACK))
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.DINNER))
            qFoodTrackingsDefaultChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.CEIA))

            // QFoodTrackinf for anotherChild
            qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.BREAKFAST))
            qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.SNACK))
            qFoodTrackingsAnotherChildArray.push(new QfoodtrackingMock(QFoodTrackingTypeMock.LUNCH))

            // for questionnaires you must associate the username with child_id, otherwise it would not be possible to filter the questionnaires of the child through their id
            for (let i = 0; i < qFoodTrackingsDefaultChildArray.length; i++) {
                qFoodTrackingsDefaultChildArray[i].id = undefined
                qFoodTrackingsDefaultChildArray[i].child_id = defaultChild.username
                const result = await quest.saveQFoodTracking(accessDefaultChildToken, qFoodTrackingsDefaultChildArray[i])
                qFoodTrackingsDefaultChildArray[i].id = result.id
            }

            for (let i = 0; i < qFoodTrackingsAnotherChildArray.length; i++) {
                qFoodTrackingsAnotherChildArray[i].id = undefined
                qFoodTrackingsAnotherChildArray[i].child_id = anotherChild.username
                const result = await quest.saveQFoodTracking(accessDefaultChildToken, qFoodTrackingsAnotherChildArray[i])
                qFoodTrackingsAnotherChildArray[i].id = result.id
            }

        } catch (err) {
            console.log('Failure on Before from qfoodtracking.get_all test: ', err.message)
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

    describe('GET /qfoodtrackings', () => {

        context('when get all QFoodtrackings successfully', () => {

            it('qfoodtracking.get_all001: should return status code 200 and a list with all QFoodTracking registered by admin user', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            it('qfoodtracking.get_all002: should return status code 200 and a list with all QFoodTracking registered by own child', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            it('qfoodtracking.get_all003: should return status code 200 and a list with all QFoodTracking registered by educator', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            it('qfoodtracking.get_all004: should return status code 200 and a list with all QFoodTracking registered by health professional', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            it('qfoodtracking.get_all005: should return status code 200 and a list with all QFoodTracking registered by family', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            it('qfoodtracking.get_all006: should return status code 200 and a list with all QFoodTracking registered by application', async () => {

                const TOTAL = qFoodTrackingsDefaultChildArray.length + qFoodTrackingsAnotherChildArray.length

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL)
                    })
            })

            context('when get all QFoodtrackings with some filter successfully', () => {

                it('qfoodtracking.get_all007: should return status code 200 and a list with all QFoodTracking of a specific child by herself', () => {

                    const TOTAL = qFoodTrackingsDefaultChildArray.length

                    const qFoodTrackingsArray: any = []

                    qFoodTrackingsDefaultChildArray.forEach(qfoodtracking => {
                        const bodyElem = {
                            id: qfoodtracking.id,
                            child_id: qfoodtracking.child_id,
                            date: qfoodtracking.date!.toISOString(),
                            type: qfoodtracking.type,
                            categories_array: qfoodtracking.categories_array
                        }
                        qFoodTrackingsArray.push(bodyElem)
                    })

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .expect(200)
                        .then(res => {
                            expect(res.body.length).to.eql(TOTAL)
                            for (let i = 0; i < qFoodTrackingsDefaultChildArray.length; i++) {
                                expect(res.body[i]).to.deep.eql(qFoodTrackingsArray[i])
                            }
                        })
                })

                it('qfoodtracking.get_all008: should return status code 200 and a list with all QFoodTracking who have rice as food of a specific child by educator user', async () => {

                    const rice = QFoodTrackingMealFoodsMock.RICE
                    const TOTAL = 1 // (anotherChild - LUNCH)

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][and][0][child_id]=${anotherChild.username}&filter[where][and][1][categories_array]=${rice}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                        .expect(200)
                        .then(res => {
                            expect(res.body.length).to.eql(TOTAL)
                        })
                })

                it('qfoodtracking.get_all009: should return status code 200 and a list with all QFoodTracking who have bread as food', () => {

                    const bread = QFoodTrackingBreakFastFoodsMock.BREAD
                    const TOTAL = 2 // (defaulChild - BREAKFAST and anotherChild - BREAKFAST)

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][categories_array]=${bread}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .expect(200)
                        .then(res => {
                            expect(res.body.length).to.eql(TOTAL)
                        })
                })
            })

        }) // getting a QFoodtracking successfully

        context('when a error occurs', () => {
            it('qfoodtracking.get_all010: should return status code 400, because the querystring is invalid', () => {

                return request(URI)
                    .get(`/qfoodtrackings?filter[where]`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(400)
            })
        }) // error occurs

        context('when the user does not have permission for get all QFoodTrackings of a specific child', () => {

            it('qfoodtracking.get_all011: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .get(`/qfoodtrackings?filter[where][child_id]=${defaultChild.username}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessAnotherChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('qfoodtracking.get_all012: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherHealthProfessional))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('qfoodtracking.get_all013: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('qfoodtracking.get_all014: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/qfoodtrackings?filter[where][child_id]=${defaultChild.username}`)
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
            it('qfoodtracking.get_all015: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been updated', () => {
            const child: Child = new ChildMock()
            const questionnaire: QfoodtrackingMock = new QfoodtrackingMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    await quest.saveQFoodTracking(childToken, questionnaire)

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from qfoodtracking.get_all test: ', err.message)
                }
            })
            it('qfoodtracking.post016: should return status code 200 and empty list', async () => {

                return request(URI)
                    .get(`/qfoodtrackings?filter[where][child_id]=${child.username}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.eql([])
                    })
            })
        })

        describe('when the child username has been updated', () => {
            const child: Child = new ChildMock()
            const questionnaire: QfoodtrackingMock = new QfoodtrackingMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    await quest.saveQFoodTracking(childToken, questionnaire)

                    const body = { username: 'newcoolusername' }
                    await acc.updateChild(accessTokenAdmin, child, body)

                    child.username = 'newcoolusername'

                } catch (err) {
                    console.log('Failure in Before from qfoodtracking.get_all test: ', err.message)
                }
            })
            it('qfoodtracking.post017: should return status code 200 and all QFoodTrackings of the child', async () => {

                const qFoodTracking = {
                    id: questionnaire.id,
                    child_id: questionnaire.child_id,
                    date: questionnaire.date!.toISOString(),
                    type: questionnaire.type,
                    categories_array: questionnaire.categories_array
                }

                return request(URI)
                    .get(`/qfoodtrackings?filter[where][child_id]=${child.username}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(qFoodTracking)
                    })
            })
        })
    })
})

// function getQFoodTrackingJSON() {
//
//     const incorrectQFoodTrackingJSON: any = {
//         id: '5dd572e805560300431b1004',
//         child_id: '5a62be07de34500146d9c544',
//         date: '2019-11-07T19:40:45.124Z',
//         type: 'Breakfast',
//         categories_array: ['Bread', '2', 'Eggs', '3', 'low_milk', '1']
//     }
//
//     return incorrectQFoodTrackingJSON
// }

// function getBody() {
//     const body = {
//         where: {},
//         fields: {
//             id: true,
//             child_id: true,
//             date: true,
//             type: true,
//             bread: true,
//             pasta: true,
//             rice: true,
//             fruit: true,
//             vegetable: true,
//             cheese: true,
//             lowMilk: true,
//             vegetableMilk: true,
//             indJuice: true,
//             biscuits: true,
//             indPastry: true,
//             nuts: true,
//             sweets: true,
//             procMeats: true,
//             legumes: true,
//             hamburguer: true,
//             pizza: true,
//             hotDog: true,
//             oliveOil: true,
//             indSauce: true,
//             caloricDessert: true,
//             sugarySodas: true,
//             water: true,
//             sandwich: true,
//             milk: true,
//             yogurt: true,
//             candy: true,
//             frenchFries: true,
//             eggs: true,
//             fish: true,
//             meat: true,
//             cereal: true
//         },
//         offset: 0,
//         limit: 0,
//         skip: 0,
//         order: [
//             'string'
//         ]
//     }
//
//     return body
// }