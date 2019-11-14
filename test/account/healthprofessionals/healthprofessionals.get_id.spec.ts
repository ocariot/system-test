import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'

describe('Routes: healthprofessionals', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

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

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'Default healthprofessional'
    defaultHealthProfessional.password = 'Default pass'

    let defaultHealthProfessionalToken: string

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

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
            defaultHealthProfessional.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultHealthProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password){
                defaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            const resultGetDefaultHealthProfessional = await acc.getHealthProfessionalById(accessTokenAdmin, defaultHealthProfessional.id)
            defaultHealthProfessional.last_login = resultGetDefaultHealthProfessional.last_login

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.get_id test: ', err)
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

    describe('GET /healthprofessionals/:healthprofessional_id', () => {
        context('when get a unique health professional in database successfully', () => {

            it('healthprofessionals.get_id001: should return status code 200 and a health professional obtained by admin user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        expect(res.body.last_login).to.eql(defaultHealthProfessional.last_login)
                    })
            })

            it('healthprofessionals.get_id002: should return status code 200 and a health professional obtained by herself', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        expect(res.body.last_login).to.eql(defaultHealthProfessional.last_login)
                    })
            })

            context('when the health professional who has a children group associated with him', () => {
                before(async () => {
                    try {
                        await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
                    } catch (err) {
                        console.log('Failure in healthprofessionals.get_id test: ', err)
                    }
                })

                it('healthprofessionals.get_id003: should return status code 200 and the health professional data obtained by himself, without child personal data', () => {

                    return request(URI)
                        .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.id).to.eql(defaultHealthProfessional.id)
                            expect(res.body.username).to.eql(defaultHealthProfessional.username)
                            expect(res.body.institution_id).to.eql(defaultInstitution.id)
                            expect(res.body.children_groups.length).to.eql(1)
                            expect(res.body.children_groups[0]).to.have.property('id')
                            expect(res.body.children_groups[0].name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children_groups[0].school_class).to.eql(defaultChildrenGroup.school_class)
                            expect(res.body.children_groups[0].children).to.be.an.instanceof(Array)
                            expect(res.body.last_login).to.eql(defaultHealthProfessional.last_login)
                        })
                })

            }) // health professional who has a children group associated with him

        }) // get a unique health professional in database successfully

        describe('when the health professional is not found', () => {
            it('healthprofessionals.get_id004: should return status code 404 and info message from health professional not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the health professional

                return request(URI)
                    .get(`/healthprofessionals/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND)
                    })
            })
        })

        describe('when the healthprofessional_id is invalid', () => {
            it('healthprofessionals.get_id005: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of the health professional

                return request(URI)
                    .get(`/healthprofessionals/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.HEALTH_PROFESSIONAL.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique health professional in database', () => {

            it('healthprofessionals.get_id006: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_id007: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_id008: should return status code 403 and info message from insufficient permissions family user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_id009: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_id010: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.get_id011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/healthprofessionals/${defaultHealthProfessional.id}`)
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
