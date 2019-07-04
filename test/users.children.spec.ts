import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../src/account-service/model/institution'
import { AccountUtil } from './utils/account.utils'
import { AccountDb } from '../src/account-service/database/account.db'
import { Child } from '../src/account-service/model/child'
import { Strings } from './utils/string.error.message'

describe('Routes: users.children', () => {

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

    let defaultChildToken: string
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

    describe('POST /users/children', () => {
        context('when posting a new child user', () => {
            it('should return status code 201 and the saved child', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution).to.have.property('id')
                        if (res.body.institution.type)
                            expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        if (res.body.institution.name)
                            expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        if (res.body.institution.address)
                            expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        if (res.body.institution.latitude)
                            expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        if (res.body.institution.longitude)
                            expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)

                        defaultChild.id = res.body.id
                    })
            })
        })

        /* TESTES - RESTRIÇÕES NOS CAMPOS USERNAME/PASSWORD ... (CRIAR COM ESPAÇO ?)
        context('when the username is a blank space', () => {
            it('should return status code ? and message info about ...', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(409)
            })
        })*/

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when the child username was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_USERNAME_NOT_PROVIDED)
                    })
            })
        })

        context('when the child password was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_PASSWORD_NOT_PROVIDED)
                    })
            })
        })

        context('when the institution of the child was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_INSTITUTION_NOT_PROVIDED)
                    })
            })
        })

        context('when the child gender was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_GENDER_NOT_PROVIDED)
                    })
            })
        })

        context('when the child age was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_AGE_NOT_PROVIDED)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: acc.NON_EXISTENT_ID,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: acc.INVALID_ID,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the child gender provided was invalid', () => {
            it('should return status code 400 and message about invalid gender', () => {

                const body = {
                    username: 'child with gender equal numbers',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: acc.INVALID_GENDER,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                // .then(err => {
                //     // expect(err.body).to.eql(Strings.CHILD.?)
                // })
            })
        })

        context('when the child age provided was negative', () => {
            it('should return status code 400 and message about negative age', () => {

                const body = {
                    username: 'child with negative age',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: acc.NEGATIVE_AGE
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                // .then(err => {
                //     // expect(err.body).to.eql(Strings.CHILD.?)
                // })
            })
        })

        context('when the child posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the educator posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the health professional posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the family posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the application posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET /users/children/:child_id', () => {
        context('when get a unique child in database', () => {
            it('should return status code 200 and a child', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when get only the ID, username and institution of a unique child in database', () => {
            it('should return status code 200 and only the ID, username and institution of the child', () => {

                const fieldOne = 'username'
                const fieldTwo = 'institution'

                return request(URI)
                    .get(`/users/children/${defaultChild.id}?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.not.have.property('gender')
                        expect(res.body).to.not.have.property('age')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {

                return request(URI)
                    .get(`/users/children/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_404_CHILD_NOT_FOUND)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .get(`/users/children/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the child gets their personal data from database', () => {

            let childToken: string
            before(async () => {
                try {
                    if (defaultChild.username && defaultChild.password)
                        childToken = await acc.auth(defaultChild.username, defaultChild.password)
                } catch (err) {
                    console.log('Failure on Children test: ', err)
                }
            })
            it('should return status code 200 and the personal data of the child', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(childToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('gender')
                        expect(res.body).to.have.property('age')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a educator get a unique child in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a health professional get a unique child in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a family get a unique child in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a application get a unique child in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a child get the personal data of another child from the database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET All /users/children', () => {
        before(async () => {
            try {
                await con.deleteAllChildren()
                anotherChild.institution = defaultInstitution
                defaultChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)
                await acc.saveChild(accessTokenAdmin, defaultChild)
            } catch (err) {
                console.log('Failure on Children test: ', err)
            }
        })
        context('when get all children in database', () => {
            it('should return status code 200 and a list of children', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1].institution).to.have.property('id')
                        expect(res.body[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1]).to.have.property('gender')
                    })
            })
        })


        context('when get only ID and username of all children in database', () => {
            it('should return status code 200 and a list with only ID and username of children', () => {

                const field = 'username'

                return request(URI)
                    .get(`/users/children?fields=${field}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.not.have.property('institution')
                        expect(res.body[0]).to.not.have.property('gender')
                        expect(res.body[0]).to.not.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.not.have.property('institution')
                        expect(res.body[1]).to.not.have.property('gender')
                        expect(res.body[1]).to.not.have.property('age')
                    })
            })
        })

        context('when get only ID and username and institution of all children in database', () => {
            it('should return status code 200 and a list with only ID institution and username of children', () => {

                const fieldOne = 'username'
                const fieldTwo = 'institution'

                return request(URI)
                    .get(`/users/children?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.not.have.property('gender')
                        expect(res.body[0]).to.not.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.not.have.property('gender')
                        expect(res.body[1]).to.not.have.property('age')
                    })
            })
        })

        context('when get all children in ascending order by username from database', () => {
            it('should return status code 200 and a list of children', () => {

                const sort = 'username'

                return request(URI)
                    .get(`/users/children?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].institution).to.eql(anotherChild.institution)
                        expect(res.body[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[0].age).to.eql(anotherChild.age)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1].username).to.eql(defaultChild.username)
                        expect(res.body[1].institution).to.eql(defaultChild.institution)
                        expect(res.body[1].gender).to.eql(defaultChild.gender)
                        expect(res.body[1].age).to.eql(defaultChild.age)
                    })
            })
        })

        context('when get all children in descending order by age from database', () => {
            it('should return status code 200 and a list of children', () => {

                const sort = 'age'

                return request(URI)
                    .get(`/users/children?sort=-${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].institution).to.eql(defaultChild.institution)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1].username).to.eql(anotherChild.username)
                        expect(res.body[1].institution).to.eql(anotherChild.institution)
                        expect(res.body[1].gender).to.eql(anotherChild.gender)
                        expect(res.body[1].age).to.eql(anotherChild.age)
                    })
            })
        })

        context('when get only the two most recent children in database', () => {
            it('should return status code 200 and a list of children', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/users/children?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                    })
            })
        })

        context('when a child get all children in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a educator get all children in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a health professional get all children in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a family get all children in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a application get all children in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when get all children in database after deleting all of them', () => {
            before(async () => {
                try {
                    await con.deleteAllChildren()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('PATCH /users/children/:child_id', () => {
        before(async () => {
            try {
                defaultChild.institution = defaultInstitution
                const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
                defaultChild.id = resultChild.id

                const resultInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
                anotherInstitution.id = resultInstitution.id

                if (defaultChild.username && defaultChild.password)
                    defaultChildToken = await acc.
                        auth(defaultChild.username, defaultChild.password)

            } catch (err) {
                console.log('Failure on Children test: ', err)
            }
        })
        context('when the update was successful', () => {
            it('should return status code 200 and updated child', () => {
                defaultChild.username = 'Default username updated'
                defaultChild.age = 13
                defaultChild.institution = anotherInstitution
                defaultChild.gender = 'female'

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send(
                        {
                            username: 'Default username updated',
                            gender: 'female',
                            age: 13,
                            institution_id: anotherInstitution.id
                        }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
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
                    anotherChild.institution = defaultInstitution
                    const resultChild = await acc.saveChild(accessTokenAdmin, anotherChild)
                    anotherChild.id = resultChild.id
                } catch (err) {
                    console.log('Failure on Children test: ', err)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ username: 'another child' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('A registration with the same unique data already exists!')
                    })
            })
        })

        /* TESTES - RESTRIÇÕES NOS CAMPOS USERNAME ... (CRIAR COM ESPAÇO ?)
        context('when update the child username with spaces before and after the username', () => {
            it('should return status code ?', () => {

            })
        })*/

        context('when update the child gender for invalid gender', () => {
            it('should return status code 400 and message about invalid gender', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ gender: acc.INVALID_GENDER })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                // .then(err => {
                //     expect(...)
                // })
            })
        })

        context('when update the child age to negative value', () => {
            it('should return status code 400 and message about negative age', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: acc.NEGATIVE_AGE })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                // .then(err => {
                //     expect(...)
                // })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {

                return request(URI)
                    .patch(`/users/children/${acc.INVALID_ID}`)
                    .send({ age: 15 })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {

                return request(URI)
                    .patch(`/users/children/${acc.NON_EXISTENT_ID}`)
                    .send({ age: 10 })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_404_CHILD_NOT_FOUND)
                    })
            })
        })

        context('when the child update yourself', () => {
            let tokenDefaultChild: string
            before(async () => {
                try {
                    if (defaultChild.username && defaultChild.password)
                        tokenDefaultChild = await acc
                            .auth(defaultChild.username, defaultChild.password)
                } catch (err) {
                    console.log('Failure on Children test: ', err)
                }
            })
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(tokenDefaultChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a child update another child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the educator update a child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the health professional update a child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the family update a child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the application update a child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

        describe('PATCH /users/:child_id/password', () => {
            context('when the password update was successful', () => {
                it('should return status code 204 and no content', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })

            context('when the old password does not match', () => {
                it('should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })
            })

            context('when the old password does not provided', () => {
                it('should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('when the new password does not provided', () => {
                it('should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('when the child_id is invalid', () => {
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

            context('when the child is not found', () => {
                it('should return status code 404 and info message from child not found', () => {

                    return request(URI)
                        .patch(`/users/${acc.NON_EXISTENT_ID}/password`)
                        .send({ old_password: 'old_password', new_password: 'new_password' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(404)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_404_USER_NOT_FOUND)
                        })
                })
            })

            context('when the child update the admin password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${acc.ADMIN_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })            

            context('when the child update your password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(defaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the educator update the child password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the health professional update the child password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the family update the child password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when the application update the child password', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when a child updates the password of another child', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('when update the child password without authorization', () => {
                it('should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                        })
                })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('DELETE /users/:child_id', () => {
        context('when the child was successful deleted', () => {
            it('should return status code 204 and no content for admin user', () => {

                return request(URI)
                    .delete(`/users/${anotherChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child is not found', () => {
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

        context('when the child_id is invalid', () => {
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

        context('when the child delete yourself', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(defaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the educator delete the child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the health professional delete the child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the family delete the child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the application delete the child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a child delete another child', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })
})
