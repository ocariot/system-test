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
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Q501PhysicalActivityForChildrenMock } from '../../mocks/quest-service/q501physicalactivityforchildren.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q501PhysicalActivityForChildren', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenAnotherChild: string
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
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const defaultQ501PhysicalActivityForChildren: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherChild = tokens.child.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token

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

            // Associating Q501PhysicalActivityForChildren with the child
            defaultQ501PhysicalActivityForChildren.child_id = defaultChild.id

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

        } catch (err) {
            console.log('Failure on Before from Q501PhysicalActivityForChildren.post test: ', err.message)
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

    describe('POST /Q501PhysicalActivityForChildren', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ501PhysicalActivityForChildren()
            } catch (err) {
                console.log('Failure on Before in Q501PhysicalActivityForChildren.post test: ', err.message)
            }
        })

        context('when the user posting a Q501PhysicalActivityForChildren for the child successfully', () => {
            let Q501PhysicalActivityForChildren: Q501PhysicalActivityForChildrenMock
            let Q501PhysicalActivityForChildrenJSON: any

            beforeEach(async () => {
                try {
                    Q501PhysicalActivityForChildren = new Q501PhysicalActivityForChildrenMock()
                    Q501PhysicalActivityForChildren.child_id = defaultChild.id
                    Q501PhysicalActivityForChildrenJSON = Q501PhysicalActivityForChildren.fromJSON(Q501PhysicalActivityForChildren)
                } catch (err) {
                    console.log('Failure on Before in Q501PhysicalActivityForChildren.post test: ', err.message)
                }
            })

            it('q501physicalactivityforchildren.post002: should return status code 200 and the saved Q501PhysicalActivityForChildren by the educator', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(Q501PhysicalActivityForChildren)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(Q501PhysicalActivityForChildrenJSON)
                    })
            })

            it('q501physicalactivityforchildren.post003: should return status code 200 and the saved Q501PhysicalActivityForChildren by the family', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(Q501PhysicalActivityForChildren)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(Q501PhysicalActivityForChildrenJSON)
                    })
            })

            it('q501physicalactivityforchildren.post005: should return status code 200, even when provided a invalid id for the Q501PhysicalActivityForChildren', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.id = '123'

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(incorrectQ501PhysicalActivityForChildren)
                    })
            })

        }) // posting a Q501PhysicalActivityForChildren  successfully

        describe('when posting a empty Object for the child', () => {
            it('q501physicalactivityforchildren.post006: should return status code 200 and the saved a Q501PhysicalActivityForChildren only with auto-generated id and date fields', () => {

                const body = {}

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(body)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                    })
            })
        })

        describe('when posting the same Q501PhysicalActivityForChildren twice for the same child', () => {
            before(async () => {
                try {
                    await quest.saveQ501PhysicalActivityForChildren(accessDefaultEducatorToken, defaultQ501PhysicalActivityForChildren)
                } catch (err) {
                    console.log('Failure in Q501PhysicalActivityForChildren.post test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.post007: should return an error, because the same Q501PhysicalActivityForChildren already registered for the child', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('q501physicalactivityforchildren.post008: should return an error, because child_id is invalid', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.child_id = '123'

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post009: should return an error, because child not exist', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.child_id = '5a55be50de34500146d9c544'

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('q501physicalactivityforchildren.post010: should return an error, because date is null', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.date = null

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post011: should return an error, because child_id is null', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.child_id = null

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post012: should return an error, because percentage is null', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.percentage = null

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID (DIFFERENT TYPE)
            it('q501physicalactivityforchildren.post013: should return an error, because state is a number', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.state = 1

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post014: should return an error, because scoring_PAQC is a boolean', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.scoring_PAQC = true

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
            // SOME FIELD HAS INVALID ((DIFFERENT TYPE))

            it('q501physicalactivityforchildren.post015: should return an error, because date format is invalid', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.date = '2019/12/03T15:28:47.319Z'

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post016: should return an error, because month is invalid', () => {
                const incorrectQ501PhysicalActivityForChildren = getQ501PhysicalActivityForChildrenJSON()
                incorrectQ501PhysicalActivityForChildren.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(incorrectQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        context('when the user does not have permission for register Q501PhysicalActivityForChildren', () => {

            it('q501physicalactivityforchildren.post001: should return status code 403 and info message from insufficient permissions for own child', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.post017: should return status code 403 and info message from insufficient permissions for admin', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.post018: should return status code 403 and info message from insufficient permissions for Health Professional', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q501physicalactivityforchildren.post019: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.FORBIDDEN)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q501physicalactivityforchildren.post020: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q501physicalactivityforchildren')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(defaultQ501PhysicalActivityForChildren)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q501physicalactivityforchildren.post021: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .post('/q501physicalactivityforchildren')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(defaultQ501PhysicalActivityForChildren)
                        .expect(HttpStatus.FORBIDDEN)
                        .expect(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            it('q501physicalactivityforchildren.post004: should return status code 403 and info message from insufficient permissions for application', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        })

        context('when posting a new Q501PhysicalActivityForChildren for another user that not to be a child', () => {

            it('q501physicalactivityforchildren.post022: should return an error, when try create a Q501PhysicalActivityForChildren for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()
                defaultQ501PhysicalActivityForChildren.child_id = ADMIN_ID

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post023: should return an error, when try create a Q501PhysicalActivityForChildren for educator', () => {

                defaultQ501PhysicalActivityForChildren.child_id = defaultEducator.id

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post024: should return an error, when try create a Q501PhysicalActivityForChildren for health professional', () => {

                defaultQ501PhysicalActivityForChildren.child_id = defaultHealthProfessional.id

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post025: should return an error, when try create a Q501PhysicalActivityForChildren for family', () => {

                defaultQ501PhysicalActivityForChildren.child_id = defaultFamily.id

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('q501physicalactivityforchildren.post026: should return an error, when try create a Q501PhysicalActivityForChildren for application', () => {

                defaultQ501PhysicalActivityForChildren.child_id = defaultApplication.id

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        }) // another user that not to be a child

        describe('when not informed the acess token', () => {
            it('q501physicalactivityforchildren.post027: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .expect(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the child has been deleted', () => {
            it('q501physicalactivityforchildren.post028: should return an error, because child not exist', async () => {

                defaultQ501PhysicalActivityForChildren.child_id = defaultChild.id
                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .post('/q501physicalactivityforchildren')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ501PhysicalActivityForChildren)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

    })
})

function getQ501PhysicalActivityForChildrenJSON() {

    const incorrectQ501PhysicalActivityForChildrenJSON: any = {
        id: '04f8bbf4439d555be9fa48c1',
        date: '2021-01-10T14:53:18.073Z',
        child_id: '5e4aae26e2eeec0019b8bf60',
        a: '2',
        b: '1',
        c: '4',
        d: '3',
        e: '3',
        f: '3',
        gh: '3',
        i: '2',
        k: '4',
        l: '4',
        m: '2',
        n: '5',
        o: '4',
        p: '2',
        q: '1',
        r: '2',
        s: '2',
        t: '5',
        u: '4',
        paqc_2: '5',
        paqc_3: '5',
        paqc_4: '4',
        paqc_5: '3',
        paqc_4br: '4',
        paqc_5br: '5',
        paqc_6: '2',
        paqc_6br: '2',
        paqc_7: '4',
        paqc_8: '3',
        a_7: '4',
        b_7: '1',
        c_7: '4',
        d_7: '5',
        e_7: '2',
        f_7: '1',
        g_7: '5',
        paqc_10: '2',
        paqc_11: '',
        percentage: '3',
        state: '5',
        scoring_PAQC: '3'
    }

    return incorrectQ501PhysicalActivityForChildrenJSON
}