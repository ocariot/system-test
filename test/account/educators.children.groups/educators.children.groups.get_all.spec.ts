import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Educator } from '../../../src/account-service/model/educator'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'

describe('Routes: educators.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

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

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 8

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    const anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()
    anotherChildrenGroup.name = 'another children group'
    anotherChildrenGroup.school_class = '3th grade'

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
            anotherChild.institution = defaultInstitution
            defaultEducator.institution = resultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)
            anotherChildrenGroup.children = new Array<Child>(resultAnotherChild)

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            if (defaultEducator.username && defaultEducator.password) {
                defaultEducatorToken = await acc.
                    auth(defaultEducator.username, defaultEducator.password)
            }

            const resultGetDefaultEducator = await acc.getEducatorById(accessTokenAdmin, defaultEducator.id)
            defaultEducator.last_login = resultGetDefaultEducator.last_login

            const resultDefaultChildrenGroup = await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
            defaultChildrenGroup.id = resultDefaultChildrenGroup.id

            const resultAnotherChildrenGroup = await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, anotherChildrenGroup)
            anotherChildrenGroup.id = resultAnotherChildrenGroup.id

        } catch (err) {
            console.log('Failure on Before from educators.children.groups.get_all test: ' + err)
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

    describe('GET  /educators/:educator_id/children/groups', () => {

        context('when the educator get all yours children groups successfully', () => {

            it('educators.children.groups.get_all001: should return status code 200 and a list of children groups', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(2)

                        expect(res.body[0].id).to.eql(anotherChildrenGroup.id)
                        expect(res.body[0].name).to.eql(anotherChildrenGroup.name)
                        expect(res.body[0]).to.have.property('children')
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0]).to.have.property('username')
                        expect(res.body[0].children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[0].children[0]).to.have.property('age')
                        expect(res.body[0].children[0]).to.have.property('gender')
                        expect(res.body[0].school_class).to.eql(anotherChildrenGroup.school_class)

                        expect(res.body[1].id).to.eql(defaultChildrenGroup.id)
                        expect(res.body[1].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[1]).to.have.property('children')
                        expect(res.body[1].children).is.an.instanceof(Array)
                        expect(res.body[1].children.length).to.eql(1)
                        expect(res.body[1].children[0]).to.have.property('id')
                        expect(res.body[1].children[0]).to.have.property('username')
                        expect(res.body[1].children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].children[0]).to.have.property('age')
                        expect(res.body[1].children[0]).to.have.property('gender')
                        expect(res.body[1].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            it('educators.children.groups.get_all002: should return status code 200 and a list of children groups in ascending order by children group name', () => {

                const sort = 'name'
                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0].name).to.eql(anotherChildrenGroup.name)
                        expect(res.body[0].id).to.eql(anotherChildrenGroup.id)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].school_class).to.eql(anotherChildrenGroup.school_class)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0].id).to.eql(anotherChild.id)
                        expect(res.body[0].children[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[0].children[0].age).to.eql(anotherChild.age)
                        expect(res.body[0].children[0].gender).to.eql(anotherChild.gender)

                        expect(res.body[1].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[1].id).to.eql(defaultChildrenGroup.id)
                        expect(res.body[1].children).is.an.instanceof(Array)
                        expect(res.body[1].school_class).to.eql(defaultChildrenGroup.school_class)
                        expect(res.body[1].children.length).to.eql(1)
                        expect(res.body[1].children[0].id).to.eql(defaultChild.id)
                        expect(res.body[1].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[1].children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[1].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[1].children[0].gender).to.eql(defaultChild.gender)
                    })
            })

            it('educators.children.groups.get_all003: should return status code 200 and a list with only the most recently registered children group for the educator', () => {

                const page = 1
                const limit = 1

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0].id).to.eql(anotherChildrenGroup.id)
                        expect(res.body[0].name).to.eql(anotherChildrenGroup.name)
                        expect(res.body[0]).to.have.property('children')
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0]).to.have.property('username')
                        expect(res.body[0].children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body[0].children[0]).to.have.property('age')
                        expect(res.body[0].children[0]).to.have.property('gender')
                        expect(res.body[0].school_class).to.eql(anotherChildrenGroup.school_class)
                    })
            })

            describe('get all children groups from educator after deleting one of them', () => {
                before(async () => {
                    try {
                        await acc
                            .deleteChildrenGroupFromEducator(
                                defaultEducatorToken, defaultEducator, anotherChildrenGroup
                            )
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                it('educators.children.groups.get_all004: should return status code 200 and a list with only one children groups', () => {

                    return request(URI)
                        .get(`/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.be.an.instanceof(Array)
                            expect(res.body.length).to.eql(1)
                            expect(res.body[0].id).to.eql(defaultChildrenGroup.id)
                            expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                            expect(res.body[0]).to.have.property('children')
                            expect(res.body[0].children).is.an.instanceof(Array)
                            expect(res.body[0].children.length).to.eql(1)
                            expect(res.body[0].children[0]).to.have.property('id')
                            expect(res.body[0].children[0]).to.have.property('username')
                            expect(res.body[0].children[0].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[0].children[0]).to.have.property('age')
                            expect(res.body[0].children[0]).to.have.property('gender')
                            expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                        })
                })
            })
        }) // get all children groups successfully
        
        describe('when the educator not found', () => {

            it('educators.children.groups.get_all005: should return status code 200 and empty array, because the educator was not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the educator

                return request(URI)
                    .get(`/educators/${NON_EXISTENT_ID}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_EDUCATOR_NOT_FOUND)
                    })
            })
        })    

        describe('when the educator_id is invalid', () => {
            it('educators.children.groups.get_all006: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of the educator

                return request(URI)
                    .get(`/educators/${INVALID_ID}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_EDUCATOR_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get all children groups for the educator', () => {

            it('educators.children.groups.get_all007: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.get_all008: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.get_all009: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.get_all010: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.get_all011: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.groups.get_all012: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('educators.children.groups.get_all013: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/educators/${defaultEducator.id}/children/groups`)
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
