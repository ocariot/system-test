import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Educator } from '../../../src/account-service/model/educator'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group';
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: educators.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let defaultEducatorToken: string
    let anotherEducatorToken: string

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

    const anotherEducator: Educator = new Educator()
    anotherEducator.username = 'another educator'
    anotherEducator.password = 'default pass'

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

            defaultChild.institution = defaultInstitution
            defaultEducator.institution = defaultInstitution
            anotherEducator.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultAnotherEducator = await acc.saveEducator(accessTokenAdmin, anotherEducator)
            anotherEducator.id = resultAnotherEducator.id

            if (defaultEducator.username && defaultEducator.password) {
                defaultEducatorToken = await acc.
                    auth(defaultEducator.username, defaultEducator.password)
            }

            if (anotherEducator.username && anotherEducator.password) {
                anotherEducatorToken = await acc.
                    auth(anotherEducator.username, anotherEducator.password)
            }

            const resultGetDefaultEducator = await acc.getEducatorById(accessTokenAdmin, defaultEducator.id)
            defaultEducator.last_login = resultGetDefaultEducator.last_login

            const resultGetAnotherEducator = await acc.getEducatorById(accessTokenAdmin, anotherEducator.id)
            anotherEducator.last_login = resultGetAnotherEducator.last_login

        } catch (err) {
            console.log('Failure on Before from educator.children.groups.post test: : ', err)
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

    describe('POST /educators/:educator_id/children/groups', () => {
        afterEach(async () => {
            try {
                await accountDB.deleteChildrenGroups()
            } catch (err) {
                console.log('Failure in educators.children.groups test: ', err)
            }
        })

        context('when the educator posting a new children group successfully', () => {
            it('educators.children.group.post001: should return status code 201 and a children group', () => {

                // children group without school_class (parameter not required)                     
                const body = {
                    name: defaultChildrenGroup.name,
                    children: defaultChildrenGroup.children
                }

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(body.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                    })
            })

            describe('when the same group of children is registered for two different educators', () => {
                before(async () => {
                    try {
                        await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
                    } catch (err) {
                        console.log('Failure in educators.children.groups test: ', err)
                    }
                })

                it('educators.children.group.post002: should return status code 201 and saved the children group', () => {

                    return request(URI)
                        .post(`/educators/${anotherEducator.id}/children/groups`)
                        .send(defaultChildrenGroup)
                        .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(201)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children).is.an.instanceof(Array)
                            expect(res.body.children.length).to.eql(1)
                            expect(res.body.children[0]).to.have.property('id')
                            expect(res.body.children[0].username).to.eql(defaultChild.username)
                            expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body.children[0].age).to.eql(defaultChild.age)
                            expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        })
                })
            })

        })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, defaultChildrenGroup)
                } catch (err) {
                    console.log('Failure in educators.children.groups.post test:', err)
                }
            })
            it('educators.children.group.post003: should return status code 409 and message info about children group is already registered', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })

        context('when there are validation errors', () => {

            it('educators.children.group.post004: should return status code 400 and info message from missing parameters, because name was not provided', () => {

                const body = {
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_NAME_NOT_PROVIDED)
                    })
            })

            it('educators.children.group.post005: should return status code 400 and info message from missing parameters, because children not provided', () => {

                const body = {
                    name: defaultChildrenGroup.name,
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_IDS_NOT_PROVIDED)
                    })
            })

            it('educators.children.group.post006: should return status code 400 and info message from invalid parameters, because children does not exist', () => {

                const NON_EXISTENT_CHILD_ID: any = '111a1a11aaa11aa111111111'

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(NON_EXISTENT_CHILD_ID),
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        const EXPECTED_RESPONSE = ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_NOT_REGISTERED
                        EXPECTED_RESPONSE.description += ' '.concat(NON_EXISTENT_CHILD_ID)
                        expect(err.body).to.eql(EXPECTED_RESPONSE)
                    })
            })

            it('educators.children.group.post007: should return status code 400 and info message from children id(ids) is invalid', () => {
                const INVALID_ID = '123' // invalid id of the child

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(INVALID_ID),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('One or more request fields are invalid...')
                        expect(err.body.description).to.eql(`The following IDs from children attribute are not in valid format: ${INVALID_ID}`)
                    })
            })

            it('educators.children.group.post008: should return status code 400 and info message from educator_id is invalid', () => {
                const INVALID_ID = '123' // invalid id of the educator

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/educators/${INVALID_ID}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_EDUCATOR_INVALID_FORMAT_ID)
                    })
            })

            it('educators.children.group.post009: should return status code 400 and info message, because name is null', () => {
                const NULL_NAME = null // invalid name of the children.group

                const body = {
                    name: NULL_NAME,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }


                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_NAME)
                    })
            })

            it('educators.children.group.post010: should return status code 400 and info message, because name is a number', () => {
                const NUMBER_NAME = 123 // invalid name of the children.group

                const body = {
                    name: NUMBER_NAME,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }


                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_NAME)
                    })
            })

        }) //validation erros occurs

        describe('when the educator is not found', () => {
            it('educators.children.group.post011: should return status code 403 and info message from insufficient permissions, because a non-existent id does not match to user id.', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the educator

                return request(URI)
                    .post(`/educators/${NON_EXISTENT_ID}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the user does not have permission to register a children group for the educator', () => {

            it('educators.children.group.post012: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.group.post013: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.group.post014: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.group.post015: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.group.post016: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.children.group.post017: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('educators.children.group.post018: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post(`/educators/${defaultEducator.id}/children/groups`)
                    .send(defaultChildrenGroup)
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