import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { HealthProfessional } from '../../../src/account-service/model/health.professional';
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: healthprofessionals.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let defaultHealthProfessionalToken: string

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
    defaultHealthProfessional.password = 'default pass'

    const defaultChild: Child = new ChildMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
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

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = resultInstitution
            defaultHealthProfessional.institution = resultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                defaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.children.groups.delete test: ', err)
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

    describe('DELETE /healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        beforeEach(async () => {
            try {
                const resultDefaultChildrenGroup = await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
                defaultChildrenGroup.id = resultDefaultChildrenGroup.id
            } catch (err) {
                console.log('Failure in healthprofessionals.children.groups.delete test: ', err)
            }
        })
        afterEach(async () => {
            try {
                await accountDB.deleteChildrenGroups()
            } catch (err) {
                console.log('Failure in healthprofessionals.children.groups.delete test: ', err)
            }
        })

        describe('when the health professional delete your children group successfully', () => {
            it('healthprofessionals.children.groups.delete001: should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the health professional is not found', () => {
            it('healthprofessionals.children.groups.delete002: should return status code 403 and info message from insufficient permissions, because the non-existent health professional id does not match to user id', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the health professional

                return request(URI)
                    .delete(`/healthprofessionals/${NON_EXISTENT_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when the healthprofessional_id is invalid', () => {
            it('healthprofessionals.children.groups.delete003: should return status code 400 and message for invalid healthprofessional id', () => {
                const INVALID_ID = '123' // invalid id of the health professional

                return request(URI)
                    .delete(`/healthprofessionals/${INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_HEALTHPROFESSIONAL_INVALID_ID)
                    })
            })
        })

        describe('when the children group_id is invalid', () => {
            it('healthprofessionals.children.groups.delete004: should return status code 400 and message for invalid children group id', () => {
                const INVALID_ID = '123' // invalid id of the child group

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the children group is not founded', () => {
            it('healthprofessionals.children.groups.delete005: should return status code 204 and no content, even if nothing is deleted.', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child group

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the user does not have permission for delete children group of the health professional', () => {

            it('healthprofessionals.children.groups.delete006: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.delete007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.delete008: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.delete009: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.delete010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.delete011: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.children.groups.delete012: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .delete(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
