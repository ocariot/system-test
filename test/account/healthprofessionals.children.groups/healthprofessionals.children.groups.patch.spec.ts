import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'

describe('Routes: healthprofessionals.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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
            await accountDB.connect()

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

    describe('PATCH /healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {

        context('when the health professional update your children group successfully', () => {

            it('healthprofessionals.children.groups.patch001: should return status code 200 and a updated children group', () => {

                defaultChildrenGroup.name = 'another cool children group name'
                defaultChildrenGroup.school_class = '5th grade'

                const body = {
                    name: defaultChildrenGroup.name,
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            it('healthprofessionals.children.groups.patch002: should return status code 200 and associate a child to the children group', () => {

                // associating anotherChild to the children group
                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[1].username).to.eql(anotherChild.username)
                        expect(res.body.children[1].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[1].age).to.eql(anotherChild.age)
                        expect(res.body.children[1].gender).to.eql(anotherChild.gender)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })

            it('healthprofessionals.children.groups.patch003: should return status code 200 and dissociate a child to the children group', () => {

                // dissociating anotherChild from children group
                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
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
                        .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
                            expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
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
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ name: anotherChildGroup.name })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('healthprofessionals.children.groups.patch006: should return status code 400 and message from child(ren) not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [NON_EXISTENT_ID] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('It is necessary for children to be registered before proceeding.')
                        expect(err.body.description).to.eql(`The following IDs were verified without registration: ${NON_EXISTENT_ID}`)
                    })
            })

            it('healthprofessionals.children.groups.patch007: should return status code 400 and info message from invalid ID, because children_id(s) is invalid', () => {
                const INVALID_ID = '123' // invalid id of the child

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [INVALID_ID] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('One or more request fields are invalid...')
                        expect(err.body.description).to.eql(`The following IDs from children attribute are not in valid format: ${INVALID_ID}`)
                    })

            })

            it('healthprofessionals.children.groups.patch008: should return status code 400 and info message from invalid ID, because healthprofessional_id is invalid', () => {
                const INVALID_ID = '123' // invalid id of the health professional

                return request(URI)
                    .patch(`/healthprofessionals/${INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_CHILDREN_GROUPS_HEALTHPROFESSIONAL_INVALID_ID)
                    })
            })

            it('healthprofessionals.children.groups.patch009: should return status code 400 and info message from invalid ID, because children group_id is invalid', () => {
                const INVALID_ID = '123' // invalid id of the children.group

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${INVALID_ID}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('healthprofessionals.children.groups.patch010: should return status code 400 and info message from invalid name, because is null', () => {
                const NULL_NAME = null // invalid name of the children.group

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ name: NULL_NAME })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_NAME)
                    })
            })

            it('healthprofessionals.children.groups.patch011: should return status code 400 and info message from invalid school_class, because is null', () => {
                const NULL_SCHOOL_CLASS = null // invalid school_class of the children.group

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ school_class: NULL_SCHOOL_CLASS })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_INVALID_SCHOOL_CLASS)
                    })
            })

            it('healthprofessionals.children.groups.patch012: should return status code 400 and info message from invalid children, because is null', () => {
                const ID_CHILD = null // invalid child id

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [ID_CHILD] })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILDREN_GROUPS.ERROR_400_NULL_CHILDREN_ID)
                    })
            })

        }) // validation error occurs

        describe('when the user does not have permission for update a children group of the health professional', () => {

            it('healthprofessionals.children.groups.patch013: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch014: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch015: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch016: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch017: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.patch018: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) //user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.children.groups.patch019: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({})
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
