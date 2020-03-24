import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
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
import { EducatorMissionsMock, QuestionnaireType } from '../../mocks/missions-service/educatorMissionsMock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'
import { InstitutionMock } from '../../mocks/account-service/institution.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: Educator Missions', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string
    let accessDefaultApplicationToken: string

    const defaultInstitution: Institution = new InstitutionMock()
    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultEducatorMissionsDiet: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.DIET)
    const defaultEducatorMissionsEducation: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.EDUCATION)

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    before(async () => {
        try {
            await accountDB.connect()
            await missionsDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

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
            console.log('Failure on Before from educator-missions.post test: ', err.message)
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

    describe('POST /educator-missions', () => {

        afterEach(async () => {
            try {
                await missionsDB.deleteAllEducatorMissions()
            } catch (err) {
                console.log('Failure on AfterEach from educator-missions.post test: ', err.message)
            }
        })
        context('when the user posting a Educator Missions successfully', () => {

            it('educator-missions.post001: should return status code 200 and the saved Educator Missions by the educator user', async () => {
                defaultEducatorMissionsDiet.creatorId = defaultEducator.id

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultEducatorMissionsDiet)
                    .then(res => {
                        expect(res.status).to.eql(HttpStatus.OK)
                        expect(res.body.data).to.have.property('data')
                    })
            })

            it('educator-missions.post002: should return status code 200 and the saved Educator Missions by the application', async () => {
                defaultEducatorMissionsEducation.creatorId = defaultApplication.id

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultEducatorMissionsEducation)
                    .then(res => {
                        expect(res.status).to.eql(HttpStatus.OK)
                        expect(res.body.data).to.have.property('data')
                    })
            })

        })

        context('when a validation error occurs', () => {

            let incorrectEducatorMissions: any

            beforeEach(async () => {
                try {
                    incorrectEducatorMissions = new EducatorMissionsMock()
                } catch (err) {
                    console.log('Failure on Before in educator-missions.post test: ', err.message)
                }
            })

            it('educator-missions.post003: should return an error, because creatorId is invalid', () => {
                incorrectEducatorMissions.creatorId = '123'

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post004: should return an error, because creator not exist', () => {
                incorrectEducatorMissions.creatorId = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('educator-missions.post005: should return an error, because type is null', () => {
                incorrectEducatorMissions.type = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post006: should return an error, because creatorId is null', () => {
                incorrectEducatorMissions.creatorId = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post007: should return an error, because goal arrays is null', () => {
                incorrectEducatorMissions.goal = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post008: should return an error, because description arrays is null', () => {
                incorrectEducatorMissions.description = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post009: should return an error, because durationType is null', () => {
                incorrectEducatorMissions.durationType = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post010: should return an error, because goal.locale is null', () => {
                incorrectEducatorMissions.goal[0].locale = null

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('educator-missions.post011: should return an error, because durationType is a number', () => {
                incorrectEducatorMissions.durationType = 1

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post012: should return an error, because durationNumber is a boolean', () => {
                incorrectEducatorMissions.durationNumber = false

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post013: should return an error, because parentRecommendation is a boolean', () => {
                incorrectEducatorMissions.parentRecommendation = true

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.post014: should return an error, because parentRecommendation.text is a number', () => {
                incorrectEducatorMissions.parentRecommendation[0].text = 123

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(incorrectEducatorMissions)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

        })

        context('when the user does not have permission for register Educator Missions', () => {

            it('educator-missions.post015: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultEducatorMissionsDiet)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educator-missions.post016: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultEducatorMissionsDiet)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educator-missions.post017: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultEducatorMissionsDiet)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educator-missions.post018: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultEducatorMissionsDiet)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('educator-missions.post019: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultEducatorMissionsDiet)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})