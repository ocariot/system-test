import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'
import { Institution } from '../../src/account-service/model/institution'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'

describe('Routes: Institution', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

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

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

        } catch (err) {
            console.log('Failure on Before from institutions.get_id test', err)
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

    describe('GET /institutions/:institution_id', () => {

        context('when get a unique institution in database successfull', () => {

            it('institutions.get_id001: should return status code 200 and a institution for admin user', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
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

            it('institutions.get_id002: should return status code 200 and a institution for child user', () => {

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

            it('institutions.get_id003: should return status code 200 and a institution for educator user', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
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

            it('institutions.get_id004: should return status code 200 and a institution for health professional user', () => {

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

            it('institutions.get_id005: should return status code 200 and a institution for family user', () => {

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

            it('institutions.get_id006: should return status code 200 and a institution for application user', () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
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

            it('institutions.get_id007: should return status code 200 and only the ID, name and address of the institution', () => {

                const fieldOne = 'name'
                const fieldTwo = 'address'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
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

            it('institutions.get_id008: should return status code 200 and only the ID, type, latitude and longitude of the institution', () => {

                const fieldOne = 'type'
                const fieldTwo = 'latitude'
                const fieldTree = 'longitude'

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}?fields=${fieldOne}%2C${fieldTwo}%2C${fieldTree}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
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

        }) // get a unique institution in database successfull


        describe('when the institution is not found', () => {
            it('institutions.get_id009: should return status code 404 and info message from institution not found', () => {

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

        describe('when get a unique institution informing an invalid ID', () => {
            it('institutions.get_id010: should return status code 400 and info message from invalid ID format', () => {

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

        describe('when not informed the acess token', () => {
            it('institutions.get_id011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
