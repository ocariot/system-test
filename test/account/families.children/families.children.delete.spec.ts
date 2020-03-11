import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { Family } from '../../../src/account-service/model/family'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: users.families.children', () => {

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

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

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

            defaultChild.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            defaultFamily.children = new Array<Child>(defaultChild)
            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

        } catch (err) {
            console.log('Failure on Before from users.families.children.delete test: ', err)
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

    describe('DELETE /families/:family_id/children/:child_id', () => {

        context('when the admin dissociate a child from the family successfully', () => {
            it('families.children.delete001: should return status code 204 and no content', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the child is nout found', () => {
            it('families.children.delete002: should return status code 204 and no content', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child

                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the family is nout found', () => {
            it('families.children.delete003: should return status code 404 and info message because family not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the family

                return request(URI)
                    .delete(`/families/${NON_EXISTENT_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('families.children.delete004: should return status code 400 and info message from invalid child_id', () => {
                const INVALID_ID = '123' // invalid id of the child

                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID_CHILD)
                    })
            })

            it('families.children.delete005: should return status code 400 and info message from invalid family_id', () => {
                const INVALID_ID = '123' // invalid id of the family

                return request(URI)
                    .delete(`/families/${INVALID_ID}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.children.delete006: should return status code 400 and info message from invalid family_id, because is null', () => {
                const NULL_ID_FAMILY = null // invalid id of the family

                return request(URI)
                    .delete(`/families/${NULL_ID_FAMILY}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.children.delete007: should return status code 400 and info message from invalid child_id, because is null', () => {
                const NULL_ID_CHILD = null // invalid id of the child

                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${NULL_ID_CHILD}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID_CHILD)
                    })
            })

        }) // validation error occurs

        context('when the user does not have permission to dissociate a child from the family', () => {

            it('families.children.delete008: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.delete009: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.delete010: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.delete011: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.delete012: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.children.delete013: should return the status code 401 and the authentication failure informational message', () => {
                return request(URI)
                    .delete(`/families/${defaultFamily.id}/children/${defaultChild.id}`)
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
