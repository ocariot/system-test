import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'
import { HealthProfessional } from '../../src/account-service/model/health.professional'

describe('Routes: users.healthprofessionals.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    let defaultHealthProfessionalToken: string
    let anotherHealthProfessionalToken: string

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

    const anotherHealthProfessional: HealthProfessional = new HealthProfessional()
    anotherHealthProfessional.username = 'another healthprofessional'
    anotherHealthProfessional.password = 'default pass'

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

    before(async () => {
        try {
            await con.connect(0, 1000)

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await con.removeCollections()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution
            defaultHealthProfessional.institution = defaultInstitution
            anotherHealthProfessional.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultChildrenGroup.children = new Array<Child>(resultChild)

            const resultDefaultProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultProfessional.id

            const resultAnotherProfessional = await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
            anotherHealthProfessional.id = resultAnotherProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                defaultHealthProfessionalToken = await acc.
                    auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            if (anotherHealthProfessional.username && anotherHealthProfessional.password) {
                anotherHealthProfessionalToken = await acc.
                    auth(anotherHealthProfessional.username, anotherHealthProfessional.password)
            }

        } catch (err) {
            console.log('Failure on healthprofessionals.children.groups.post test: ', err)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
            await con.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /users/healthprofessionals/:healthprofessional_id/children/groups', () => {
        afterEach(async () => {
            try {
                await con.deleteChildrenGroups()
            } catch (err) {
                console.log('Failure in users.healthprofessionals.children.groups.post test: ', err)
            }
        })

        context('when the health professional posting a new children group successfully', () => {
            it('healthprofessionals.children.groups.post001: should return status code 201 and a children group', () => {

                // children group without school_class (parameter not required)                     
                const body = {
                    name: defaultChildrenGroup.name,
                    children: defaultChildrenGroup.children
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(body.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                    })
            })

            describe('when the same group of children is registered for two different health professionals', () => {
                before(async () => {
                    try {
                        await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
                    } catch (err) {
                        console.log('Failure in users.healthprofessionals.children.groups.post test: ', err)
                    }
                })

                it('healthprofessionals.children.groups.post002: should return status code 201 and saved the children group', () => {

                    return request(URI)
                        .post(`/users/healthprofessionals/${anotherHealthProfessional.id}/children/groups`)
                        .send(defaultChildrenGroup)
                        .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(201)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children).is.an.instanceof(Array)
                            expect(res.body.children.length).to.eql(1)
                            expect(res.body.children[0]).to.have.property('id')
                            expect(res.body.children[0].username).to.eql(defaultChild.username)
                            expect(res.body.children[0].institution).to.have.property('id')
                            expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                            expect(res.body.children[0].age).to.eql(defaultChild.age)
                            expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        })
                })
            })

        })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
                } catch (err) {
                    console.log('Failure in users.healthprofessionals.children.groups.post test: ', err)
                }
            })
            it('healthprofessionals.children.groups.post003: should return status code 409 and message info about children group is already registered', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })

        context('when there are validation errors', () => {

            it('healthprofessionals.children.groups.post004: should return status code 400 and info message from missing parameters, because name was not provided', () => {

                const body = {
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_NAME_NOT_PROVIDED)
                    })
            })

            it('healthprofessionals.children.groups.post005: should return status code 400 and info message from missing parameters, because children was not provided', () => {

                const body = {
                    name: defaultChildrenGroup.name,
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_IDS_NOT_PROVIDED)
                    })
            })

            it('healthprofessionals.children.groups.post006: should return status code 400 and info message from invalid parameters, because children does not exist', () => {

                const NON_EXISTENT_CHILD_ID: any = '111a1a11aaa11aa111111111'

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(NON_EXISTENT_CHILD_ID),
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_NOT_REGISTERED.description += ' '.concat(NON_EXISTENT_CHILD_ID)
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_NOT_REGISTERED)
                    })
            })

            it('healthprofessionals.children.groups.post007: should return status code 400 and info message from children id(ids) is invalid', () => {

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>('123'),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        // caso o ID contenha caracteres não numéricos (ex: 5a) o erro retornado é correto
                    })
            })

            it('healthprofessionals.children.groups.post008: should return status code 400 and info message from healthprofessional_id is invalid', () => {

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/users/healthprofessionals/${acc.INVALID_ID}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) //validation erros occurs

        describe('when the health professional is not found', () => {
            it('healthprofessionals.children.groups.post009: should return status code 404 and info message about health professional not found', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${acc.NON_EXISTENT_ID}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.HEALTH_PROFESSIONAL.ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission to register a children group for the health professional', () => {

            it('healthprofessionals.children.groups.post010: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.post011: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.post012: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.post013: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.post014: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.post015: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('healthprofessionals.children.groups.post016: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(defaultChildrenGroup)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
