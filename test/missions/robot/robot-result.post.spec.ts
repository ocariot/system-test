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
import { RobotResultMock } from '../../mocks/missions-service/robotResult.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'
import { InstitutionMock } from '../../mocks/account-service/institution.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: Robot', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string
    let accessDefaultApplicationToken: string

    let accessTokenAnotherEducator: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultRobotResult: RobotResultMock = new RobotResultMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()
            await missionsDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherEducator = tokens.educator.access_token

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
            defaultRobotResult.userId = defaultChild.id

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

            // Associating defaultChildrenGroup with educator
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from robot-result.post test: ', err.message)
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

    describe('POST /robot-result', () => {

        // afterEach(async () => {
        //     try {
        //         await missionsDB.restoreDatabase()
        //     } catch (err) {
        //         console.log('Failure in robot-result.post test: ', err.message)
        //     }
        // })

        context('when the user posting a Robot-Result successfully', () => {

            it('robot-result.post001: should return status code 200 and the saved Robot-Result by the educator user', async () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultRobotResult)
                    .then(res => {
                        expect(res.status).to.eql(HttpStatus.OK)
                        expect(res.body.data).to.deep.eql(defaultRobotResult.fromJSON(defaultRobotResult))
                    })
            })

            it('robot-result.post002: should return status code 200 and the saved Robot-Result by the application', async () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultRobotResult)
                    .then(res => {
                        expect(res.status).to.eql(HttpStatus.OK)
                        expect(res.body.data).to.deep.eql(defaultRobotResult.fromJSON(defaultRobotResult))
                    })
            })

        })

        context('when a validation error occurs', () => {

            let incorrectRobotResult: any

            beforeEach(async () => {
                try {
                    incorrectRobotResult = new RobotResultMock()
                } catch (err) {
                    console.log('Failure on Before in robot-result.post test: ', err.message)
                }
            })

            it('robot-result.post003: should return an error, because userId is invalid', () => {
                incorrectRobotResult.userId = '123'

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post004: should return an error, because user not exist', () => {
                incorrectRobotResult.userId = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('robot-result.post005: should return an error, because date is null', () => {
                incorrectRobotResult.date = null

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post006: should return an error, because userId is null', () => {
                incorrectRobotResult.userId = null

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post007: should return an error, because userName is null', () => {
                incorrectRobotResult.userName = null

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post008: should return an error, because favoriteSport is null', () => {
                incorrectRobotResult.favoriteSport = null

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post009: should return an error, because missions is null', () => {
                incorrectRobotResult.missions = null

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('robot-result.post010: should return an error, because userName is a number', () => {
                incorrectRobotResult.userName = 1

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post011: should return an error, because favoriteSport is a boolean', () => {
                incorrectRobotResult.favoriteSport = false

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post012: should return an error, because userLog.question is a boolean', () => {
                incorrectRobotResult.userLog.question = true

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

            it('robot-result.post013: should return an error, because date format is invalid', () => {
                incorrectRobotResult.date = '2019/12/03T15:28:47.319Z'

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post014: should return an error, because month is invalid', () => {
                incorrectRobotResult.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the user does not have permission for register Robot-Result', () => {

            it('robot-result.post015: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultRobotResult)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('robot-result.post016: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultRobotResult)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('robot-result.post017: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultRobotResult)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('robot-result.post018: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultRobotResult)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('robot-result.post019: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .post('/robot-result')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(defaultRobotResult)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        context('when posting a new Robot-Result for another user that not to be a child', () => {

            const robotResultForOtherUser = defaultRobotResult

            it('robot-result.post020: should return an error, when try create a Robot-Result for admin', async () => {

                robotResultForOtherUser.userId = await acc.getAdminID()

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(robotResultForOtherUser)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post021: should return an error, when try create a Robot-Result for educator', () => {

                robotResultForOtherUser.userId = defaultEducator.id

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(robotResultForOtherUser)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post022: should return an error, when try create a Robot-Result for health professional', () => {

                robotResultForOtherUser.userId = defaultHealthProfessional.id

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(robotResultForOtherUser)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post023: should return an error, when try create a Robot-Result for family', () => {

                robotResultForOtherUser.userId = defaultFamily.id

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(robotResultForOtherUser)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('robot-result.post024: should return an error, when try create a Robot-Result for application', () => {

                robotResultForOtherUser.userId = defaultApplication.id

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(robotResultForOtherUser)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        }) // another user that not to be a child        

        describe('when not informed the acess token', () => {
            it('robot-result.post025: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultRobotResult)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            it('robot-result.post026: should return an error, because child not exist', async () => {

                defaultRobotResult.userId = defaultChild.id
                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .post('/robot-result')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultRobotResult)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

    })
})