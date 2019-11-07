import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { trck } from '../../utils/tracking.utils'
import { trackingDB } from '../../../src/tracking-service/database/tracking.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Institution } from '../../../src/account-service/model/institution'
import { Child } from '../../../src/account-service/model/child'
import { ChildMock } from '../../mocks/account-service/child.mock'
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { Application } from '../../../src/account-service/model/application'
import { ApplicationMock } from '../../mocks/account-service/application.mock'
import { BodyFat } from '../../../src/tracking-service/model/body.fat'
import { BodyFatMock } from '../../mocks/tracking-service/body.fat.mock'

describe('Routes: children.bodyfats', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string
    let accessDefaultApplicationToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultBodyFat: BodyFat = new BodyFatMock()

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution
            defaultApplication.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            //getting tokens for each 'default user'
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            if (defaultApplication.username && defaultApplication.password) {
                accessDefaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

        } catch (err) {
            console.log('Failure on Before from bodyfats.delete test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await trackingDB.removeCollections()
            await accountDB.dispose()
            await trackingDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('DELETE /children/:child_id/bodyfats/:weight_id', () => {

        beforeEach(async () => {
            try {
                const resultWeight = await trck.saveWeight(accessDefaultChildToken, defaultBodyFat, defaultChild.id)
                defaultBodyFat.id = resultWeight.id
                defaultBodyFat.child_id = defaultChild.id
            } catch (err) {
                console.log('Failure in bodyfats.delete test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteMeasurements()
            } catch (err) {
                console.log('Failure in bodyfats.delete test: ', err.message)
            }
        })

        context('when the user delete the body fat of the child successfully', () => {

            it('bodyfats.delete001: should return status code 204 and no content for body fat, for educator user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('bodyfats.delete002: should return status code 204 and no content for body fat, for family user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('bodyfats.delete003: should return status code 204 and no content for body fat, for application user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) //user delete all weights of a child successfully

        context('when a validation error occurs', () => {
            const INVALID_ID = '123'

            it('bodyfats.delete004: should return status code 400 and info message from child_id is invalid', () => {


                return request(URI)
                    .delete(`/children/${INVALID_ID}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('bodyfats.delete005: should return status code 400 and info message from weight_id is invalid', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_BODYFAT_ID)
                    })
            })
        }) // when a validation error occurs

        context('when the body fat is not found', () => {
            const NON_EXISTENT_ID = '111111111111111111111111'

            it('bodyfats.delete006: should return status code 204 and no content for body fat, when the child not exist', () => {

                return request(URI)
                    .delete(`/children/${NON_EXISTENT_ID}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('bodyfats.delete007: should return status code 204 and no content for body fat, when the body fat not exist', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        }) // when the bodyfats is not found

        context('when the user does not have permission for delete body fat', () => {
            it('bodyfats.delete008: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('bodyfats.delete009: should return status code 403 and info message from insufficient permissions for the child', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('bodyfats.delete010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // when the user does not have permission for delete bodyfats

        describe('when not informed the acess token', () => {
            it('bodyfats.delete011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when delete the body fat of a child that has been deleted', () => {
            it('bodyfats.delete012: should return status code 204 and no content for body fat, when the child not exist', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .delete(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })
        })
    })
})