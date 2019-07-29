import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Child } from '../../src/account-service/model/child'
import { Strings } from '../utils/string.error.message'

describe('Routes: users.children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

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

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

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

        } catch (err) {
            console.log('Failure on Before from users.children.post test: ', err)
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

    describe('POST /users/children', () => {

        afterEach(async () => {
            try {
                await con.deleteAllChildren()
            } catch (err) {
                console.log('Failure in children.post test: ', err)
            }
        })

        describe('when the admin posting a new child user successfully', () => {
            it('children.post001: should return status code 201 and the saved child', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
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

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveChild(accessTokenAdmin, defaultChild)
                } catch (err) {
                    console.log('Failure in users.children.post test: ', err)
                }
            })
            it('children.post002: should return status code 409 and message info about child is already registered', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('children.post003: should return status code 400 and message info about missing parameters, because username was not provided', () => {

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

            it('children.post004: should return status code 400 and message info about missing parameters, because password was not provided', () => {

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

            it('children.post005: should return status code 400 and message info about missing parameters, because institution was not provided', () => {

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

            it('children.post006: should return status code 400 and message info about missing parameters, because child gender was not provided', () => {

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

            it('children.post007: should return status code 400 and message info about missing parameters, because child age was not provided', () => {

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

            it('children.post008: should return status code 400 and message for institution not found', () => {

                const body = {
                    username: defaultChild.username,
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

            it('children.post009: should return status code 400 and message for invalid institution id', () => {

                const body = {
                    username: defaultChild.username,
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

            it('children.post010: should return status code 400 and message about invalid gender', () => {

                const body = {
                    username: 'child_with_gender_equal_numbers',
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

            it('children.post011: should return status code 400 and message about negative age', () => {

                const body = {
                    username: 'child_with_negative_age',
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

        }) // validation error occurs

        context('when the user does not have permission to register the child', () => {

            it('children.post012: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.post013: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.post014: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.post015: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.post016: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.post017: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultChild.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
