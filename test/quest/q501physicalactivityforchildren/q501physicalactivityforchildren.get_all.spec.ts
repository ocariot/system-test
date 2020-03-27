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
import { Q501PhysicalActivityForChildrenMock } from '../../mocks/quest-service/q501physicalactivityforchildren.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import * as HttpStatus from 'http-status-codes'

describe('Routes: Q501PhysicalActivityForChildren', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
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

    const q501ForDefaultChildArray: Array<Q501PhysicalActivityForChildrenMock> = new Array<Q501PhysicalActivityForChildrenMock>()
    const q501ForAnotherChildArray: Array<Q501PhysicalActivityForChildrenMock> = new Array<Q501PhysicalActivityForChildrenMock>()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
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

            //Getting tokens for each 'default user'
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

            // Populating q501physicalactivityforchildren arrays
            // q501physicalactivityforchildren for defaultChild
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForDefaultChildArray.push(new Q501PhysicalActivityForChildrenMock())

            // q501physicalactivityforchildren for anotherChild
            q501ForAnotherChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForAnotherChildArray.push(new Q501PhysicalActivityForChildrenMock())
            q501ForAnotherChildArray.push(new Q501PhysicalActivityForChildrenMock())

            // for questionnaires you must associate the username with child_id, otherwise it would not be possible to filter the questionnaires of the child through their id
            for (let i = 0; i < q501ForDefaultChildArray.length; i++) {
                q501ForDefaultChildArray[i].id = undefined
                q501ForDefaultChildArray[i].child_id = defaultChild.username
                const result1 = await quest.saveQ501PhysicalActivityForChildren(accessDefaultEducatorToken, q501ForDefaultChildArray[i])
                q501ForDefaultChildArray[i].id = result1.id
            }

            for (let i = 0; i < q501ForAnotherChildArray.length; i++) {
                q501ForAnotherChildArray[i].id = undefined
                q501ForAnotherChildArray[i].child_id = anotherChild.username
                const result2 = await quest.saveQ501PhysicalActivityForChildren(accessDefaultEducatorToken, q501ForAnotherChildArray[i])
                q501ForAnotherChildArray[i].id = result2.id
            }

        } catch (err) {
            console.log('Failure on Before from q501physicalactivityforchildren.get_all test: ', err.message)
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

    describe('GET /q501physicalactivityforchildren', () => {

        context('when get all q501physicalactivityforchildren successfully', () => {
            let TOTAL_Q501_REGISTERED = 0
            before(async () => {
                try {
                    TOTAL_Q501_REGISTERED = q501ForDefaultChildArray.length + q501ForAnotherChildArray.length
                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.get_all test: ', err.message)
                }
            })

            it('q501physicalactivityforchildren.get_all001: should return status code 200 and a list with all q501physicalactivityforchildren for admin user', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL_Q501_REGISTERED)
                    })
            })

            it('q501physicalactivityforchildren.get_all002: should return status code 200 and a list with all q501physicalactivityforchildren for educator', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL_Q501_REGISTERED)
                    })
            })

            it('q501physicalactivityforchildren.get_all003: should return status code 200 and a list with all q501physicalactivityforchildren for health professional', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL_Q501_REGISTERED)
                    })
            })

            it('q501physicalactivityforchildren.get_all004: should return status code 200 and a list with all q501physicalactivityforchildren for family', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL_Q501_REGISTERED)
                    })
            })

            it('q501physicalactivityforchildren.get_all005: should return status code 200 and a list with all q501physicalactivityforchildren for application', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body.length).to.eql(TOTAL_Q501_REGISTERED)
                    })
            })

            describe('when get all q501physicalactivityforchildren with some filter successfully', () => {
                it('q501physicalactivityforchildren.get_all006: should return status code 200 and a list with all q501physicalactivityforchildren of a specific child by herself', () => {

                    const TOTAL_BY_CHILD = q501ForDefaultChildArray.length

                    const q501physicalactivityforchildrenArray: any = []

                    q501ForDefaultChildArray.forEach(q501physicalactivityforchildren => {
                        const bodyElem = q501physicalactivityforchildren.fromJSON(q501physicalactivityforchildren)
                        q501physicalactivityforchildrenArray.push(bodyElem)
                    })

                    return request(URI)
                        .get(`/q501physicalactivityforchildren?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                        .expect(HttpStatus.OK)
                        .then(res => {
                            expect(res.body.length).to.eql(TOTAL_BY_CHILD)
                            for (let i = 0; i < q501ForDefaultChildArray.length; i++) {
                                expect(res.body[i]).to.deep.eql(q501physicalactivityforchildrenArray[i])
                            }
                        })
                })
            })

        }) // getting a q501physicalactivityforchildren successfully

        context('when a error occurs', () => {
            it('q501physicalactivityforchildren.get_all007: should return an error, because the querystring is invalid', () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren?filter[where]`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        }) // error occurs

        context('when the user does not have permission for get all q501physicalactivityforchildren of a specific child', () => {

            it('q501physicalactivityforchildren.get_all008: should return status code 403 and info message from insufficient permissions for child', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('q501physicalactivityforchildren.get_all009: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q501physicalactivityforchildren?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherHealthProfessional))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('q501physicalactivityforchildren.get_all010: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q501physicalactivityforchildren?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('q501physicalactivityforchildren.get_all011: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/q501physicalactivityforchildren?filter[where][child_id]=${defaultChild.username}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('q501physicalactivityforchildren.get_all012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/q501physicalactivityforchildren')
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
            const questionnaire: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    const childToken = await acc.auth(child.username!, child.password!)
                    await quest.saveQ501PhysicalActivityForChildren(childToken, questionnaire)

                    await acc.deleteUser(accessTokenAdmin, child.id)

                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.get_all test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.get_all013: should return an error, because child not exist', async () => {

                return request(URI)
                    .get(`/q501physicalactivityforchildren?filter[where][child_id]=${child.username}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })

        describe('when the child username has been updated', () => {
            const child: Child = new ChildMock()
            const questionnaire: Q501PhysicalActivityForChildrenMock = new Q501PhysicalActivityForChildrenMock()

            before(async () => {
                try {
                    child.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, child)
                    questionnaire.child_id = child.username

                    await quest.saveQ501PhysicalActivityForChildren(accessDefaultEducatorToken, questionnaire)

                    const body = { username: 'newcoolusername' }
                    await acc.updateChild(accessTokenAdmin, child, body)

                    child.username = 'newcoolusername'

                } catch (err) {
                    console.log('Failure in Before from q501physicalactivityforchildren.get_all test: ', err.message)
                }
            })
            it('q501physicalactivityforchildren.get_all014: should return status code 200 and all q501physicalactivityforchildren of the child', async () => {

                const q501physicalactivityforchildren = new Array(questionnaire.fromJSON(questionnaire))

                return request(URI)
                    .get(`/q501physicalactivityforchildren?filter[where][child_id]=${child.username}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(q501physicalactivityforchildren)
                    })
            })
        })
    })
})