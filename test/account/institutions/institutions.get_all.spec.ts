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

    const institutionsArray = [anotherInstitution, defaultInstitution]
    const institutionsArrayOrderedByType = [defaultInstitution, anotherInstitution]

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

            await accountDB.deleteInstitutions()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

        } catch (err) {
            console.log('Failure on Before from institutions.get_all test', err)
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

    describe('GET ALL /institutions', () => {

        context('when want get all institutions in database successfully', () => {

            it('institutions.get_all001: should return status code 200 and a list of institutions for admin user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

            it('institutions.get_all002: should return status code 200 and a list of institutions for educator user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

            it('institutions.get_all003: should return status code 200 and a list of institutions for health professional user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

            it('institutions.get_all004: should return status code 200 and a list of institutions for application user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

            it('institutions.get_all005: should return status code 200 and a list with two institutions in ascending order by name', () => {

                const sortField = 'name'

                return request(URI)
                    .get(`/institutions?sort=${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

            it('institutions.get_all006: should return status code 200 and a list with two institutions in descending order by type', () => {

                const sortField = 'type'

                return request(URI)
                    .get(`/institutions?sort=-${sortField}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArrayOrderedByType)
                    })
            })

            it('institutions.get_all007: should return status code 200 and a list of two most recent institutions in database', () => {
                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/institutions?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        return res.body
                    })
                    .then(array => array.map(element => new Institution().fromJSON(element)))
                    .then(institutions => {
                        expect(institutions).to.eql(institutionsArray)
                    })
            })

        }) // get all institutions in database

        context('when want get all institutions in database after deleting all of them', () => {

            before(async () => {
                try {
                    await accountDB.deleteInstitutions()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('institutions.get_all008: should return status code 200 and empty list ', () => {

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

        context('when the user does not have permission to get all institution', () => {

            it('institutions.get_all009: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.get_all010: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('institutions.get_all011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/institutions')
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