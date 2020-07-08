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
import { PhysicalActivity } from '../../../src/tracking-service/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/tracking-service/physical.activity.mock'
import { PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: children.physicalactivities', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild
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

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string

    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

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

            // save default physical activity for default child
            const resultDefaultActivity = await trck.savePhysicalActivitiy(accessDefaultChildToken, defaultActivity, defaultChild.id)
            defaultActivity.id = resultDefaultActivity.id
            defaultActivity.child_id = resultDefaultActivity.child_id

        } catch (err) {
            console.log('Failure on Before from physical.activities.get_id test: ', err)
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

    describe('GET /children/:child_id/physicalactivities/:physicalactivity_id', () => {

        context('when the user get a specific physical activity of the child successfully', () => {

            it('physical.activities.get_id001: should return status code 200 and and the specific physical activity for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id002: should return status code 200 and and the specific physical activity for own child', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id003: should return status code 200 and and the specific physical activity for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id004: should return status code 200 and and the specific physical activity for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id005: should return status code 200 and and the specific physical activity for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('physical.activities.get_id006: should return status code 200 and and the specific physical activity for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.deep.equal(defaultActivity.heart_rate)
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })

        }) // get physical activity successfully

        describe('when physical activity is not found', () => {
            it('physical.activities.get_id008: should return status code 404 and info message from physical activity not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            const INVALID_ID = '123'

            it('physical.activities.get_id007: should return status code 400 and info message from child not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/children/${NON_EXISTENT_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${NON_EXISTENT_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('physical.activities.get_id009: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .get(`/children/${INVALID_ID}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('physical.activities.get_id010: should return status code 400 and info message from invalid activity_id, because activity_id is invalid', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_400_INVALID_PHYSICAL_ACTIVY_ID)
                    })
            })

        }) // validation error occurs

        describe('when not informed the acess token', () => {

            it('physical.activities.get_id011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when the user does not have permission for get PhysicalActivity', () => {
            describe('when a child get the physical activity of other child', () => {
                it('physical.activities.get_id012: should return the status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('physical.activities.get_id014: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the health professional', () => {
                it('physical.activities.get_id015: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child is not associated with the family', () => {
                it('physical.activities.get_id016: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

        describe('when get a specific physical activity of a child that has been deleted', () => {
            it('physical.activities.get_id013: should return status code 404 and info message from physical activity not found', async () => {

                await acc.deleteUser(accessTokenAdmin, defaultChild.id)

                return request(URI)
                    .get(`/children/${defaultChild.id}/physicalactivities/${defaultActivity.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultChild.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })
        })
    })
})
