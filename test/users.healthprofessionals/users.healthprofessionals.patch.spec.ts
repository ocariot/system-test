import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { HealthProfessional } from '../../src/account-service/model/health.professional'

describe('Routes: users.healthprofessionals', () => {

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

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'
    anotherInstitution.address = 'another address'
    anotherInstitution.latitude = -7.2100766
    anotherInstitution.longitude = -35.9175756

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'Default healthprofessional'
    defaultHealthProfessional.password = 'Default pass'

    let defaultHealthProfessionalToken: string

    const anotherHealthProfessional: HealthProfessional = new HealthProfessional()
    anotherHealthProfessional.username = 'another healthprofessional'
    anotherHealthProfessional.password = 'another pass'

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

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

            defaultHealthProfessional.institution = defaultInstitution
            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            if (defaultHealthProfessional.username && defaultHealthProfessional.password)
                defaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)

        } catch (err) {
            console.log('Failure on Before from users.healthprofessionals.patch test: ', err)
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

    describe('PATCH /users/healthprofessionals/:healthprofessional_id', () => {

        context('when the admin update health professional successfully', () => {
            it('healthprofessionals.patch001: should return status code 200 and updated username and institution of the health professional', () => {

                defaultHealthProfessional.username = 'newcoolusername'
                defaultHealthProfessional.institution = anotherInstitution

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'newcoolusername', institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(anotherInstitution.type)
                        expect(res.body.institution.name).to.eql(anotherInstitution.name)
                        expect(res.body.institution.address).to.eql(anotherInstitution.address)
                        expect(res.body.institution.latitude).to.eql(anotherInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(anotherInstitution.longitude)
                    })
            })
        })

        describe('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherHealthProfessional.institution = anotherInstitution
                    await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
                } catch (err) {
                    console.log('Failure on users.healthprofessionals.patch test: ', err)
                }
            })
            it('healthprofessionals.patch002: should return status code 409 and info message about health professional is already registered', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'another healthprofessional' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.HEALTH_PROFESSIONAL.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when the health professional is not found', () => {
            it('healthprofessionals.patch003: should return status code 404 and info message from health professional not found', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${acc.NON_EXISTENT_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.HEALTH_PROFESSIONAL.ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND)
                    })
            })
        })

        describe('when the institution provided does not exists', () => {
            it('healthprofessionals.patch004: should return status code 400 and message for institution not found', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        describe('when the institution id provided was invalid', () => {
            it('healthprofessionals.patch005: should return status code 400 and message for invalid institution id', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ institution_id: acc.INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the healthprofessional_id was invalid', () => {
            it('healthprofessionals.patch006: should return status code 400 and message for invalid id', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${acc.INVALID_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission', () => {

            it('healthprofessionals.patch007: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })


            it('healthprofessionals.patch008: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.patch009: should return status code 403 and info message from insufficient permissions for own health professional user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${anotherHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(defaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.patch010: should return status code 403 and info message from insufficient permissions for another health professional user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.patch011: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.patch012: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.patch013: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
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
