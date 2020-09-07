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

    const defaultEducatorMissions: EducatorMissionsMock = new EducatorMissionsMock()

    before(async () => {
        try {
            await accountDB.connect()
            await missionsDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

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
            console.log('Failure on Before from educator-missions.get test: ', err.message)
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

    describe('GET /educator-missions', () => {
        let CREATION_DATE: string = new Date().toISOString()

        beforeEach(async () => {
            try {
                const result = await missions.saveEducatorMissions(accessDefaultApplicationToken, defaultEducatorMissions)
                defaultEducatorMissions.id = result.data
                console.log(result)
            } catch (err) {
                console.log('Failure in beforeEach from educator-missions.get test: ', err.message)
            }
        })

        afterEach(async () => {
            try {
                await missionsDB.deleteAllEducatorMissions()
            } catch (err) {
                console.log('Failure in afterEach from educator-missions.get test: ', err.message)
            }
        })

        context('when get All Educator Missions successfully', () => {

            it('educator-missions.get001: should return status code 200 and all Educator Missions for admin user', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get002: should return status code 200 and all Educator Missions for child', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get003: should return status code 200 and all Educator Missions for educator user', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get004: should return status code 200 and all Educator Missions for health professional', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get005: should return status code 200 and all Educator Missions for family', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            it('educator-missions.get006: should return status code 200 and all Educator Missions for application', () => {

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.data[0]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                        expect(res.body.data[0]).to.have.deep.property('description', defaultEducatorMissions.description)
                        expect(res.body.data[0]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                        expect(res.body.data[0]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                        expect(res.body.data[0]).to.have.property('id', defaultEducatorMissions.id)
                        expect(res.body.data[0]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                        expect(res.body.data[0]).to.have.property('type', defaultEducatorMissions.type)
                        expect(res.body.data[0]).to.have.property('durationType', defaultEducatorMissions.durationType)
                        expect(res.body.data[0]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                        expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                    })
            })

            describe('when more than one educator missions has been registered in the database', () => {
                let educatorMissionsEducation: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.EDUCATION)
                let educatorMissionsActivity: EducatorMissionsMock = new EducatorMissionsMock(QuestionnaireType.PHYSICAL_ACTIVITY)

                before(async () => {
                    try {
                        const resultEducation = await missions.saveEducatorMissions(accessDefaultApplicationToken, educatorMissionsEducation)
                        educatorMissionsEducation.id = resultEducation.id

                        const resultActivity = await missions.saveEducatorMissions(accessDefaultApplicationToken, educatorMissionsActivity)
                        educatorMissionsActivity.id = resultActivity.id
                    } catch (err) {
                        console.log('Failure in before from educator-missions.get007: ', err.message)
                    }
                })
                it('educator-missions.get007: should return status code 200 and all Educator Missions', async () => {

                    return request(URI)
                        .get('/educator-missions')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                        .expect(HttpStatus.OK)
                        .then(res => {
                            expect(res.body.data[0]).to.have.deep.property('goal', educatorMissionsActivity.goal)
                            expect(res.body.data[0]).to.have.deep.property('description', educatorMissionsActivity.description)
                            expect(res.body.data[0]).to.have.deep.property('childRecommendation', educatorMissionsActivity.childRecommendation)
                            expect(res.body.data[0]).to.have.deep.property('parentRecommendation', educatorMissionsActivity.parentRecommendation)
                            expect(res.body.data[0]).to.have.property('id', educatorMissionsActivity.id)
                            expect(res.body.data[0]).to.have.property('creatorId', educatorMissionsActivity.creatorId)
                            expect(res.body.data[0]).to.have.property('type', educatorMissionsActivity.type)
                            expect(res.body.data[0]).to.have.property('durationType', educatorMissionsActivity.durationType)
                            expect(res.body.data[0]).to.have.property('durationNumber', educatorMissionsActivity.durationNumber)
                            expect(res.body.data[0].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19

                            expect(res.body.data[1]).to.have.deep.property('goal', educatorMissionsEducation.goal)
                            expect(res.body.data[1]).to.have.deep.property('description', educatorMissionsEducation.description)
                            expect(res.body.data[1]).to.have.deep.property('childRecommendation', educatorMissionsEducation.childRecommendation)
                            expect(res.body.data[1]).to.have.deep.property('parentRecommendation', educatorMissionsEducation.parentRecommendation)
                            expect(res.body.data[1]).to.have.property('id', educatorMissionsEducation.id)
                            expect(res.body.data[1]).to.have.property('creatorId', educatorMissionsEducation.creatorId)
                            expect(res.body.data[1]).to.have.property('type', educatorMissionsEducation.type)
                            expect(res.body.data[1]).to.have.property('durationType', educatorMissionsEducation.durationType)
                            expect(res.body.data[1]).to.have.property('durationNumber', educatorMissionsEducation.durationNumber)
                            expect(res.body.data[1].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19

                            expect(res.body.data[2]).to.have.deep.property('goal', defaultEducatorMissions.goal)
                            expect(res.body.data[2]).to.have.deep.property('description', defaultEducatorMissions.description)
                            expect(res.body.data[2]).to.have.deep.property('childRecommendation', defaultEducatorMissions.childRecommendation)
                            expect(res.body.data[2]).to.have.deep.property('parentRecommendation', defaultEducatorMissions.parentRecommendation)
                            expect(res.body.data[2]).to.have.property('id', defaultEducatorMissions.id)
                            expect(res.body.data[2]).to.have.property('creatorId', defaultEducatorMissions.creatorId)
                            expect(res.body.data[2]).to.have.property('type', defaultEducatorMissions.type)
                            expect(res.body.data[2]).to.have.property('durationType', defaultEducatorMissions.durationType)
                            expect(res.body.data[2]).to.have.property('durationNumber', defaultEducatorMissions.durationNumber)
                            expect(res.body.data[2].createdAt.substring(0, 10)).to.eql(CREATION_DATE.substring(0, 10)) // ex: 2020-03-19
                        })
                })
            })

        }) // getting a Educator Missions successfully

        describe('when no educator missions has been saved in the database', () => {
            it('educator-missions.get008: should return status code 200 and an empty list', async () => {
                await missionsDB.deleteAllEducatorMissions()

                return request(URI)
                    .get('/educator-missions')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .expect(res => {
                        expect(res.body).to.be.eql({})
                    })
            })
        }) // error occurs

        describe('when not informed the access token', () => {
            it('educator-missions.get009: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/educator-missions')
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
