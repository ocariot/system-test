import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'
import { Institution } from '../../src/account-service/model/institution'
import { accountDB } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { Child } from '../../src/account-service/model/child'

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

    const anotherInstitution: Institution = new Institution
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'

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

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

        } catch (err) {
            console.log('Failure on Before from institutions.delete test', err)
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

    describe('DELETE /institutions/:institution_id', () => {

        context('when the user does not have permission to delete the institution', () => {

            it('institutions.delete001: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.delete002: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.delete003: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.delete004: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('institutions.delete005: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('institutions.delete006: when the institution was associated with an user', () => {

            before(async () => {
                try {
                    const child = new Child()
                    child.username = 'child03'
                    child.password = 'child123'
                    child.institution = anotherInstitution
                    child.gender = 'male'
                    child.age = 10

                    await acc.saveChild(accessTokenAdmin, child)

                } catch (err) {
                    console.log('Failure on Institution test: ', err)
                }
            })

            it('should return status code 400 and info message from existent association', () => {

                return request(URI)
                    .delete(`/institutions/${anotherInstitution.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_HAS_ASSOCIATION)
                    })
            })
        })

        describe('institutions.delete007: when not informed the acess token', () => {
            it('should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(defaultInstitution)
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('institutions.delete008: when the institution_id is invalid', () => {
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

        describe('institutions.delete009: when the institution is not found', () => {
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

        describe('when the deletion was successfull by the admin user', () => {
            it('institutions.delete010: should return status code 204 and no content', () => {

                return request(URI)
                    .delete(`/institutions/${defaultInstitution.id}`)
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
