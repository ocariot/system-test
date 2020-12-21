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

describe('Routes: educators.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let defaultEducatorToken: string

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
    defaultEducator.password = 'default pass'

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
            defaultEducator.institution = resultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            if (defaultEducator.username && defaultEducator.password) {
                defaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }
        
            const resultGetDefaultEducator = await acc.getEducatorById(accessTokenAdmin, defaultEducator.id)
            defaultEducator.last_login = resultGetDefaultEducator.last_login

        } catch (err) {
            console.log('Failure on Before from educators.children.groups.delete test: ', err)
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

    describe('DELETE /educators/:educator_id/children/groups/:group_id', () => {
        beforeEach(async () => {
            try {
                const resultDefaultChildrenGroup = await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
                defaultChildrenGroup.id = resultDefaultChildrenGroup.id
            } catch (err) {
                console.log('Failure in educators.children.groups.delete test: ', err)
            }
        })
        afterEach(async () => {
            try {
                await accountDB.deleteChildrenGroups()
            } catch (err) {
                console.log('Failure in educators.children.groups.delete test: ', err)
            }
        })

        describe('when the educator delete your children group successfully', () => {
            it('educators.children.groups.delete001: should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the educator is not found', () => {
            it('educators.children.groups.delete002: should return status code 403 and info message from insufficient permissions, because a non-existent id does not match to user id.', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the educator

                return request(URI)
                    .delete(`/educators/${NON_EXISTENT_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when the educator_id is invalid', () => {
            it('educators.children.groups.delete003: should return status code 400 and message for invalid educator id', () => {
                const INVALID_ID = '123' // invalid id of the educator

                return request(URI)
                    .delete(`/educators/${INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_EDUCATOR_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the children group_id is invalid', () => {
            it('educators.children.groups.delete004: should return status code 400 and message for invalid children group id', () => {
                const INVALID_ID = '123' // invalid id of the child group

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the children group is not founded', () => {
            it('educators.children.groups.delete005: should return status code 404 and info message for children group not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child group

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the user does not have permission for delete children group of the educator', () => {

            it('educators.children.groups.delete006: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.delete007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.delete008: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.delete009: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.delete010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.delete011: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('educators.children.groups.delete012: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .delete(`/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
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
