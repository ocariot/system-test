import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../src/account-service/model/institution'
import { AccountUtil } from './utils/account.utils'
import { AccountDb } from '../src/account-service/database/account.db'
import { Educator } from '../src/account-service/model/educator'
import { Strings } from './utils/string.error.message'
import { Child } from '../src/account-service/model/child'
import { ChildrenGroup } from '../src/account-service/model/children.group'

describe('Routes: users.educators', () => {

    const URI: string = 'https://localhost'
    const acc = new AccountUtil()

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

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'
    anotherInstitution.address = 'another address'
    anotherInstitution.latitude = -7.2100766
    anotherInstitution.longitude = -35.9175756

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    const anotherEducator: Educator = new Educator()
    anotherEducator.username = 'another educator'
    anotherEducator.password = 'another pass'

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
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

    const con = new AccountDb()

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

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

            defaultChild.institution = defaultInstitution
            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

        } catch (e) {
            console.log('Before Error', e)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })
    //
    describe('POST /users/educators', () => {
        context('when posting a new educator user', () => {
            it('should return status code 201 and the saved educator', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        defaultEducator.id = res.body.id
                    })

            })
        })

        //  TESTES - RESTRIÇÕES NOS CAMPOS USERNAME/PASSWORD ... (CRIAR COM ESPAÇO ?)
        // context('when the username is a blank space', () => {
        //     it('should return status code ? and message info about ...', () => {

        //         return request(URI)
        //             .post('/users/educators')
        //             .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        //             .set('Content-Type', 'application/json')
        //             .send(body)
        //             .expect(409)
        //     })
        // })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {
            context('educator username was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_USERNAME_NOT_PROVIDED)
                        })
                })
            })

            context('educator password was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        username: defaultEducator.username,
                        institution_id: defaultInstitution.id,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('institution of the educator was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_INSTITUTION_NOT_PROVIDED)
                        })
                })
            })

            context('institution provided does not exists', () => {
                it('should return status code 400 and message from institution not found', () => {

                    const body = {
                        username: 'another username',
                        password: defaultEducator.password,
                        institution_id: acc.NON_EXISTENT_ID
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                        })
                })
            })

            context('institution id provided was invalid', () => {
                it('should return status code 400 and message for invalid institution id', () => {
                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: acc.INVALID_ID
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) // validantion error occurs

        context('when the user does not have permission', () => {
            context('child posting a new educator user', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator posting a new educator user', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('health professional posting a new educator user', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family posting a new educator user', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application posting a new educator user', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // user does not have permission
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET /users/educators/:educator_id', () => {
        context('when get a unique educator in database', () => {
            it('should return status code 200 and a educator', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when get only the ID, username and institution of a unique educator in database', () => {
            it('should return status code 200 and only the ID, username and institution of the educator', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children_groups')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .get(`/users/educators/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .get(`/users/educators/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission', () => {

            context('child get a unique educator in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('health professional get a unique educator in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family get a unique educator in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application get a unique educator in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator get the personal data of another educator from the database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/users/educators/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) // user does not have permission

        context('when the educator gets their personal data from database', () => {
            let educatorToken: string
            before(async () => {
                try {
                    if (defaultEducator.username && defaultEducator.password)
                        educatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
                } catch (err) {
                    console.log('Failure on Educators test: ' + err.message)
                }
            })
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(educatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children_groups')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the admin get a unique educator in database', () => {
            before(async () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }
                try {
                    const result = await acc
                        .saveChildrenGroupsForEducator(accessTokenEducator, defaultEducator, body)
                    defaultChildrenGroup.id = result.id
                    defaultChildrenGroup.children = result.children

                } catch (err) {
                    console.log('Before error', err)
                }
            })
            it('should return status code 200 and a educator, without the children group data', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.not.have.property('children_groups')
                        expect(res.body).to.have.property('institution')
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)

                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET All /users/educators', () => {

        before(async () => {
            try {
                anotherEducator.institution = defaultInstitution
                await acc.saveEducator(accessTokenAdmin, anotherEducator)

            } catch (err) {
                console.log('Failure on Educators test: ' + err.message)
            }
        })
        context('when get all educators in database', () => {
            it('should return status code 200 and a list of educators without children group data', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.not.have.property('children_groups')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[1].institution).to.not.have.property('id')
                        expect(res.body[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when get all educators in ascending order by username from database', () => {
            it('should return status code 200 and a list of children', () => {

                const sort = 'username'

                return request(URI)
                    .get(`/users/educators?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[0].username).to.eql(anotherEducator.username)
                        expect(res.body[0].institution).to.eql(anotherEducator.institution)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].username).to.eql(anotherEducator.username)
                        expect(res.body[1].institution).to.eql(anotherEducator.institution)
                    })
            })
        })

        context('when the user does not have permission', () => {

            context('child get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('health professional get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) //user does not have permission


        context('when get all educators in database after deleting all of them', () => {
            before(async () => {
                try {
                    await con.deleteAllEducators()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('should return status code 200 and empty array ', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('PATCH /users/educators/:educator_id', () => {
        before(async () => {
            defaultEducator.institution = defaultInstitution
            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultInstitution.id
        })
        context('when the update was successful', () => {
            it('should return status code 200 and updated educator', () => {

                defaultEducator.username = 'newcoolusername'
                defaultEducator.institution = anotherInstitution

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ username: 'newcoolusername', institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(anotherInstitution.type)
                        expect(res.body.institution.name).to.eql(anotherInstitution.name)
                        expect(res.body.institution.address).to.eql(anotherInstitution.address)
                        expect(res.body.institution.latitude).to.eql(anotherInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(anotherInstitution.longitude)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherEducator.institution = defaultInstitution
                    const result = await acc.saveEducator(accessTokenAdmin, anotherEducator)
                    anotherEducator.id = result.id
                } catch (err) {
                    console.log('Failure on Educators test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {

                return request(URI)
                    .patch(`/users/educators/${anotherEducator.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_409_UNIQUE_DATA_ALREADY_EXISTS)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .patch(`/users/educators/${acc.NON_EXISTENT_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it(' should return status code 400 and message for invalid institution id', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ institution_id: acc.INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the users does not have permission', () => {

            context('child update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator update educator', () => {
                let tokenDefaultEducator: string
                before(async () => {
                    try {
                        if (defaultEducator.username && defaultEducator.password) {
                            tokenDefaultEducator = await acc
                                .auth(defaultEducator.username, defaultEducator.password)
                        }
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                context('educator update yourself', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/educators/${defaultEducator.id}`)
                            .send({ username: 'anothercoolusername' })
                            .set('Authorization', 'Bearer '.concat(tokenDefaultEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
                context('educator update another educator', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/educators/${anotherEducator.id}`)
                            .send({ username: 'anothercoolusername' })
                            .set('Authorization', 'Bearer '.concat(tokenDefaultEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
            })

            context('health professional update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })
    })

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('PATCH /users/:educator_id/password', () => {
        context('when the password update was successful', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when there are validation errors', () => {

            context('the old password does not match', () => {
                it('should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })
            })

            context('the old password does not provided', () => {
                it('should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('the new password does not provided', () => {
                it('should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('the educator_id is invalid', () => {
                it('should return status code 400 and info message from invalid id', () => {

                    return request(URI)
                        .patch(`/users/${acc.INVALID_ID}/password`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) // validation error occurs

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from child not found', () => {

                return request(URI)
                    .patch(`/users/${acc.NON_EXISTENT_ID}/password`)
                    .send({ old_password: 'old_password', new_password: 'new_password' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.USER.ERROR_404_USER_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission', () => {

            context('child update the educator password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator update the admin password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${acc.ADMIN_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the educator update password', () => {
                let defaultEducatorToken: string
                before(async () => {
                    try {
                        if (defaultEducator.username && defaultEducator.password) {
                            defaultEducatorToken = await acc.
                                auth(defaultEducator.username, defaultEducator.password)
                        }
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                context('educator update your password', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
                context('educator update password of another educator', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${anotherEducator.id}/password`)
                            .send({ old_password: anotherEducator.password, new_password: 'another pass' })
                            .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
            })

            context('health professional update the educator password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family update the educator password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application update the educator password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) // user does not have permission

        context('when update the educator password without authorization', () => {
            it('should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .patch(`/users/${defaultEducator.id}/password`)
                    .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            })
        })
    })

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('DELETE /users/:educator_id', () => {
        context('when the educator was successful deleted', () => {
            it('should return status code 204 and no content for admin user', () => {

                return request(URI)
                    .delete(`/users/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 204 and no content, even user does not exists', () => {

                return request(URI)
                    .delete(`/users/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .delete(`/users/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission', () => {

            context('child delete the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${anotherEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator delete educator', () => {
                let anotherEducatorToken: string
                before(async () => {
                    try {
                        if (anotherEducator.username && anotherEducator.password) {
                            anotherEducatorToken = await acc.
                                auth(anotherEducator.username, anotherEducator.password)
                        }
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                context('educator delete yourself', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {
                        return request(URI)
                            .delete(`/users/${anotherEducator.id}`)
                            .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
                context('educator delete another educator', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .delete(`/users/${anotherEducator.id}`)
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
            })

            context('health professional delete the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${anotherEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family delete the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${anotherEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application delete the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${anotherEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) //user does not have permission
    })

    describe('Routes: users.educators.children_groups', () => {
        let defaultEducatorToken: string
        before(async () => {
            try {
                await con.deleteChildrenGroups()

                defaultEducator.institution = defaultInstitution
                const result = await acc.saveEducator(accessTokenAdmin, defaultEducator)
                defaultEducator.id = result.id

                if (defaultEducator.username && defaultEducator.password) {
                    defaultEducatorToken = await acc.
                        auth(defaultEducator.username, defaultEducator.password)
                }

            } catch (err) {
                console.log('Failure on Educators test: ' + err.message)
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
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_409_UNIQUE_DATA_ALREADY_EXISTS)
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
                                expect(err.body).to.eql(Strings.CHILDREN_GROUPS.ERROR_400_INVALID_FORMAT_ID)
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
})
