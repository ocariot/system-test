import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
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
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Q1SocioDemographicsMock } from '../../mocks/quest-service/q1SocioDemographicsMock'
import * as HttpStatus from 'http-status-codes'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: Q1Sociodemographic', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAnotherFamily: string

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
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const defaultQ1SocioDemographic: Q1SocioDemographicsMock = new Q1SocioDemographicsMock(defaultChild)

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherFamily = tokens.family.access_token

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

            defaultQ1SocioDemographic.child_id = resultDefaultChild.id

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
            // Associating defaultChildrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from q1sociodemographics.post test: ', err.message)
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

    describe('POST /q1sociodemographics', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ1SocioDemographic()
            } catch (err) {
                console.log('Failure in q1sociodemographics.post test: ', err.message)
            }
        })

        context('when the user posting a Q1Sociodemographic successfully', () => {

            it('q1sociodemographics.post001: should return status code 200 and the saved Q1Sociodemographic by the family user', () => {

                const defaultQ1SocioDemographicJSON: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultQ1SocioDemographicJSON)
                    })
            })

        }) // posting a Q1Sociodemographic successfully

        context('when a validation error occurs', () => {

            it('q1sociodemographics.post002: should return an error, because child_id is invalid', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.child_id = '123'

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post003: should return an error, because child not exist', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.child_id = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('q1sociodemographics.post004: should return an error, because date is null', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.date = null

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post005: should return an error, because child_id is null', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.child_id = null

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post006: should return an error, because percentage is null', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.percentage = null

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post007: should return an error, because ages_household_members is null', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.ages_household_members = null

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('q1sociodemographics.post008: should return an error, because state is a number', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.state = 1

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post009: should return an error, because number_of_household_members is a boolean', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.number_of_household_members = true

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

            it('q1sociodemographics.post010: should return an error, because date format is invalid', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.date = '2019/12/03T15:28:47.319Z'

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post011: should return an error, because month is invalid', () => {
                const incorrectQ1SocioDemographic: any = defaultQ1SocioDemographic.fromJSON(defaultQ1SocioDemographic)
                incorrectQ1SocioDemographic.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(incorrectQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the user does not have permission for register Q1Sociodemographic', () => {

            it('q1sociodemographics.post012: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.post013: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.post014: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.post015: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.post016: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q1sociodemographics.post017: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q1sociodemographics')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(defaultQ1SocioDemographic)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        context('when posting a new Q1SocioDemographic for another user that not to be a child', () => {

            let Q1SociodemographicForOtherUsers: Q1SocioDemographicsMock = new Q1SocioDemographicsMock(defaultChild)

            it('q1sociodemographics.post018: should return an error, when try create a Q1SocioDemographic for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()
                Q1SociodemographicForOtherUsers.child_id = ADMIN_ID

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q1SociodemographicForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post019: should return an error, when try create a Q1SocioDemographic for educator', () => {

                Q1SociodemographicForOtherUsers.child_id = defaultEducator.id

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q1SociodemographicForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post020: should return an error, when try create a Q1SocioDemographic for health professional', () => {

                Q1SociodemographicForOtherUsers.child_id = defaultHealthProfessional.id

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q1SociodemographicForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post021: should return an error, when try create a Q1SocioDemographic for family', () => {

                Q1SociodemographicForOtherUsers.child_id = defaultFamily.id

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q1SociodemographicForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q1sociodemographics.post022: should return an error, when try create a Q1SocioDemographic for application', () => {

                Q1SociodemographicForOtherUsers.child_id = defaultApplication.id

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q1SociodemographicForOtherUsers)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        }) // another user that not to be a child        

        describe('when not informed the acess token', () => {
            it('q1sociodemographics.post023: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultQ1SocioDemographic)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            it('q1sociodemographics.post024: should return an error, because child not exist', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
    })
})