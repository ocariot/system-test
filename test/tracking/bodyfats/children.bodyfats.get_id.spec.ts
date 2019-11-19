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
import { BodyFat } from '../../../src/tracking-service/model/body.fat'
import { BodyFatMock } from '../../mocks/tracking-service/body.fat.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: children.bodyfats', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string

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

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const defaultBodyFat: BodyFat = new BodyFatMock()

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            // Associating the child
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            // registering default users
            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            // getting default users token
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            // associate children groups
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from bodyfats.get_id test: ', err.message)
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

    describe('GET /children/:child_id/bodyfats/:bodyfat_id', () => {

        beforeEach(async () => {
            try {
                const resultbodyfat = await trck.saveBodyFat(accessDefaultChildToken, defaultBodyFat, defaultChild.id)
                defaultBodyFat.id = resultbodyfat.id
                defaultBodyFat.child_id = defaultChild.id
            } catch (err) {
                console.log('Failure in bodyfats.get_id test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteMeasurements()
            } catch (err) {
                console.log('Failure in bodyfats.get_id test: ', err.message)
            }
        })

        context('when the user get the body fat of the child successfully', () => {

            it('bodyfats.get_id001: should return status code 201 and the body fat of the child for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

            it('bodyfats.get_id002: should return status code 201 and the body fat of the child himself', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

            it('bodyfats.get_id003: should return status code 201 and the body fat of the child for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

            it('bodyfats.get_id004: should return status code 201 and the body fat of the child for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

            it('bodyfats.get_id005: should return status code 201 and the body fat of the child for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

            it('bodyfats.get_id006: should return status code 201 and the body fat of the child for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultBodyFat.id)
                        expect(res.body).to.have.property('timestamp', defaultBodyFat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', defaultBodyFat.value)
                        expect(res.body).to.have.property('unit', defaultBodyFat.unit)
                        expect(res.body).to.have.property('child_id', defaultBodyFat.child_id)
                    })
            })

        }) //user get all bodyfats of a child successfully

        context('when a validation error occurs', () => {
            const INVALID_ID = '123'

            it('bodyfats.get_id007: should return status code 400 and info message from child_id is invalid', () => {


                return request(URI)
                    .get(`/children/${INVALID_ID}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('bodyfats.get_id008: should return status code 400 and info message from bodyfat_id is invalid', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_BODYFAT_ID)
                    })
            })

            it('bodyfats.get_id009: should return status code 404 and info message from body fat not found, because the child not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${NON_EXISTENT_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })
        })

        describe('when the body fat is not found', () => {
            it('bodyfats.get_id010: should return status code 404 and info message from body fat not found. because the body fat not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_404_BODYFAT_NOT_FOUND)
                    })
            })
        })

        describe('when not informed the acess token', () => {
            it('bodyfats.get_id012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the user does not have permission for get Body fat', () => {
            describe('when a child get the body fat of other child', () => {
                it('bodyfats.get_id011: should return the status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('bodyfats.get_id015: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('bodyfats.get_id016: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child is not associated with the family', () => {
                it('bodyfats.get_id017: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })
        describe('when get the body fat of a child that has been deleted', () => {
            it('bodyfats.get_id013: should return status code 404 and info message from body fat not found, because the child not exist', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .get(`/children/${defaultChild.id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultChild.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })
        })
    })
})