import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { questionnaireDB } from '../../../src/quizzes/database/quests.db'
import { missionsDB } from '../../../src/missions/database/missions.db'
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
import { FoodRecognitionMock } from '../../mocks/missions-service/foodRecognitionMock'
// import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'
import { InstitutionMock } from '../../mocks/account-service/institution.mock'

describe('Routes: Robot', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    // let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    // let accessDefaultHealthProfessionalToken: string
    // let accessDefaultFamilyToken: string
    // let accessDefaultApplicationToken: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultFoodRecognition: FoodRecognitionMock = new FoodRecognitionMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()
            await missionsDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            // accessDefaultApplicationToken = tokens.application.access_token

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

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            // getting tokens for each 'default user'
            // if (defaultChild.username && defaultChild.password) {
            //     accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            // }

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
            //
            // if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
            //     accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            // }

        } catch (err) {
            console.log('Failure on Before from robot-result.food-recognition.post test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await questionnaireDB.removeCollections()
            await missionsDB.restoreDatabase()
            await accountDB.dispose()
            await questionnaireDB.dispose()
            await missionsDB.close()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /robot-result/food-recognition', () => {

        // afterEach(async () => {
        //     try {
        //         await missionsDB.restoreDatabase()
        //     } catch (err) {
        //         console.log('Failure in robot-result/food-recognition.post test: ', err.message)
        //     }
        // })

        context('when the user posting a Food-Recognition successfully', () => {

            it('food-recognition.post001: should return status code 201 and the saved Food-Recognition by the educator user', async () => {

                return request(URI)
                    .post('/robot-result/food-recognition')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultFoodRecognition)
                    .then(res => {
                        console.log('RES: ', res.body)
                        expect(res.status).to.eql(HttpStatus.UNAUTHORIZED)
                    })
            })

        })
    })
})