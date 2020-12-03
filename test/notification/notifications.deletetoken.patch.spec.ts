import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'

import { NotificationUser } from '../../src/notification/model/notification.user'
import { NotificationUserMock } from '../mocks/notification/notification.user.mock'

import { Institution } from '../../src/account-service/model/institution'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'
import { Educator } from '../../src/account-service/model/educator'
import { Family } from '../../src/account-service/model/family'

import { ChildMock } from '../mocks/account-service/child.mock'
import { ChildrenGroupMock } from '../mocks/account-service/children.group.mock'
import { EducatorMock } from '../mocks/account-service/educator.mock'
import { FamilyMock } from '../mocks/account-service/family.mock'

import * as HttpStatus from 'http-status-codes'
import { ApiGatewayException } from '../utils/api.gateway.exceptions'

import { notificationUtils } from '../utils/notification.utils'

describe('Routes: notification', () => {
    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenFamily: string

    let accessTokenAnotherEducator: string
    let accessTokenAnotherChild: string
    let accessTokenAnotherFamily: string

    let childrenNotificationUser: NotificationUser

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultFamily: Family = new FamilyMock()
    
    const anotherChild: Child = new ChildMock()
    const anotherEducator: Educator = new EducatorMock()
    const anotherFamily: Family = new FamilyMock()

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            await accountDB.removeCollections()

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

            defaultChild.institution = defaultInstitution
            defaultEducator.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            anotherChild.institution = defaultInstitution
            anotherEducator.institution = defaultInstitution
            anotherFamily.institution = defaultInstitution

            defaultChildrenGroup.children = new Array<Child>(defaultChild)
            defaultFamily.children = new Array<Child>(defaultChild)
            anotherFamily.children = new Array<Child>(anotherChild)

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            const resultAnotherEducator = await acc.saveEducator(accessTokenAdmin, anotherEducator)
            defaultEducator.id = resultAnotherEducator.id

            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            const resultAnotherFamily = await acc.saveFamily(accessTokenAdmin, anotherFamily)
            anotherFamily.id = resultAnotherFamily.id


            if (defaultChild.username && defaultChild.password) {
                accessTokenChild = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (anotherChild.username && anotherChild.password) {
                accessTokenAnotherChild = await acc.auth(anotherChild.username, anotherChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessTokenEducator = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (anotherEducator.username && anotherEducator.password) {
                accessTokenAnotherEducator = await acc.auth(anotherEducator.username, anotherEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessTokenFamily = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            if (anotherFamily.username && anotherFamily.password) {
                accessTokenAnotherFamily = await acc.auth(anotherFamily.username, anotherFamily.password)
            }

            childrenNotificationUser = new NotificationUserMock(defaultChild)

            await acc.saveChildrenGroupsForEducator(accessTokenEducator, defaultEducator, defaultChildrenGroup)
        } catch (err) {
            console.log('Failure on Before from notifications.user.post test: ', err)
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

    describe('PATCH /notifications/deletetoken/:id', () => {
        beforeEach(async () => {
            await notificationUtils.saveNotificationUser(accessTokenChild, childrenNotificationUser)
        })

        context('when deleting a notification token successfully.', () => {

            it('notifications.deletetoken.patch___: should return status code 200 when deleting a notification token for a child.', () => {
                const deletedToken: any = {
                    token: childrenNotificationUser.token
                }

                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('lastLogin')
                        delete res.body.lastLogin

                        expect(res.body).to.eql(childrenNotificationUser.asJSONResponse(false))
                    })
            })

            it('notifications.deletetoken.patch___: should return status code 200 when deleting one of notification tokens for a child, even if the token does not exist.', () => {
                const NON_EXISTENT_TOKEN: any = {
                    token: accessTokenFamily
                }

                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(NON_EXISTENT_TOKEN)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('lastLogin')
                        delete res.body.lastLogin

                        expect(res.body.tokens).to.eql(childrenNotificationUser.asJSONResponse().tokens)
                    })
            })

            describe('when have multiple tokens to a child', () => {
                let educatorNotificationUser: NotificationUser

                before(async () => {
                    educatorNotificationUser = new NotificationUserMock(defaultChild)
                    educatorNotificationUser.lang = 'el'
                    educatorNotificationUser.type = 'educator'
                    educatorNotificationUser.token = accessTokenEducator

                    await notificationUtils.saveNotificationUser(accessTokenChild, educatorNotificationUser)
                    educatorNotificationUser.tokens.push(childrenNotificationUser.token!)
                })

                it('notifications.deletetoken.patch___: should return status code 200 when deleting one of notification tokens for a child.', () => {
                    const deletedToken: any = {
                        token: educatorNotificationUser.token
                    }

                    return request(URI)
                        .patch(`/notifications/deletetoken/${defaultChild.id}`)
                        .send(deletedToken)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(HttpStatus.OK)
                        .then(res => {
                            expect(res.body).to.have.property('lastLogin')
                            delete res.body.lastLogin

                            expect(res.body.tokens).to.eql(educatorNotificationUser.asJSONResponse(false).tokens)
                        })
                })

            })
        })


        context('when a validation error ocurrs.', () => {
            let deletedToken: any

            before(() => {
                deletedToken = {
                    token: childrenNotificationUser.token
                }
            })

            it('notifications.deletetoken.patch___: should return the status code 200 and an informational message when trying delete a notification token for a inexistent id.', () => {
                return request(URI)
                    .patch(`/notifications/deletetoken/${anotherChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.USER_NOT_FOUND)
                    })
            })

            it('notifications.deletetoken.patch___: should return status code 400 and info message from validation error, because the token is not provided.', () => {
                const EMPTY_BODY = {}

                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(EMPTY_BODY)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.ERROR_400_TOKEN_NOT_PROVIDED)
                    })
            })

            it('notifications.deletetoken.patch___: should return status code 400 and info message from validation error, because the child id is invalid.', () => {
                const INVALID_ID = '123'

                return request(URI)
                    .patch(`/notifications/deletetoken/${INVALID_ID}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })


        })

        context('when the user does not have permission for post to a specific child', () => {
            let deletedToken: any

            before(() => {
                deletedToken = {
                    token: childrenNotificationUser.token
                }
            })

            it('notifications.deletetoken.patch___: should return the status code 401 and the authentication failure informational message.', () => {
                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('notifications.deletetoken.patch___: should return the 403 status code when a child user tries to delete a notification token from another child.', () => {
                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('notifications.deletetoken.patch___: should return the 403 status code when an educator user tries to delete a notification token from a child who is not associated with it.', () => {
                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('notifications.deletetoken.patch___: should return the 403 status code when a family user tries to delete a notification token from a child who is not associated with it.', () => {
                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(deletedToken)
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        })
    })
})