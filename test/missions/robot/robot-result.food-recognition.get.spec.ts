import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { missions } from '../../utils/missions.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
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
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'
import { FoodRecognitionMock } from '../../mocks/missions-service/foodRecognitionMock'

describe('Routes: Robot', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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

    const defaultFoodRecognition: FoodRecognitionMock = new FoodRecognitionMock()
    before(async () => {
        try {
            await accountDB.connect()
            await missionsDB.connect()

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
            defaultFoodRecognition.childId = defaultChild.id

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

            await missions.saveRobotResultFoodRecognition(accessDefaultEducatorToken, defaultFoodRecognition)
        } catch (err) {
            console.log('Failure on Before from robot-result/food-recognition.get test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await missionsDB.restoreDatabase()
            await accountDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('GET /robot-result/food-recognition/:child.id', () => {

        context('when get Food-Recognition successfully', () => {
            const formattedDate = defaultFoodRecognition.getDateFormattedAccordingToMissionsService(defaultFoodRecognition.date!)
            const missionsUrl = 'https://missions:8001'

            it('food-recognition.get001: should return status code 200 and the Food-Recognition for admin user', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

            it('food-recognition.get002: should return status code 200 and the Food-Recognition for own child', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

            it('food-recognition.get003: should return status code 200 and the Food-Recognition for educator user', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

            it('food-recognition.get004: should return status code 200 and the Food-Recognition for health professional', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

            it('food-recognition.get005: should return status code 200 and the Food-Recognition for family', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

            it('food-recognition.get006: should return status code 200 and the Food-Recognition for application', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.property('id')
                        expect(res.body.data[0]).to.have.property('outcome', defaultFoodRecognition.outcome)
                        expect(res.body.data[0]).to.have.property('imagePath',  missionsUrl.concat(defaultFoodRecognition.imagePath!))
                        expect(res.body.data[0]).to.have.property('captureDate',  formattedDate)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('status', HttpStatus.OK)
                    })
            })

        }) // getting a Food-Recognition successfully

        context('when the child not found', () => {

            it('food-recognition.get007: should return an error, because child.id is invalid', async () => {

                const INVALID_ID = '123'

                return request(URI)
                    .get(`/robot-result/food-recognition/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)

                    })
            })

            it('food-recognition.get008: should return an error, because child not found', async () => {

                const NON_EXISTENT_ID = '1dd572e805560300431b1004'

                return request(URI)
                    .get(`/robot-result/food-recognition/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get Food-Recognition of a specific child', () => {

            it('food-recognition.get009: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessAnotherChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('food-recognition.get010: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/robot-result/food-recognition/${defaultChild.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherHealthProfessional))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('food-recognition.get011: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/robot-result/food-recognition/${defaultChild.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('food-recognition.get012: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/robot-result/food-recognition/${defaultChild.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        describe('when not informed the access token', () => {
            it('food-recognition.get013: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${defaultChild.id}`)
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
            const foodRecognition: FoodRecognitionMock = new FoodRecognitionMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    const resultChild = await acc.saveChild(accessTokenAdmin, child)
                    child.id = resultChild.id

                    foodRecognition.childId = child.id

                    await missions.saveRobotResultFoodRecognition(accessDefaultApplicationToken, foodRecognition)

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from robot-result/food-recognition.get test: ', err.message)
                }
            })

            it('food-recognition.get014: should return an error, because the child not found', async () => {

                return request(URI)
                    .get(`/robot-result/food-recognition/${child.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})
