import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
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

    const anotherApplication: Application = new Application()
    anotherApplication.username = 'another application'
    anotherApplication.password = 'another pass'
    anotherApplication.application_name = 'APP2'

    before(async () => {
        try {
            await accountDB.connect()

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
            defaultApplication.institution = defaultInstitution

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            const resultAnotherApplication = await acc.saveApplication(accessTokenAdmin, anotherApplication)
            anotherApplication.id = resultAnotherApplication.id

        } catch (err) {
            console.log('Failure on Before from users.applications.get_all test: ', err)
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

    describe('GET All /users/applications', () => {

        context('when the admin get all applications successfully', () => {

            it('applications.get_all001: should return status code 200 and a list of applications', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id', anotherApplication.id)
                        expect(res.body[0]).to.have.property('username', anotherApplication.username)
                        expect(res.body[0]).to.have.property('application_name', anotherApplication.application_name)
                        expect(res.body[0]).to.not.have.property('institution')
                        expect(res.body[1]).to.have.property('id', defaultApplication.id)
                        expect(res.body[1]).to.have.property('username', defaultApplication.username)
                        expect(res.body[1]).to.have.property('application_name', defaultApplication.application_name)
                        expect(res.body[1]).to.have.property('institution')
                    })
            })

            it('applications.get_all002: should return status code 200 and a list of applications in descending order by username ', () => {
                
                const sortField = 'username'

                return request(URI)
                    .get(`/users/applications?sort=-${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id', defaultApplication.id)
                        expect(res.body[0]).to.have.property('username', defaultApplication.username)
                        expect(res.body[0]).to.have.property('application_name', defaultApplication.application_name)
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('id', anotherApplication.id)
                        expect(res.body[1]).to.have.property('username', anotherApplication.username)
                        expect(res.body[1]).to.have.property('application_name', anotherApplication.application_name)
                        expect(res.body[1]).to.not.have.property('institution')
                    })
            }) 
            
            it('applications.get_all003: should return status code 200 and a list of applications in descending order by username ', () => {
                
                const sortField = 'application_name'

                return request(URI)
                    .get(`/users/applications?sort=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id', defaultApplication.id)
                        expect(res.body[0]).to.have.property('username', defaultApplication.username)
                        expect(res.body[0]).to.have.property('application_name', defaultApplication.application_name)
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('id', anotherApplication.id)
                        expect(res.body[1]).to.have.property('username', anotherApplication.username)
                        expect(res.body[1]).to.have.property('application_name', anotherApplication.application_name)
                        expect(res.body[1]).to.not.have.property('institution')
                    })
            }) 
            
            it('applications.get_all004: should return status code 200 and only the most recently registered application', () => {
                
                const page = 1
                const limit = 1

                return request(URI)
                    .get(`/users/applications?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id', anotherApplication.id)
                        expect(res.body[0]).to.have.property('username', anotherApplication.username)
                        expect(res.body[0]).to.have.property('application_name', anotherApplication.application_name)
                        expect(res.body[0]).to.not.have.property('institution')
                    })
            })             

        }) // get all applications in database successfull

        describe('when the user does not have permission to get all applications', () => {

            it('applications.get_all005: should return status code 403 and info message from insufficient permissions for user child', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all006: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all007: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all08: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all09: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('applications.get_all010: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get all applications in database after deleting all of them', () => {
            before(async () => {
                try {
                    await accountDB.deleteAllApplications()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('applications.get_all011: should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/users/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
})
