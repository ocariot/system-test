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
import { QfoodtrackingMock, QfoodtrackingTypeMock } from '../../mocks/quest-service/qfoodtracking.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: QFoodtracking', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    // let accessTokenAnotherChild: string
    // let accessTokenAnotherHealthProfessional: string
    // let accessTokenAnotherEducator: string
    // let accessTokenAnotherFamily: string

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    // let accessDefaultFamilyToken: string
    // let accessDefaultApplicationToken: string

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

    const qfoodtrackinsArray: Array<QfoodtrackingMock> = new Array<QfoodtrackingMock>()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            // accessTokenAnotherChild = tokens.child.access_token
            // accessTokenAnotherEducator = tokens.educator.access_token
            // accessTokenAnotherHealthProfessional = tokens.health_professional.access_token
            // accessTokenAnotherFamily = tokens.family.access_token

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

            // if (defaultFamily.username && defaultFamily.password) {
            //     accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            // }
            //
            // if (defaultApplication.username && defaultApplication.password) {
            //     accessDefaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            // }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            // Associating defaultChildrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.BREAKFAST))
            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.SNACK))
            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.LUNCH))
            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.AFTERNOON_SNACK))
            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.DINNER))
            qfoodtrackinsArray.push(new QfoodtrackingMock(QfoodtrackingTypeMock.CEIA))

            for (let i = 0; i < 3; i++) {
                qfoodtrackinsArray[i].id = undefined
                qfoodtrackinsArray[i].child_id = defaultChild.id
                const result = await quest.saveQFoodTracking(accessDefaultChildToken, qfoodtrackinsArray[i])
                qfoodtrackinsArray.push(result)
            }

            for (let i = 3; i < 5; i++) {
                qfoodtrackinsArray[i].id = undefined
                qfoodtrackinsArray[i].child_id = '123456789'
                const result = await quest.saveQFoodTracking(accessDefaultChildToken, qfoodtrackinsArray[i])
                qfoodtrackinsArray.push(result)
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

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQFoodTracking()
            } catch (err) {
                console.log('Failure on Before in qfoodtracking.get_all test: ', err.message)
            }
        })

        context('when the user posting a QFoodtracking for the child successfully', () => {
            it.only('qfoodtracking.get_all001: should return status code 200 and the saved QFoodtracking by admin', () => {

                const body = {
                    where: {},
                    fields: {
                        child_id: defaultChild.id
                    }
                }

                return request(URI)
                    .get(`/qfoodtrackings`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(body)
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            console.log(res.body[i].categories_array)
                        }
                        expect(res.body.length).to.eql(5)
                    })
            })

        }) // getting a QFoodtracking successfully
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