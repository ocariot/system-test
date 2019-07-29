import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'
import { HealthProfessional } from '../../src/account-service/model/health.professional';

describe('Routes: users.healthprofessionals.children.groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

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

    let defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
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
            anotherChild.institution = defaultInstitution
            defaultHealthProfessional.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            const resultProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                defaultHealthProfessionalToken = await acc.
                    auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild, resultAnotherChild)

            const resultChildrenGroup = await acc.saveChildrenGroupsForHealthProfessional(defaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)
            defaultChildrenGroup.id = resultChildrenGroup.id

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.children.groups.get_id test: ', err)
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

    describe('GET /users/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {

        // Should the child's personal data (username, age, and gender) come in the answer, since the health professional 
        // is not allowed to view data from children?
        context('when the health professional get your unique children group successfully', () => {

            it('healthprofessionals.children.groups.get_id001: should return status code 200 and a children group, without child personal data', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(2)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.not.have.property('username')
                        expect(res.body.children[0]).to.not.have.property('gender')
                        expect(res.body.children[0]).to.not.have.property('age')
                        // expect(res.body.children[0].username).to.eql(defaultChild.username)
                        // expect(res.body.children[0].age).to.eql(defaultChild.age)
                        // expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[1]).to.have.property('id')
                        expect(res.body.children[1]).to.not.have.property('username')
                        expect(res.body.children[1]).to.not.have.property('gender')
                        expect(res.body.children[1]).to.not.have.property('age')
                        // expect(res.body.children[1].username).to.eql(anotherChild.username)
                        // expect(res.body.children[1].age).to.eql(anotherChild.age)
                        // expect(res.body.children[1].gender).to.eql(anotherChild.gender)
                        expect(res.body.children[1].institution).to.have.property('id')
                        expect(res.body.children[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[1].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })

            })

            describe('after updating the data of the child that belong to the group', () => {
                before(async () => {
                    try {
                        anotherChild.age = 15
                        await acc.updateChild(accessTokenAdmin, anotherChild, { age: 15 })
                    } catch (err) {
                        console.log('Failure in healthprofessionals.children.groups.get_id test: ', err)
                    }
                })
                it('healthprofessionals.children.groups.get_id002: should return status code 200 and a children group', () => {

                    return request(URI)
                        .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children).is.an.instanceof(Array)
                            expect(res.body.children.length).to.eql(2)
                            expect(res.body.children[0]).to.have.property('id')
                            expect(res.body.children[0]).to.not.have.property('username')
                            // expect(res.body.children[0].username).to.eql(defaultChild.username)
                            expect(res.body.children[0].institution).to.have.property('id')
                            expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                            expect(res.body.children[0]).to.not.have.property('age')
                            expect(res.body.children[0]).to.not.has.property('genders')
                            // expect(res.body.children[0].age).to.eql(defaultChild.age)
                            // expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                            expect(res.body.children[1]).to.have.property('id')
                            expect(res.body.children[1]).to.not.have.property('username')
                            // expect(res.body.children[1].username).to.eql(anotherChild.username)
                            expect(res.body.children[1].institution).to.have.property('id')
                            expect(res.body.children[1].institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.children[1].institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.children[1].institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.children[1].institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.children[1].institution.longitude).to.eql(defaultInstitution.longitude)
                            expect(res.body.children[1]).to.not.have.property('age')
                            expect(res.body.children[1]).to.not.has.property('genders')
                            // expect(res.body.children[1].age).to.eql(anotherChild.age)
                            // expect(res.body.children[1].gender).to.eql(anotherChild.gender)
                            expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        })
                })
            })

            it('healthprofessionals.children.groups.get_id003: should return status code 200 and a list with ID and name of the children groups', () => {

                const field = 'name'
                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}?fields=${field}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body).to.not.have.property('children')
                        expect(res.body.school_class).to.not.have.property('school_class')
                    })
            })

            describe('after deleting one of the children', () => {
                before(async () => {
                    try {
                        await acc.deleteUser(accessTokenAdmin, anotherChild.id)
                    } catch (err) {
                        console.log('Failure in healrhprofessionals.children.groups.get_id test: ', err)
                    }
                })
                it('healthprofessionals.children.groups.get_id004: should return status code 200 and a children group with only one child', () => {

                    return request(URI)
                        .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql(defaultChildrenGroup.name)
                            expect(res.body.children).is.an.instanceof(Array)
                            expect(res.body.children.length).to.eql(1)
                            expect(res.body.children[0]).to.have.property('id')
                            expect(res.body.children[0]).to.not.have.property('username')
                            // expect(res.body.children[0].username).to.eql(defaultChild.username)
                            expect(res.body.children[0].institution).to.have.property('id')
                            expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                            expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                            expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                            expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                            expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                            expect(res.body.children[0]).to.not.have.property('age')
                            expect(res.body.children[0]).to.not.have.property('gender')
                            // expect(res.body.children[0].age).to.eql(defaultChild.age)
                            // expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        })
                })
            })

        }) // get a unique children_group successfully

        describe('when the health professional is not found', () => {
            it('healthprofessionals.children.groups.get_id005: should return status code 404 and info message from health professional not found', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${acc.NON_EXISTENT_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.HEALTH_PROFESSIONAL.ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND)
                    })
            })
        })

        describe('when the children group is not found', () => {
            it('healthprofessionals.children.groups.get_id006: should return status code 404 and info message from children group not found', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_404_CHILDREN_GROUP_NOT_FOUND)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('healthprofessionals.children.groups.get_id007: should return status code 400 and message info about invalid healthprofessional_id', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${acc.INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('healthprofessionals.children.groups.get_id008: should return status code 400 and message info about invalid children_groups_id', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) //validation error occurs

        context('when the user does not have permission to get a unique children group of the health professional', () => {

            it('healthprofessionals.children.groups.get_id009: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.get_id010: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.get_id011: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.get_id012: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.get_id013: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.children.groups.get_id014: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('healthprofessionals.children.groups.get_id015: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/${defaultChildrenGroup.id}`)
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
