import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Child } from '../../../src/account-service/model/child'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { before } from 'mocha'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: children', () => {

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

    const defaultChild: Child = new ChildMock()

    let defaultChildToken: string

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
            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            if (defaultChild.username && defaultChild.password) {
                defaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            const resultGetChild = await acc.getChildById(accessTokenAdmin, defaultChild.id)
            defaultChild.last_login = resultGetChild.last_login

        } catch (err) {
            console.log('Failure on Before from children.get_id test: ', err)
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

    describe('GET /children/:child_id', () => {

        context('when get a unique child in database successfully', () => {

            it('children.get_id001: should return status code 200 and information when the child has not yet logged in to the system for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })

            it('children.get_id002: should return status code 200 and information of the child for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })

            it('children.get_id003: should return status code 200 and information of the child for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })

            it('children.get_id004: should return status code 200 and information of the child for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })

            it('children.get_id005: should return status code 200 and the child data obtained by herself', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(defaultChild.last_login)
                    })
            })

        }) // get a unique child successfully

        describe('Last Login Field Verification', () => {
            let lastDefaultChildLogin: Date

            before(async () => {
                try {
                    await acc.auth(defaultChild.username!, defaultChild.password!)

                    const resultGetChild = await acc.getChildById(accessTokenAdmin, defaultChild.id)
                    defaultChild.last_login = resultGetChild.last_login

                    lastDefaultChildLogin = new Date(defaultChild.last_login!)

                } catch (err) {
                    console.log('Failure on Before from field  verification: ', err)
                }
            })

            it('children.get_id006: should return status code 200 and the child with last_login updated', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        if (defaultChild.last_login)
                            expect(res.body.last_login).to.eql(lastDefaultChildLogin.toISOString())
                    })
            })
        })

        describe('when the child is not found', () => {
            it('children.get_id007: should return status code 404 and info message from child not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // child id does not exist

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_404_CHILD_NOT_FOUND)
                    })
            })
        })

        describe('when the child_id is invalid', () => {

            it('children.get_id008: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of child

                return request(URI)
                    .get(`/children/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_400_INVALID_CHILD_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique child in database', () => {

            it('children.get_id009: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_id010: should return status code 403 and info message from insufficient permissions for another child user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.get_id011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}`)
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
