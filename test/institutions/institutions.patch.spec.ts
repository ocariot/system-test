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

    const defaultInstitution: Institution = new Institution
    defaultInstitution.type = 'not upated type'
    defaultInstitution.name = 'not updated name'

    const latitude = -7.2100766
    const longitude = -35.9175756

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
            console.log('Before Error', e.message)
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

    describe('PATCH /institutions/:institution_id', () => {

        context('when the user update institution', () => {

            it('institutions.patch001: should return status code 200 and type and name of the institution updated by admin user', () => {

                defaultInstitution.type = 'type updated'
                defaultInstitution.name = 'name updated'

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ type: 'type updated', name: 'name updated' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                    })
            })

            it('institutions.patch002: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ address: 'any address' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.patch003: should return status code 200 and address, latitude and longitude of the institution updated by educator user', () => {

                defaultInstitution.address = 'another address'
                defaultInstitution.latitude = 0
                defaultInstitution.longitude = 0

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ address: 'another address', latitude: 0, longitude: 0 })
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

            it('institutions.patch004: should return status code 200 and updated the institution by the health professional user', () => {
                
                defaultInstitution.name = 'another cool name'
                defaultInstitution.type = 'another cool type'
                defaultInstitution.address = 'another cool address'
                defaultInstitution.latitude = latitude
                defaultInstitution.longitude = longitude

                const body = {
                    name: defaultInstitution.name,
                    type: defaultInstitution.type,
                    address: defaultInstitution.address,
                    latitude: defaultInstitution.latitude,
                    longitude: defaultInstitution.longitude
                }

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send(body)
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

            it('institutions.patch005: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ latitude: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.patch006: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ latitude: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user update institution

        describe('when a duplication error occurs', () => {
            
            before(async () => {

                const body: Institution = new Institution()
                body.type = 'Any type'
                body.name = 'Other name'
                body.address = 'Any address'
                body.latitude = 0
                body.longitude = 0

                try {
                    await acc.saveInstitution(accessTokenAdmin, body)
                } catch (err) {
                    console.log('Failure on Institution test: ', err)
                }
            })

            it('institutions.patch007: should return status code 409 and info message from duplicate institutions', () => {

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ name: 'Other name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when the institution_id is invalid', () => {
            it('institutions.patch008: should return status code 400 and info message from invalid id', () => {

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

        describe('when the institution is not found', () => {
            it('institutions.patch009: should return status code 404 and info message from institution not found', () => {

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

        describe('when not informed the acess token', () => {
            it('institutions.patch010: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ latitude: 1 })
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
