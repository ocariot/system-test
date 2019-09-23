import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Educator } from '../../../src/account-service/model/educator'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'

describe('Routes: users.educators', () => {

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

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    let defaultEducatorToken: string

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
            defaultEducator.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            if (defaultEducator.username && defaultEducator.password)
                defaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)

        } catch (err) {
            console.log('Failure on Before from users.educators.get_id test: ', err)
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

    describe('GET /users/educators/:educator_id', () => {
        context('when get a unique educator in database successfully', () => {

            it('educators.get_id001: should return status code 200 and a educator obtained by admin user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            it('educators.get_id002: should return status code 200 and only the ID, username and institution of the educator', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children_groups')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            describe('when gets a unique educator who has a children group associated with him', () => {
                before(async () => {
                    try {
                        await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
                    } catch (err) {
                        console.log('Failure in users.educators.get_id test: ', err)
                    }
                })

                it('educators.get_id003: should return status code 200 and the educator data obtained by himself, without child personal data', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body).to.have.property('username')
                            expect(res.body).to.have.property('institution')
                            expect(res.body).to.have.property('children_groups')
                            expect(res.body.children_groups[0]).to.have.property('id')
                            expect(res.body.children_groups[0]).to.have.property('name')
                            expect(res.body.children_groups[0]).to.have.property('children')
                            expect(res.body.children_groups[0]).to.have.property('school_class')
                            expect(res.body.children_groups[0].children[0]).to.have.property('id')
                            expect(res.body.children_groups[0].children[0]).to.have.property('institution')
                            expect(res.body.children_groups[0].children[0]).to.not.have.property('username')
                            expect(res.body.children_groups[0].children[0]).to.not.have.property('age')
                            expect(res.body.children_groups[0].children[0]).to.not.have.property('gender')
                            expect(res.body.username).to.eql(defaultEducator.username)
                            expect(res.body.institution.id).to.eql(defaultInstitution.id)
                            expect(res.body.institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        })
                })

                it('educators.get_id004: should return status code 200 and a educator obtained by admin user, without the children group data', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body).to.have.property('username')
                            expect(res.body).to.not.have.property('children_groups')
                            expect(res.body).to.have.property('institution')
                            expect(res.body.id).to.eql(defaultEducator.id)
                            expect(res.body.username).to.eql(defaultEducator.username)
                            expect(res.body.institution).to.have.property('id')
                            expect(res.body.institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)

                        })
                })

            }) // educator who has a children group associated with him

        }) // get a unique educator in database successfully

        describe('when the educator is not found', () => {
            it('educators.get_id005: should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .get(`/users/educators/${acc.NON_EXISTENT_ID}`)
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

                return request(URI)
                    .get(`/users/educators/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique educator in database', () => {

            it('educators.get_id007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id008: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id009: should return status code 403 and info message from insufficient permissions family user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_id011: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
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
                    .get(`/users/educators/${defaultEducator.id}`)
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
