import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Educator } from '../../../src/account-service/model/educator'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: educators', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    let defaultEducatorToken: string

    const defaultChild: Child = new ChildMock()

    let defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await accountDB.removeCollections()

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

            defaultChild.institution = defaultInstitution
            defaultEducator.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            if (defaultEducator.username && defaultEducator.password) {
                defaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            const resultGetEducator = await acc.getEducatorById(accessTokenAdmin, defaultEducator.id)
            defaultEducator.last_login = resultGetEducator.last_login

        } catch (err) {
            console.log('Failure on Before from educators.get_id test: ', err)
        }
    })

    after(async () => {
        try {
            await accountDB.removeCollections()
            await accountDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('GET /educators/:educator_id', () => {
        context('when get a unique educator in database successfully', () => {

            it('educators.get_id001: should return status code 200 and a educator obtained by admin user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        if (defaultEducator.last_login)
                            expect(res.body.last_login).to.eql(defaultEducator.last_login)
                    })
            })

            it('educators.get_id002: should return status code 200 and a educator obtained by herself', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        if (defaultEducator.last_login)
                            expect(res.body.last_login).to.eql(defaultEducator.last_login)
                    })
            })

            describe('when gets a unique educator who has a children group associated with him', () => {
                before(async () => {
                    try {
                        await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
                    } catch (err) {
                        console.log('Failure in educators.get_id test: ', err)
                    }
                })
                afterEach(async () => {
                    try {
                        await accountDB.deleteChildrenGroups()
                    } catch (err) {
                        console.log('Failure in educators.get)id test: ', err)
                    }
                })

                it('educators.get_id003: should return status code 200 and the educator data obtained by himself, without child personal data', () => {

                    return request(URI)
                        .get(`/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.id).to.eql(defaultEducator.id)
                            expect(res.body.username).to.eql(defaultEducator.username)
                            expect(res.body.institution_id).to.eql(defaultInstitution.id)
                            expect(res.body.children_groups.length).to.eql(1)
                            expect(res.body.children_groups[0]).to.have.property('id')
                            expect(res.body.children_groups[0].name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children_groups[0].school_class).to.eql(defaultChildrenGroup.school_class)
                            expect(res.body.children_groups[0].children).to.be.an.instanceof(Array)
                            if (defaultEducator.last_login)
                                expect(res.body.last_login).to.eql(defaultEducator.last_login)
                        })
                })
            }) // educator who has a children group associated with him
        }) // get a unique educator in database successfully

        describe('Last Login Field Verification', () => {
            let lastDefaultEducatorLogin: Date

            before(async () => {
                try {
                    await acc.auth(defaultEducator.username!, defaultEducator.password!)

                    const resultGetEducator = await acc.getEducatorById(accessTokenAdmin, defaultEducator.id)
                    defaultEducator.last_login = resultGetEducator.last_login

                    lastDefaultEducatorLogin = new Date(defaultEducator.last_login!)

                } catch (err) {
                    console.log('Failure on Before from field  verification: ', err)
                }
            })

            it('educators.get_id004: should return status code 200 and the educator with last_login updated', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        if (defaultEducator.last_login)
                            expect(res.body.last_login).to.eql(lastDefaultEducatorLogin.toISOString())
                    })
            })
        })

        describe('when the educator is not found', () => {
            it('educators.get_id005: should return status code 404 and info message from educator not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the educator

                return request(URI)
                    .get(`/educators/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        describe('when the educator_id is invalid', () => {
            it('educators.get_id006: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of the educator

                return request(URI)
                    .get(`/educators/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.EDUCATOR.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique educator in database', () => {

            it('educators.get_id007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id008: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id009: should return status code 403 and info message from insufficient permissions family user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id011: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('educators.get_id012: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
