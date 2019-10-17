import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Educator } from '../../../src/account-service/model/educator'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: educators', () => {

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

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    let defaultEducatorToken: string

    const anotherEducator: Educator = new Educator()
    anotherEducator.username = 'another educator'
    anotherEducator.password = 'another pass'

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

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

            defaultEducator.institution = defaultInstitution
            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            if (defaultEducator.username && defaultEducator.password)
                defaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)

        } catch (err) {
            console.log('Failure on Before from educators.patch test: ', err)
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

    describe('PATCH /educators/:educator_id', () => {

        context('when the admin update educator successfully', () => {

            it('educators.patch001: should return status code 200 and updated username and institution of the educator for admin user', () => {

                defaultEducator.username = 'newcoolusername'
                defaultEducator.institution = anotherInstitution

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'newcoolusername', institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(anotherInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        if (defaultEducator.last_login)
                            expect(res.body.last_login).to.eql(defaultEducator.last_login)
                    })
            })

            it('educators.patch002: should return status code 200 and updated username and institution of the educator by herself', () => {

                defaultEducator.username = 'anothercoolusername'
                defaultEducator.institution = defaultInstitution

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername', institution_id: defaultInstitution.id })
                    .set('Authorization', 'Bearer '.concat(defaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                        if (defaultEducator.last_login)
                            expect(res.body.last_login).to.eql(defaultEducator.last_login)
                    })
            })
        })

        describe('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherEducator.institution = anotherInstitution
                    await acc.saveEducator(accessTokenAdmin, anotherEducator)
                } catch (err) {
                    console.log('Failure on educators.patch test: ', err)
                }
            })
            it('educators.patch003: should return status code 409 and info message about educator is already registered', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'another educator' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.EDUCATOR.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when the educator is not found', () => {
            it('educators.patch004: should return status code 404 and info message from educator not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the educator

                return request(URI)
                    .patch(`/educators/${NON_EXISTENT_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        describe('when the institution provided does not exists', () => {
            it('educators.patch005: should return status code 400 and message for institution not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the institution

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ institution_id: NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        describe('when the institution id provided was invalid', () => {
            it('educators.patch006: should return status code 400 and message for invalid institution id', () => {
                const INVALID_ID = '123' // invalid id of the institution

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ institution_id: INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the educator_id provided was invalid', () => {
            it('educators.patch007: should return status code 400 and message for invalid id', () => {
                const INVALID_ID = '123' // invalid id of the educator

                return request(URI)
                    .patch(`/educators/${INVALID_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })



        context('when the user does not have permission', () => {

            it('educators.patch008: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.patch009: should return status code 403 and info message from insufficient permissions for another educator user', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anycoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.patch010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.patch011: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.patch012: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('educators.patch013: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/educators/${defaultEducator.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
