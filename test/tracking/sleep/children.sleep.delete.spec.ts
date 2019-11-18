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
import { Sleep } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: users.children.sleep', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
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
    const defaultFamily: Family = new FamilyMock()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultFamilyToken: string

    const defaultSleep: Sleep = new SleepMock()

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(resultDefaultChild)
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            // getting default child token
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            const resultChildrenGroup = await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            defaultChildrenGroup.id = resultChildrenGroup.id

        } catch (err) {
            console.log('Failure on Before from sleep.delete test: ', err)
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

    describe('DELETE /children/:child_id/sleep/:sleep_id', () => {

        beforeEach(async () => {
            try {
                // save default sleep for default child
                const resultDefaultSleep = await trck.saveSleep(accessDefaultChildToken, defaultSleep, defaultChild.id)
                defaultSleep.id = resultDefaultSleep.id
                defaultSleep.child_id = resultDefaultSleep.child_id

            } catch (err) {
                console.log('Failure on Before from sleep.delete test: ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure on Before from sleep.delete test: ', err)
            }
        })

        context('when the user delete a sleep successfully', () => {

            it('sleep.delete001: should return status code 204 and no content for sleep, when the educator delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('sleep.delete002: should return status code 204 and no content for sleep, when the application delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('sleep.delete003: should return status code 204 and no content for sleep, when the family delete a sleep', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) //delete a sleep successfully

        context('when a validation error occurs', () => {

            const INVALID_ID = '123'

            it('sleep.delete004: should return status code 400 and info message from invalid child_id', () => {

                return request(URI)
                    .delete(`/children/${INVALID_ID}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('sleep.delete005: should return status code 400 and info message from invalid sleep_id', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_SLEEP_ID)
                    })
            })

            it('sleep.delete006: should return status code 400 and info message from child not found', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/children/${NON_EXISTENT_ID}/sleep/${defaultSleep.id}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${NON_EXISTENT_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

        })

        describe('when the sleep does not exist', () => {
            it('sleep.delete007: should return status code 204 and no content for sleep, when the sleep not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the user does not have permission for delete sleep', () => {

            it('sleep.delete008: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.delete009: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('sleep.delete010: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('sleep.delete012: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .delete(`/children/${defaultChild.id}/physicalactivities/${defaultSleep.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child is not associated with the family', () => {
                it('sleep.delete013: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .delete(`/children/${defaultChild.id}/physicalactivities/${defaultSleep.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('sleep.delete011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .delete(`/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})