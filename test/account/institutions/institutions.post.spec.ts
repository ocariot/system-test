import request from 'supertest'
import { expect } from 'chai'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Institution } from '../../../src/account-service/model/institution'
import { accountDB } from '../../../src/account-service/database/account.db'
import { acc } from '../../utils/account.utils'

describe('Routes: Institution', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'Default type'
    defaultInstitution.name = 'Default name'
    defaultInstitution.address = 'Default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = "another type"
    anotherInstitution.name = "another name"

    const institutionWillBeUpdated: Institution = new Institution
    institutionWillBeUpdated.type = 'not upated type'
    institutionWillBeUpdated.name = 'not updated name'

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

        } catch (err) {
            console.log('Failure on Before from institutions.post test: ', err)
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

    describe('POST /institutions', () => {
        afterEach(async () => {
            try {
                await accountDB.deleteInstitutions()
            } catch (err) {
                console.log('DB ERROR', err)
            }
        })

        context('when posting a new institution successfull', async () => {

            it('institutions.post001: should return status code 201 and the saved institution', async () => {
                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            it('institutions.post002: should return status code 201 and save the institution provided with only obligatory parameters', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(anotherInstitution)
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.type).to.eql(anotherInstitution.type)
                        expect(res.body.name).to.eql(anotherInstitution.name)
                    })
            })

        }) // saved successfull

        context('when a duplicate error occurs', () => {

            before(async () => {
                try {
                    // The failure occurrs when trying to save a duplicate of an institution that has already been deleted,
                    // it is important to popular the ID in the request
                    const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
                    defaultInstitution.id = result.id
                    await accountDB.deleteInstitutions()
                    await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
                } catch (err) {
                    console.log('Failure in Institution.post test', err)
                }
            })

            it('institutions.post003: should return status code 409 and info message ', () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('institutions.post004: should return status code 400 and info message from missing parameters, because name was not informed', async () => {

                const body = {
                    type: 'Any Type',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_NAME)
                    })
            })

            it('institutions.post005: should return status code 400 and info message from missing parameters, because type was not informed', async () => {

                const body = {
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_TYPE)
                    })
            })

            it('institutions.post006: should return status code 400 and info message, because name is a number', () => {

                const body = {
                    name: 145,
                    type: 'Cool Type',
                    address: '230B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INVALID_NAME)
                    })

            })

            it('institutions.post007: should return status code 400 and info message, because type is a number', () => {

                const body = {
                    name: 'Cool Name',
                    type: 123,
                    address: '230B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INVALID_TYPE)
                    })

            })

            it('institutions.post008: should return status code 400 and info message, because address is a number', () => {

                const body = {
                    name: 'Cool Name',
                    type: 'Coll Type',
                    address: 123,
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INVALID_ADDRESS)
                    })

            })

            it('institutions.post009: should return status code 400 and info message from invalid parameters, because institution latitude is a text', () => {

                const body = {
                    type: defaultInstitution.type,
                    name: 'Latitude like a text',
                    latitude: 'TEXT'
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_FAILED_CAST_LATITUDE)
                    })
            })

            it('institutions.post010: should return status code 400 and info message from invalid parameters, because institution longitude is a text', () => {

                const body = {
                    type: defaultInstitution.type,
                    name: 'Longitude like a text',
                    longitude: 'TEXT'
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_FAILED_CAST_LONGITUDE)
                    })
            })

            it('institutions.post011: should return status code 400 and info message from invalid parameters, because null type', () => {
                const NULL_TYPE = null // invalid type of the institution

                const body = {
                    type: NULL_TYPE,
                    name: 'Longitude like a text',
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INVALID_TYPE)
                    })
            })

            it('institutions.post012: should return status code 400 and info message from invalid parameters, because null longitude', () => {
                const NULL_LONGITUDE = null // invalid longitude of the institution

                const body = {
                    type: defaultInstitution.type,
                    name: defaultInstitution.name,
                    latitude: 0,
                    longitude: NULL_LONGITUDE
                }

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_FAILED_CAST_LONGITUDE)
                    })
            })

        }) // validation error occurs

        context('when the user does not have permission to register the institution', () => {

            it('institutions.post013: should return status code 403 and info message from insufficient permissions to the child', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.post014: should return status code 403 and info message from insufficient permissions to the educator', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.post015: should return status code 403 and info message from insufficient permissions to the health professional', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.post016: should return status code 403 and info message from insufficient permissions to the family', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.post017: should return status code 403 and info message from insufficient permissions to the application', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('institutions.post018: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
