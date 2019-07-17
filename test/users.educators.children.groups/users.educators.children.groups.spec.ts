import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Educator } from '../../src/account-service/model/educator'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'

describe('Routes: users.educators.children_groups', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

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

    let defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    let anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()
    anotherChildrenGroup.name = 'another children group'
    anotherChildrenGroup.school_class = '3th grade'

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

            defaultChild.institution = resultInstitution
            defaultEducator.institution = resultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            if (defaultEducator.username && defaultEducator.password) {
                defaultEducatorToken = await acc.
                    auth(defaultEducator.username, defaultEducator.password)
            }          

        } catch (err) {
            console.log('Failure on Educators test: ' + err.message)
        }
    })

    after(async () => {
        try {
            // await con.removeCollections()
            await con.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /users/educators/:educator_id/children/groups', () => {
        context('when posting a new children group', () => {
            it('should return status code 201 and a children group', () => {

                // children group without school_class                     
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id),
                }

                return request(URI)
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
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
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        defaultChildrenGroup.id = res.body.id
                        defaultChildrenGroup.children = res.body.children
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {

                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request(URI)
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })

        context('when there are validation errors', () => {
            context('name not provided', () => {
                it('should return status code 400 and info message from invalid or missing parameters', () => {

                    const body = {
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: defaultChildrenGroup.school_class
                    }

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(body)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_NAME_NOT_PROVIDED)
                        })
                })
            })
            context('collection whith children IDs not provided', () => {
                it('should return status code 400 and info message from invalid or missing parameters', () => {

                    const body = {
                        name: defaultChildrenGroup.name,
                        school_class: defaultChildrenGroup.school_class
                    }

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(body)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_IDS_NOT_PROVIDED)
                        })
                })
            })
            context('collection with children IDs that does not exist', () => {
                it('should return status code 400 and info message from invalid or missing parameters', () => {

                    const body = {
                        name: 'Another Children Group',
                        children: new Array<string | undefined>('507f1f77bcf86cd799439011'),
                        school_class: defaultChildrenGroup.school_class
                    }

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(body)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_NOT_REGISTERED.description += ' 507f1f77bcf86cd799439011'
                            expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_CHILDREN_NOT_REGISTERED)
                        })
                })
            })
            context('when the children id(ids) is invalid', () => {
                it('should return status code 400 and info message from invalid ID', () => {

                    const body = {
                        name: 'Another Children Group',
                        children: new Array<string | undefined>('123'),
                        school_class: '4th Grade'
                    }

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(body)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                            // caso o ID contenha caracteres não numéricos (ex: 5a) o erro retornado é correto
                        })
                })
            })
            context('when the educator_id is invalid', () => {
                it('should return status code 400 and info message from invalid ID', () => {

                    const body = {
                        name: 'Another Children Group',
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: '4th Grade'
                    }

                    return request(URI)
                        .post(`/users/educators/${acc.INVALID_ID}/children/groups`)
                        .send(body)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) //validation erros occurs

        context('when the educator is not found', () => {
            it('should return status code 404 and info message about educator not found', () => {

                const body = {
                    name: 'Another Children Group',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/users/educators/${acc.NON_EXISTENT_ID}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission', () => {
            let childrenGroupOne: any
            before(() => {
                childrenGroupOne = {
                    name: 'Children Group One',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }
            })

            context('child posting children group for educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(childrenGroupOne)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('family posting children group for educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(childrenGroupOne)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('application posting children group for educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .post(`/users/educators/${defaultEducator.id}/children/groups`)
                        .send(childrenGroupOne)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

        context('when the educator posting children group for another educator', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    name: 'Children Group Two',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
        context('when the health professional posting children group for educator', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    name: 'Children Group Tree',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: '4th Grade'
                }

                return request(URI)
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET /users/educators/:educator_id/children/groups/:group_id', () => {
        before(async () => {
            try {
                await con.deleteChildrenGroups()

                anotherChild.institution = defaultInstitution
                const resultChild = await acc.saveChild(accessTokenAdmin, anotherChild)
                anotherChild.id = resultChild.id

                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id, anotherChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                const resultChildrenGroup = await acc
                    .saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, body)

                defaultChildrenGroup.id = resultChildrenGroup.id
                defaultChildrenGroup.children = resultChildrenGroup.children

            } catch (err) {
                console.log('Failure on Educators test: ' + err.message)
            }
        })

        context('when the educator get a unique children group', () => {
            it('should return status code 200 and a children group, without child personal data', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
                        expect(res.body.children[1].institution).to.have.property('id')
                        expect(res.body.children[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.children[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.children[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.children[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.children[1].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })

            })
        })


        context('when get a unique children group', () => {
            it('should return status code 200 and a children group', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
                        expect(res.body.children[1]).to.have.property('id')
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

            context('only the ID and name of the children belong to a unique children group in database', () => {
                it('should return status code 200 and a list with ID and name of the children', () => {

                    const field = 'name'
                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}?fields=${field}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.name).to.eql(defaultChildrenGroup.name)
                            expect(res.body).to.not.have.property('children')
                            expect(res.body.school_class).to.not.have.property('school_class')
                        })
                })
            })

            context('after updating the data of the child that belong to the group', () => {
                before(async () => {
                    try {
                        anotherChild.age = 15
                        await acc.updateChild(accessTokenAdmin, anotherChild, { age: 15 })
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                it('should return status code 200 and a children group', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
                            expect(res.body.children[1]).to.have.property('id')
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
            })

            context('after deleting one of the children', () => {
                before(async () => {
                    try {
                        await acc.deleteUser(accessTokenAdmin, anotherChild)
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                it('should return status code 200 and a children group', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
                        })
                })
            })
        }) //200 OK

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .get(`/users/educators/${acc.NON_EXISTENT_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the children group is not found', () => {
            it('should return status code 404 and info message from children group not found', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_404_CHILDREN_GROUP_NOT_FOUND)
                    })
            })
        })

        context('when a validation error occurs', () => {

            context('educator_id is invalid', () => {
                it('should return status code 400 and message info about invalid id', () => {

                    return request(URI)
                        .get(`/users/educators/${acc.INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
            context('children group_id is invalid', () => {
                it('should return status code 400 and message info about invalid id', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${acc.INVALID_ID}`)
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) //validation error occurs

        describe('when the user does not have permission', () => {

            context('admin get a unique children group', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('child get a unique children group', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('health professional get a unique children group', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('family get a unique children group', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('application get a unique children group', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('educator get a unique children group from another educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) // user does not have permission 
    })

    describe('GET  /users/educators/:educator_id/children/groups', () => {
        context('when want all children groups from educator', () => {
            it('should return status code 200 and a list of children groups', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].children[0].institution).to.have.property('id')
                        expect(res.body[0].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when get only ID and name of all children groups from educator in database', () => {
            it('should return status code 200 and a list with only ID and name of children groups', () => {

                const field = 'name'
                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups?fields=${field}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[0]).to.not.have.property('children')
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when get all children groups from educator in ascending order by name from database', () => {
            before(async () => {
                try {

                    const resultChild = await acc.saveChild(accessTokenAdmin, anotherChild)
                    anotherChild.id = resultChild.id

                    const body = {
                        name: anotherChildrenGroup.name,
                        children: new Array<string | undefined>(anotherChild.id),
                        school_class: anotherChildrenGroup.school_class
                    }

                    const resultChildrenGroup = await acc
                        .saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, body)
                    anotherChildrenGroup.id = resultChildrenGroup.id
                    anotherChildrenGroup.children = resultChildrenGroup.children

                } catch (err) {
                    console.log('Failure in Educator test? ', err)
                }
            })
            it('should return status code 200 and a list of children groups in ascending order', () => {

                const sort = 'name'
                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(anotherChildrenGroup.name)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].school_class).to.eql(anotherChildrenGroup.school_class)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].children[0].institution).to.have.property('id')
                        expect(res.body[0].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0].children[0].age).to.eql(anotherChild.age)
                        expect(res.body[0].children[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[1].children).is.an.instanceof(Array)
                        expect(res.body[1].school_class).to.eql(defaultChildrenGroup.school_class)
                        expect(res.body[1].children.length).to.eql(1)
                        expect(res.body[1].children[0]).to.have.property('id')
                        expect(res.body[1].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[1].children[0].institution).to.have.property('id')
                        expect(res.body[1].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[1].children[0].gender).to.eql(defaultChild.gender)
                    })
            })
        })

        context('when get only the two most recent children groups from educator in database', () => {
            it('should return status code 200 and a list of children groups', () => {

                const page = 1
                const limit = 2
                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups?page=${page}&page=${limit}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(anotherChildrenGroup.name)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].school_class).to.eql(anotherChildrenGroup.school_class)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].children[0].institution).to.have.property('id')
                        expect(res.body[0].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0].children[0].age).to.eql(anotherChild.age)
                        expect(res.body[0].children[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[1].children).is.an.instanceof(Array)
                        expect(res.body[1].school_class).to.eql(defaultChildrenGroup.school_class)
                        expect(res.body[1].children.length).to.eql(1)
                        expect(res.body[1].children[0]).to.have.property('id')
                        expect(res.body[1].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[1].children[0].institution).to.have.property('id')
                        expect(res.body[1].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[1].children[0].gender).to.eql(defaultChild.gender)
                    })
            })
        })

        context('when want all children groups from educator after deleting one of them', () => {
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
            it('should return status code 200 and a list of children groups', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].children[0].institution).to.have.property('id')
                        expect(res.body[0].children[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].children[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].children[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].children[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].children[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 200 and empty array', () => {

                return request(URI)
                    .get(`/users/educators/${acc.NON_EXISTENT_ID}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.eql([])
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .get(`/users/educators/${acc.INVALID_ID}/children/groups`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the user does not have permission', () => {
            context('admin get all children groups from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('child get all children groups from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('health professional get all children groups from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('family get all children groups from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('application get all children groups from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('educator get all children groups from another educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}/children/groups`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })
    })

    describe('PATCH /users/educators/:educator_id/children/groups/:group_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated children group', () => {

                defaultChildrenGroup.name = 'another cool children group name'
                defaultChildrenGroup.school_class = '5th grade'

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({
                        name: defaultChildrenGroup.name,
                        school_class: defaultChildrenGroup.school_class
                    })
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    const body = {
                        name: 'anothercoolname',
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: defaultChildrenGroup.school_class
                    }
                    await acc
                        .saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, body)

                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 409 and info message about duplicate items', async () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ name: 'anothercoolname' })
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_409_DUPLICATE_CHILDREN_GROUPS)
                    })
            })
        })



        context('when associate a child to the children group from educator', () => {
            it('should return status code 200 and a updated children group', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id, anotherChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
        })

        context('when dissociate a child to the children group from educator', () => {
            it('should return status code 200 and a updated children group', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .send({ children: [defaultChild.id] })
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
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
        })

        describe('when a validation error occurs', () => {
            context('child(ren) provided does not exist', () => {
                it('should return status code 400 and message from child(ren) not found', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({ children: [acc.NON_EXISTENT_ID] })
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_INVALID_CHILDREN_IDS)
                        })
                })
            })
            context('children_id(s) is invalid', () => {
                it('should return status code 400 and info message from invalid ID', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({ children: [acc.INVALID_ID] })
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                            // caso o ID contenha caracteres não numéricos (ex: 5a) o erro retornado é correto
                        })

                })
            })
            context('educator_id is invalid', () => {
                it('should return status code 400 and info message from invalid ID', () => {

                    return request(URI)
                        .patch(`/users/educators/${acc.INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                        .send({ children: [defaultChild.id] })
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
            context('children group_id is invalid', () => {
                it('should return status code 400 and info message from invalid ID', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${acc.INVALID_ID}`)
                        .send({ children: [defaultChild.id] })
                        .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) // validation error occurs

        describe('when the user does not have permission', () => {
            context('admin update children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('child update children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('health professional update children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('family update children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('application update children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('educator update children group from another educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) //user does not have permission
    })

    describe('DELETE /users/educators/:educator_id/children/groups/:group_id', () => {
        before(async () => {
            try {
                const body = {
                    name: anotherChildrenGroup.id,
                    children: new Array<string | undefined>(anotherChild.id),
                    school_class: anotherChildrenGroup.school_class
                }

                const resultChildrenGroup = await acc
                    .saveChildrenGroupsForEducator(defaultEducatorToken, defaultEducator, body)
                anotherChildrenGroup.id = resultChildrenGroup.id
                anotherChildrenGroup.children = resultChildrenGroup.children

            } catch (err) {
                console.log('Failure on Educators test: ' + err.message)
            }
        })
        context('when the delete was successful', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/${anotherChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/users/educators/${acc.NON_EXISTENT_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message for invalid educator id', () => {

                return request(URI)
                    .delete(`/users/educators/${acc.INVALID_ID}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and message for invalid children group id', () => {

                return request(URI)
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the children group is not founded', () => {
            it('should return status code 404 and info message for children group not found', () => {

                return request(URI)
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the user does not have permission', () => {

            context('admin delete children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('child delete children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('health professional delete children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('family delete children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
            context('application delete children group from educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) // user does not have permission
    })
})
