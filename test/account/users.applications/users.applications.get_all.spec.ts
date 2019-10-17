import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Application } from '../../../src/account-service/model/application';

describe('Routes: applications', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let applicationArr: Array<Application> = new Array<Application>()

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
            anotherApplication.institution = defaultInstitution

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            const resultAnotherApplication = await acc.saveApplication(accessTokenAdmin, anotherApplication)
            anotherApplication.id = resultAnotherApplication.id

            applicationArr.push(anotherApplication)
            applicationArr.push(defaultApplication)

        } catch (err) {
            console.log('Failure on Before from applications.get_all test: ', err)
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

    describe('GET All /applications', () => {

        context('when the admin get all applications successfully', () => {

            it('applications.get_all001: should return status code 200 and a list of applications', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(applicationArr[i].id)
                            expect(res.body[i].username).to.eql(applicationArr[i].username)
                            expect(res.body[i].application_name).to.eql(applicationArr[i].application_name)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                        }
                    })
            })

            it('applications.get_all002: should return status code 200 and a list of applications and information when the application has already first logged in to the system for admin user', async () => {
                await acc.auth(defaultApplication.username!, defaultApplication.password!)
                await acc.auth(anotherApplication.username!, anotherApplication.password!)

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(applicationArr[i].username)
                            expect(res.body[i].id).to.eql(applicationArr[i].id)
                            expect(res.body[i].application_name).to.eql(applicationArr[i].application_name)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (defaultApplication.last_login) {
                                expect(res.body.last_login).to.eql(applicationArr[i].last_login)
                            }
                        }
                    })
            })

            it('applications.get_all003: should return status code 200 and a list of applications in descending order by username ', () => {
                const sort = 'username' // parameter for sort the result of the query by order descending
                const appSortedByUserNameArr = applicationArr.slice() // copy of the array of application that will be ordered

                // Sorted applicationArr in descending order by username ...
                appSortedByUserNameArr.sort((a, b) => {
                    return a.username!.toLowerCase()! > b.username!.toLowerCase() ? -1 : 1
                })

                return request(URI)
                    .get(`/applications?sort=-${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(appSortedByUserNameArr[i].username)
                            expect(res.body[i].id).to.eql(appSortedByUserNameArr[i].id)
                            expect(res.body[i].application_name).to.eql(appSortedByUserNameArr[i].application_name)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (defaultApplication.last_login) {
                                expect(res.body.last_login).to.eql(appSortedByUserNameArr[i].last_login)
                            }
                        }
                    })
            })

            it('applications.get_all004: should return status code 200 and a list of applications in ascending order by application name ', () => {
                const sort = 'application_name' // parameter for sort the result of the query by order ascending
                const appSortedByAppNameArr = applicationArr.slice() // copy of the array of application that will be ordered

                // Sorted applicationArr in ascending order by username ...
                appSortedByAppNameArr.sort((a, b) => {
                    return a.application_name!.toLowerCase()! < b.application_name!.toLowerCase() ? -1 : 1
                })

                return request(URI)
                    .get(`/applications?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(appSortedByAppNameArr[i].username)
                            expect(res.body[i].id).to.eql(appSortedByAppNameArr[i].id)
                            expect(res.body[i].application_name).to.eql(appSortedByAppNameArr[i].application_name)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (defaultApplication.last_login) {
                                expect(res.body.last_login).to.eql(appSortedByAppNameArr[i].last_login)
                            }
                        }
                    })
            })

            it('applications.get_all005: should return status code 200 and only the most recently registered application', () => {

                const page = 1
                const limit = 1

                return request(URI)
                    .get(`/applications?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(applicationArr[i].username)
                            expect(res.body[i].id).to.eql(applicationArr[i].id)
                            expect(res.body[i].application_name).to.eql(applicationArr[i].application_name)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (defaultApplication.last_login) {
                                expect(res.body.last_login).to.eql(applicationArr[i].last_login)
                            }
                        }
                    })
            })

        }) // get all applications in database successfull

        describe('when the user does not have permission to get all applications', () => {

            it('applications.get_all006: should return status code 403 and info message from insufficient permissions for user child', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all007: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all008: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all09: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('applications.get_all010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('applications.get_all011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/applications')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
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
            it('applications.get_all012: should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/applications')
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
