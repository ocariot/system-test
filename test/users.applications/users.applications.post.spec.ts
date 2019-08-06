import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Application } from '../../src/account-service/model/application';

describe('Routes: users.applications', () => {

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

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'Default application'
    defaultApplication.password = 'Default pass'
    defaultApplication.application_name = 'APP1'

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

            defaultApplication.institution = defaultInstitution

        } catch (err) {
            console.log('Failure on Before from users.applications.post test: ', err)
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

    describe('POST /users/applications', () => {

        afterEach(async () => {
            try {
                await con.deleteAllApplications()
            } catch (err) {
                console.log('Failure in users.applications.post test: ', err)
            }
        })

        context('when the admin posting a new application user successfully', () => {
            
            it('applications.post001: should return status code 201 and the saved application', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username', defaultApplication.username)
                        expect(res.body).to.have.property('application_name', defaultApplication.application_name)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            describe('when the application does not associated with a institution', () => {
                
                it('applications.post002: should return status code 201 and the saved application created with only required parameters', () => {

                    const application: Application = new Application()
                    application.username = 'another username'
                    application.password = 'app_secret'
                    application.application_name = 'another cool name'

                    return request(URI)
                        .post('/users/applications')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(application.toJSON())
                        .expect(201)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body).to.have.property('username', application.username)
                            expect(res.body).to.have.property('application_name', application.application_name)
                            expect(res.body).to.not.have.property('institution')
                        })
                })
            })
            
        }) // post successfull

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveApplication(accessTokenAdmin, defaultApplication)
                } catch (err) {
                    console.log('Failure in users.applications.post test: ', err)
                }
            })
            it('applications.post003: should return status code 409 and message info about application is already registered', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.APPLICATION.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('applications.post004: should return status code 400 and message info about missing parameters, because username was not provided', () => {

                const body = {
                    password: defaultApplication.password,
                    application_name: defaultApplication.application_name,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.APPLICATION.ERROR_400_USERNAME_NOT_PROVIDED)
                    })
            })

            it('applications.post005: should return status code 400 and message info about missing parameters, because password was not provided', () => {

                const body = {
                    username: defaultApplication.username,
                    application_name: defaultApplication.application_name,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.APPLICATION.ERROR_400_PASSWORD_NOT_PROVIDED)
                    })
            })   
            
            it('applications.post006: should return status code 400 and message info about missing parameters, because application_name was not provided', () => {

                const body = {
                    username: defaultApplication.username,
                    password: defaultApplication.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.APPLICATION.ERROR_400_APPLICATION_NAME_NOT_PROVIDED)
                    })
            })  
            
            it('applications.post007: should return status code 400 and message info about invalid parameters, because institution provided does not exist', () => {

                const body = {
                    username: defaultApplication.username,
                    password: defaultApplication.password,
                    application_name: defaultApplication.application_name,
                    institution_id: acc.NON_EXISTENT_ID
                }

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })  
            
            it('applications.post008: should return status code 400 and message info about invalid parameters, because institution_id is invalid', () => {

                const body = {
                    username: defaultApplication.username,
                    password: defaultApplication.password,
                    application_name: defaultApplication.application_name,
                    institution_id: acc.INVALID_ID
                }

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })             

        }) // validation error occurs

        context('when the user does not have permission to register the application', () => {

            it('applications.post009: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.post010: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.post011: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.post012: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.post013: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('applications.post014: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/users/applications')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultApplication.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
