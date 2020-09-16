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
import { EducatorMissionsMock, QuestionnaireType } from '../../mocks/missions-service/educatorMissionsMock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Educator Missions', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string

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

    const EducatorMissionsDiet: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.DIET)
    const EducatorMissionsEducation: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.EDUCATION)
    const EducatorMissionsActivity: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.PHYSICAL_ACTIVITY)

    before(async () => {
        try {
            await accountDB.connect()
            await missionsDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            // Save institution and associating the user for her
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

        } catch (err) {
            console.log('Failure on Before from educator-missions.get_id test: ', err.message)
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

    describe('GET /educator-missions/:missionId', () => {
        let CREATION_DATE: string = new Date().toISOString()

        beforeEach(async () => {
            try {
                const resultDiet = await missions.saveEducatorMissions(accessDefaultApplicationToken, EducatorMissionsDiet)
                EducatorMissionsDiet.id = resultDiet.data

                const resultEducation = await missions.saveEducatorMissions(accessDefaultApplicationToken, EducatorMissionsEducation)
                EducatorMissionsEducation.id = resultEducation.data

                const resultActivity = await missions.saveEducatorMissions(accessDefaultApplicationToken, EducatorMissionsActivity)
                EducatorMissionsActivity.id = resultActivity.data

            } catch (err) {
                console.log('Failure in beforeEach from educator-missions.get_id test: ', err.message)
            }
        })

        afterEach(async () => {
            try {
                await missionsDB.deleteAllEducatorMissions()
            } catch (err) {
                console.log('Failure in afterEach from educator-missions.get_id test: ', err.message)
            }
        })

        context('when get Educator Missions successfully', () => {

            it('educator-missions.get_id001: should return status code 200 and the Educator Missions for admin user', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsDiet.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsDiet.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsDiet.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsDiet.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsDiet.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsDiet.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsDiet.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsDiet.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsDiet.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsDiet.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get_id002: should return status code 200 and the Educator Missions for child', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsEducation.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsEducation.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsEducation.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsEducation.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsEducation.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsEducation.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsEducation.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsEducation.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsEducation.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsEducation.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get_id003: should return status code 200 and the Educator Missions for educator user', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsActivity.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsActivity.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsActivity.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsActivity.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsActivity.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsActivity.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsActivity.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsActivity.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsActivity.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get_id004: should return status code 200 and the Educator Missions for health professional', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsDiet.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsDiet.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsDiet.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsDiet.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsDiet.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsDiet.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsDiet.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsDiet.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsDiet.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsDiet.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get_id005: should return status code 200 and the Educator Missions for family', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsEducation.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsEducation.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsEducation.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsEducation.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsEducation.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsEducation.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsEducation.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsEducation.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsEducation.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsEducation.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get_id006: should return status code 200 and the Educator Missions for application', () => {

                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data).to.have.deep.property('goal', EducatorMissionsActivity.goal)
                        expect(res.body.data).to.have.deep.property('description', EducatorMissionsActivity.description)
                        expect(res.body.data).to.have.deep.property('childRecommendation', EducatorMissionsActivity.childRecommendation)
                        expect(res.body.data).to.have.deep.property('parentRecommendation', EducatorMissionsActivity.parentRecommendation)
                        expect(res.body.data).to.have.property('id', EducatorMissionsActivity.id)
                        expect(res.body.data).to.have.property('creatorId', EducatorMissionsActivity.creatorId)
                        expect(res.body.data).to.have.property('type', EducatorMissionsActivity.type)
                        expect(res.body.data).to.have.property('durationType', EducatorMissionsActivity.durationType)
                        expect(res.body.data).to.have.property('durationNumber', EducatorMissionsActivity.durationNumber)
                        expect(res.body.data.createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

        }) // getting a Educator Missions successfully

        describe('when the educator mission not found', () => {
            it('educator-missions.get_id007: should return an error, because missionId is invalid', () => {
                const INVALID_ID = '123'

                return request(URI)
                    .get(`/educator-missions/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('educator-missions.get_id008: should return an error, because educator mission not found', () => {
                const NON_EXISTENT_ID = '5dd572e805560300431b10045'

                return request(URI)
                    .get(`/educator-missions/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        describe('when not informed the access token', () => {
            it('educator-missions.get_id009: should return the status code 401 and the authentication failure informational message', () => {
                return request(URI)
                    .get(`/educator-missions/${EducatorMissionsDiet.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
