import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'
import { HealthProfessional } from '../../src/account-service/model/health.professional'

describe('Routes: users.healthprofessionals.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let defaultHealthProfessionalToken: string
    let anotherHealthProfessionalToken: string

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
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

    // children group without school_class (not required parameter)
    const anotherChildGroup: ChildrenGroup = new ChildrenGroup()
    anotherChildGroup.name = 'another children group'


    before(async () => {
        try {
            await accountDB.connect(0, 1000)

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await accountDB.removeCollections()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution
            anotherChild.institution = defaultInstitution
            defaultHealthProfessional.institution = defaultInstitution
            anotherHealthProfessional.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            const resultDefaultProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultProfessional.id

            const resultAnotherProfessional = await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
            anotherHealthProfessional.id = resultAnotherProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                defaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            if (anotherHealthProfessional.username && anotherHealthProfessional.password) {
                anotherHealthProfessionalToken = await acc.auth(anotherHealthProfessional.username, anotherHealthProfessional.password)
            }

            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)
            anotherChildGroup.children = new Array<Child>(resultAnotherChild)

            const resultDefaultChildrenGroup = await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
            defaultChildrenGroup.id = resultDefaultChildrenGroup.id

            const resultAnotherChildGroup = await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, anotherChildGroup)
            anotherChildGroup.id = resultAnotherChildGroup.id

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.children.groups.patch test: ', err)
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

    describe('PATCH /users/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {

        context('when the health professional update your children group successfully', () => {

            it('healthprofessionals.children.groups.patch001: should return status code 200 and a updated children group', () => {

                defaultChildrenGroup.name = 'another cool children group name'
                defaultChildrenGroup.school_class = '5th grade'

                const body = {
                    name: defaultChildrenGroup.name,
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
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
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            it('healthprofessionals.children.groups.patch002: should return status code 200 and associate a child to the children group', () => {

                // associating anotherChild to the children group
                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id, anotherChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(2)
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
                        expect(res.body.children[1].username).to.eql(anotherChild.username)
                        expect(res.body.children[1].institution).to.have.property('id')
                        expect(res.body.children[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[1].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[1].age).to.eql(anotherChild.age)
                        expect(res.body.children[1].gender).to.eql(anotherChild.gender)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            it('healthprofessionals.children.groups.patch003: should return status code 200 and dissociate a child to the children group', () => {

                // dissociating anotherChild from children group
                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
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
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            describe('when updating the name of children group of an health professional, to the same name of another children group of a differente health professional that contains the same children', () => {
                before(async () => {
                    try {
                        const childrenGroup: ChildrenGroup = new ChildrenGroup()
                        childrenGroup.name = 'new cool name'
                        childrenGroup.children = defaultChildrenGroup.children
                        childrenGroup.school_class = defaultChildrenGroup.school_class

                        await acc.saveChildrenGroupsForHealthProfessional(anotherHealthProfessionalToken, anotherHealthProfessional, childrenGroup)
                    } catch (err) {
                        console.log('Failure in healthprofessionals.children.groups.patch test: ', err)
                    }
                })

                it('healthprofessionals.children.groups.patch004: should return status code 200 and a updated children group', () => {

                    defaultChildrenGroup.name = 'new cool username'

                    return request(URI)
                        .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({ name: 'new cool name' })
                        .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql('new cool name')
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
                            expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        })
                })
            })

        }) // update successfull

        describe('when a duplicate error occurs, when updating the name of children group to the same name of another group, both belonging to the same health professional', () => {
            it('healthprofessionals.children.groups.patch005: should return status code 409 and info message about children group is already registered', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ name: anotherChildGroup.name })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('healthprofessionals.children.groups.patch006: should return status code 400 and message from child(ren) not found', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [acc.NON_EXISTENT_ID] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_INVALID_CHILDREN_IDS)
                    })
            })

            it('healthprofessionals.children.groups.patch007: should return status code 400 and info message from invalid ID, because children_id(s) is invalid', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [acc.INVALID_ID] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        // caso o ID contenha caracteres não numéricos (ex: 5a) o erro retornado é correto
                    })

            })

            it('healthprofessionals.children.groups.patch008: should return status code 400 and info message from invalid ID, because healthprofessional_id is invalid', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${acc.INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('healthprofessionals.children.groups.patch009: should return status code 400 and info message from invalid ID, because children group_id is invalid', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${acc.INVALID_ID}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) // validation error occurs

        describe('when the user does not have permission for update a children group of the health professional', () => {

            it('healthprofessionals.children.groups.patch010: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch011: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch012: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch013: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch014: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch015: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) //user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.children.groups.patch016: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
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
