import request from 'supertest'
import { expect } from 'chai'
import { Strings } from './utils/string.error.message'
import { Institution } from '../src/account-service/model/institution'
import { AccountDb } from '../src/account-service/database/account.db'
import { AccountUtil } from './utils/account.utils'
import { Child } from '../src/account-service/model/child'

describe('Routes: Institution', () => {

    const URI: string = 'https://localhost'
    const acc = new AccountUtil()

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
    institutionWillBeUpdated.type = 'not upated type',
        institutionWillBeUpdated.name = 'not updated name'

    const defaultChild: Child = new Child()
    defaultChild.username = 'default username'
    defaultChild.password = 'default password'
    defaultChild.institution = new Institution()
    defaultChild.gender = 'male'
    defaultChild.age = 10

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

        } catch (e) {
            console.log('Before Error', e.message)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /institutions', () => {
        context('when posting a new institution', async () => {
            it('should return status code 201 and the saved institution', async () => {
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
                        defaultInstitution.id = res.body.id
                    })
            })
        })

        context('when posting a new institution, only with the required parameters', async () => {
            it('should return status code 201 and the saved institution', async () => {

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
                        anotherInstitution.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and info message about duplicate items', () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs, because type was not informed', () => {
            it('should return status code 400 and info message from invalid or missing parameters', async () => {

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
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_TYPE)
                    })
            })
        })

        context('when a validation error occurs, because name was not informed', () => {
            it('should return status code 400 and info message from invalid or missing parameters', async () => {

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
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_NAME)
                    })
            })
        })

        /* TESTES - RESTRIÇÕES NOS CAMPOS TYPE/NAME ... (CRIAR COM ESPAÇO ?)
        context('when the institution type is equal to blank space', () => {
            it('should return the status ... ?', () => {

                const body = {
                    type: ' ',
                    name : 'Institution with blank type',
                    address: defaultInstitution.address,
                    latitude: 0,
                    longitude: 0
                }

                return request(URI)
                    .post('/institutions')
                    .post('/institutions')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_NAME)
                    })                    
            })
        })
        */

        context('when a validation error occurs, because the institution latitude is a text', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {

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
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_FAILED_CAST_LATITUDE)
                    })
            })
        })

        context('when not informed the acess token', () => {
            it('should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        context('when the child create a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the educator create a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the health professional create a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the family create a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the application create a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', async () => {

                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET /institutions/:institution_id', () => {
        context('when get only the ID, name and address of a unique institution in database', () => {
            it('should return status code 200 and only the ID, name and address of the institution', () => {

                const fieldOne = 'name'
                const fieldTwo = 'address'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body).to.have.property('address')
                        expect(res.body).to.not.have.property('type')
                        expect(res.body).to.not.have.property('latitude')
                        expect(res.body).to.not.have.property('longitude')
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                    })
            })
        })

        context('when get only the ID, type, latitude and longitude of a unique institution in database', () => {
            it('should return status code 200 and only the ID, type, latitude and longitude of the institution', () => {

                const fieldOne = 'type'
                const fieldTwo = 'latitude'
                const fieldTree = 'longitude'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}?fields=${fieldOne}%2C${fieldTwo}%2C${fieldTree}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('type')
                        expect(res.body).to.have.property('latitude')
                        expect(res.body).to.have.property('longitude')
                        expect(res.body).to.not.have.property('name')
                        expect(res.body).to.not.have.property('address')
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {

                return request(URI)
                    .get(`/institutions/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_404_INSTITUTION_NOT_FOUND)
                    })
            })
        })

        context('when get a unique institution informing an invalid ID', () => {
            it('should return status code 400 and info message from invalid ID format', () => {

                return request(URI)
                    .get(`/institutions/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when a child get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a educator get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {

                return request(URI)
                    .get(`/institutions/${anotherInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(anotherInstitution.id)
                        expect(res.body.type).to.eql(anotherInstitution.type)
                        expect(res.body.name).to.eql(anotherInstitution.name)
                    })
            })
        })

        context('when a health professional get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a family  get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })
    })

    describe('GET ALL /institutions/:institution_id', () => {
        context('when want get all institutions in database', () => {
            it('should return status code 200 and a list of institutions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                    })
            })
        })

        context('when want get all institutions in database in ascending order by name', () => {
            it('should return status code 200 and a list of institutions', () => {

                const sortField = 'name'

                return request(URI)
                    .get(`/institutions?sort=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0].name).to.eql(anotherInstitution.name)
                        expect(res.body[1].name).to.eql(defaultInstitution.name)
                    })
            })
        })

        context('when want get all institutions in database in descending order by type', () => {
            it('should return status code 200 and a list of institutions', () => {

                const sortField = 'type'

                return request(URI)
                    .get(`/institutions?sort=-${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0].name).to.eql(defaultInstitution.name)
                        expect(res.body[1].name).to.eql(anotherInstitution.name)
                    })
            })
        })

        context('when want get only the name and ID of all institutions in database', () => {
            it('should return status code 200 and a list of institutions', () => {

                const sortField = 'name'

                return request(URI)
                    .get(`/institutions?fields=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0]).to.not.have.property('type')
                        expect(res.body[0]).to.not.have.property('address')
                        expect(res.body[0]).to.not.have.property('latitude')
                        expect(res.body[0]).to.not.have.property('longitude')
                    })
            })
        })

        context('when want get only the name, ID and type of all institutions in database', () => {
            it('should return status code 200 and a list of institutions', () => {

                const sortFieldOne = 'name'
                const sortFieldTwo = 'type'

                return request(URI)
                    .get(`/institutions?fields=${sortFieldOne}%2C${sortFieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0]).to.have.property('type')
                        expect(res.body[0]).to.not.have.property('address')
                        expect(res.body[0]).to.not.have.property('latitude')
                        expect(res.body[0]).to.not.have.property('longitude')
                    })
            })
        })

        context('when want get only the two most recent institutions in database', () => {
            it('should return status code 200 and a list of institutions', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/institutions?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                    })
            })
        })

        context('when a child  get a all institution in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a educator  get a all institution in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                    })
            })
        })

        context('when a health professional get a all institution in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                    })
            })
        })

        context('when a family get a all institution in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a application get a all institution in database', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).to.eql(2)
                    })
            })
        })

        context('when want get all institutions in database after deleting all of them', () => {
            before(async () => {
                try {
                    await con.deleteInstitutions()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/institutions')
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

    describe('PATCH /institutions/:institution_id', () => {
        before(async () => {
            try {
                const result = await acc.saveInstitution(accessTokenAdmin, institutionWillBeUpdated)
                institutionWillBeUpdated.id = result.id
            } catch (err) {
                console.log('Failure on Institution test: ', err)
            }
        })

        context('when the update was successful', () => {
            it('should return status code 200 and a updated institution', () => {

                institutionWillBeUpdated.type = 'type updated'
                institutionWillBeUpdated.name = 'name updated'

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ type: 'type updated', name: 'name updated' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(institutionWillBeUpdated.id)
                        expect(res.body.type).to.eql(institutionWillBeUpdated.type)
                        expect(res.body.name).to.eql(institutionWillBeUpdated.name)
                    })
            })
        })

        context('When updating address, latitude and longitude into institution successfully', () => {
            it('should return status code 200 and a updated institution', () => {

                institutionWillBeUpdated.address = 'another address'
                institutionWillBeUpdated.latitude = 0
                institutionWillBeUpdated.longitude = 0

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ address: 'another address', latitude: 0, longitude: 0 })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(institutionWillBeUpdated.id)
                        expect(res.body.type).to.eql(institutionWillBeUpdated.type)
                        expect(res.body.name).to.eql(institutionWillBeUpdated.name)
                        expect(res.body.address).to.eql(institutionWillBeUpdated.address)
                        expect(res.body.latitude).to.eql(institutionWillBeUpdated.latitude)
                        expect(res.body.longitude).to.eql(institutionWillBeUpdated.longitude)

                    })
            })
        })

        context('when a duplication error occurs', () => {
            before(async () => {
                const body: Institution = new Institution()
                body.type = 'Any type',
                    body.name = 'Other name',
                    body.address = 'Any address',
                    body.latitude = 0,
                    body.longitude = 0

                try {
                    await acc.saveInstitution(accessTokenAdmin, body)
                } catch (err) {
                    console.log('Failure on Institution test: ', err)
                }
            })

            it('should return status code 409 and info message from duplicate items', () => {

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ name: 'Other name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('A registration with the same unique data already exists!')
                    })
            })
        })

        context('when the institution_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {

                return request(URI)
                    .patch(`/institutions/${acc.INVALID_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {

                return request(URI)
                    .patch(`/institutions/${acc.NON_EXISTENT_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_404_INSTITUTION_NOT_FOUND)
                    })
            })
        })

        context('when a child update the institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ address: 'another cool address' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a educator update the institution', () => {
            it('should return status code 200 and updated the institution', () => {

                institutionWillBeUpdated.name = 'another cool name'

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ name: 'another cool name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(institutionWillBeUpdated.id)
                        expect(res.body.type).to.eql(institutionWillBeUpdated.type)
                        expect(res.body.name).to.eql(institutionWillBeUpdated.name)
                        expect(res.body.address).to.eql(institutionWillBeUpdated.address)
                        expect(res.body.latitude).to.eql(institutionWillBeUpdated.latitude)
                        expect(res.body.longitude).to.eql(institutionWillBeUpdated.longitude)
                    })
            })
        })

        context('when a health professional update the institution', () => {
            it('should return status code 200 and updated the institution', () => {

                institutionWillBeUpdated.type = 'another cool type'

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ type: 'another cool type' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(institutionWillBeUpdated.id)
                        expect(res.body.type).to.eql(institutionWillBeUpdated.type)
                        expect(res.body.name).to.eql(institutionWillBeUpdated.name)
                        expect(res.body.address).to.eql(institutionWillBeUpdated.address)
                        expect(res.body.latitude).to.eql(institutionWillBeUpdated.latitude)
                        expect(res.body.longitude).to.eql(institutionWillBeUpdated.longitude)
                    })
            })
        })

        context('when a family update the institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ latitude: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a application update the institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .patch(`/institutions/${institutionWillBeUpdated.id}`)
                    .send({ latitude: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('DELETE /institutions/:institution_id', () => {

        let institutionSend: Institution = new Institution()
        institutionSend.type = 'one more cool type'
        institutionSend.name = 'one more cool name'

        before(async () => {
            try {
                const result = await acc.saveInstitution(accessTokenAdmin, institutionSend)
                institutionSend.id = result.id
            } catch (err) {
                console.log('Failure on Institution test: ', err)
            }
        })

        context('when the institution was associated with an user', () => {

            const child = new Child()
            child.username = 'child03'
            child.password = 'child123'
            child.institution = institutionWillBeUpdated
            child.gender = 'male'
            child.age = 10

            before(async () => {
                try {
                    if (institutionWillBeUpdated.id)
                        await acc.saveChild(accessTokenAdmin, child)
                } catch (err) {
                    console.log('Failure on Institution test: ', err)
                }
            })
            it('should return status code 400 and info message from existent association', () => {

                return request(URI)
                    .delete(`/institutions/${institutionWillBeUpdated.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_HAS_ASSOCIATION)
                    })
            })
        })

        context('when a child delete a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a educator delete a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a health professional delete a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a family delete a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when a application delete a institution', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        context('when the deletion was successful', () => {
            it('should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/institutions/${institutionSend.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {

                return request(URI)
                    .delete(`/institutions/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 204 and no content, even the institution was not founded', () => {

                return request(URI)
                    .delete(`/institutions/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
    })
})
