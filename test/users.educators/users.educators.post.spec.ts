import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { Educator } from '../../src/account-service/model/educator'
import { Strings } from '../utils/string.error.message'

describe('Routes: users.educators', () => {

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

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    before(async () => {
        try {
            await accountDB.connect(0, 1000)

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await accountDB.removeCollections()

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

            defaultEducator.institution = defaultInstitution

        } catch (e) {
            console.log('Failure on Before from users.educators.post test: ', e)
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

    describe('POST /users/educators', () => {
        afterEach(async () => {
            try {
                await accountDB.deleteAllEducators()
            } catch (err) {
                console.log('Failure in users.educator.post test: ', err)
            }
        })
        context('when the admin posting a new educator user', () => {
            it('educators.post001: should return status code 201 and the saved educator', () => {

                return request(URI)
                    .post('/users/educators')
                    .send(defaultEducator.toJSON())
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

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveEducator(accessTokenAdmin, defaultEducator)
                } catch (err) {
                    console.log('Failure in users.educator.post test: ', err)
                }
            })
            it('educators.post002: should return status code 409 and message info about educator is already registered', () => {

                return request(URI)
                    .post('/users/educators')
                    .send(defaultEducator.toJSON())
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('educators.post003: should return status code 400 and message info about missing parameters, because username was not provided', () => {

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

            it('educators.post004: should return status code 400 and message info about missing parameters, because password was not provided', () => {

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

            it('educators.post005: should return status code 400 and message info about missing parameters, because institution was not provided', () => {

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

            it('educators.post006: should return status code 400 and message from institution not found', () => {

                const body = {
                    username: defaultEducator.username,
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

            it('educators.post007: should return status code 400 and message for invalid institution id', () => {
                const body = {
                    username: defaultEducator.username,
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

        }) // validantion error occurs

        context('when the user does not have permission to register the educator', () => {

            it('educators.post008: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.post009: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.post010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.post011: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.post012: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('educators.post013: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultEducator.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
