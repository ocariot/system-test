import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { Family } from '../../../src/account-service/model/family'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: families.children', () => {

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
    const anotherChild: Child = new ChildMock()

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    let defaultFamilyToken: string

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
            anotherChild.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            defaultFamily.children = new Array<Child>(defaultChild, anotherChild)
            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            if (defaultFamily.username && defaultFamily.password) {
                defaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            const resultGetDefaultFamily = await acc.getFamilyById(accessTokenAdmin, defaultFamily.id)
            defaultFamily.last_login = resultGetDefaultFamily.last_login

        } catch (err) {
            console.log('Failure on Before from families.children.get_all test: ', err)
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

    describe('GET ALL /families/:family_id/children', () => {

        context('when getting all children associated with a family successfully', () => {

            it('families.children.get_all001: should return status code 200 and all children associated with the family, obtained by own family', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0].id).to.eql(defaultChild.id)
                        expect(res.body[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].id).to.eql(anotherChild.id)
                        expect(res.body[1].username).to.eql(anotherChild.username)
                        expect(res.body[1].gender).to.eql(anotherChild.gender)
                        expect(res.body[1].age).to.eql(anotherChild.age)
                        expect(res.body[1].institution_id).to.eql(defaultInstitution.id)
                    })
            })

            it('families.children.get_all002: should return status code 200 and all children associated with the family, obtained by admin user', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0].id).to.eql(defaultChild.id)
                        expect(res.body[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].id).to.eql(anotherChild.id)
                        expect(res.body[1].username).to.eql(anotherChild.username)
                        expect(res.body[1].gender).to.eql(anotherChild.gender)
                        expect(res.body[1].age).to.eql(anotherChild.age)
                        expect(res.body[1].institution_id).to.eql(defaultInstitution.id)
                    })
            })

            it('families.children.get_all003: should return status code 200 and all children associated with the family in descending order by child username', () => {

                const sortField = 'username'

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children?sort=-${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].id).to.eql(defaultChild.id)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].username).to.eql(anotherChild.username)
                        expect(res.body[1].id).to.eql(anotherChild.id)
                        expect(res.body[1].gender).to.eql(anotherChild.gender)
                        expect(res.body[1].age).to.eql(anotherChild.age)
                        expect(res.body[1].institution_id).to.eql(defaultInstitution.id)
                    })
            })

            it('families.children.get_all004: should return status code 200 and all children associated with the family in ascending order by child username', () => {

                const sortField = 'username'

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children?sort=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].id).to.eql(anotherChild.id)
                        expect(res.body[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[0].age).to.eql(anotherChild.age)
                        expect(res.body[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].username).to.eql(defaultChild.username)
                        expect(res.body[1].id).to.eql(defaultChild.id)
                        expect(res.body[1].gender).to.eql(defaultChild.gender)
                        expect(res.body[1].age).to.eql(defaultChild.age)
                        expect(res.body[1].institution_id).to.eql(defaultInstitution.id)
                    })
            })

            it('families.children.get_all005: should return status code 200 and only the most recently registered children in the family', () => {

                const page = 1
                const limit = 1
                const sortField = 'username'

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children?page=${page}&limit=${limit}&sort=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0].id).to.eql(anotherChild.id)
                        expect(res.body[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[0].age).to.eql(anotherChild.age)
                        expect(res.body[0].institution_id).to.eql(defaultInstitution.id)
                    })
            })

            it('families.children.get_all006: should return status code 200 and empty array', async () => {
                await accountDB.deleteAllChildren()

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.eql([])
                    })
            })
        })

        context('when a duplicate error occurs', () => {

            it('families.children.get_all007: should return status code 400 and message info message from invalid parameter, because family does not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the family

                return request(URI)
                    .get(`/families/${NON_EXISTENT_ID}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_404_FAMILY_NOT_FOUND)
                    })
            })

            it('families.children.get_all008: should return status code 400 and message info message from invalid parameter, because family does not exist', () => {
                const INVALID_ID = '123' // invalid id of the family

                return request(URI)
                    .get(`/families/${INVALID_ID}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.children.get_all009: should return status code 400 and message info message from invalid parameter, because family does not exist', () => {
                const NULL_ID_FAMILY = null // invalid id of the family

                return request(URI)
                    .get(`/families/${NULL_ID_FAMILY}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        })

        context('when the user does not have permission to get all children associated with a family', () => {

            it('families.children.get_all010: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.get_all011: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.get_all012: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.get_all013: should return status code 403 and info message from insufficient permissions for another family user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.children.get_all014: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.children.get_all015: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/families/${defaultFamily.id}/children`)
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
