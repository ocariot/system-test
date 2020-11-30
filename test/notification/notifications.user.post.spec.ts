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

describe('Routes: notification', () => {
    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenFamily: string

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

            defaultChildrenGroup.children = new Array<Child>(defaultChild)
            defaultFamily.children = new Array<Child>(defaultChild)

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            if (defaultChild.username && defaultChild.password) {
                accessTokenChild = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessTokenEducator = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessTokenFamily = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

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

    describe('POST /notifications/user/:id', () => {

        context('when creating a notification successfully.', () => {

            it('notifications.user.post___: should return status code 200 when posting a notification for children user type.', () => {
                const notificationUserChild: NotificationUser = new NotificationUserMock(defaultChild)

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUserChild)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('lastLogin')
                        delete res.body.lastLogin

                        expect(res.body).to.eql(notificationUserChild.asJSONResponse())
                    })
            })

            it('notifications.user.post___: should return status code 200 when posting a notification for family user type.', () => {
                const notificationUserFamily: NotificationUser = new NotificationUserMock(defaultChild)
                notificationUserFamily.type = 'family'
                notificationUserFamily.lang = 'pt'

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUserFamily)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('lastLogin')
                        delete res.body.lastLogin

                        expect(res.body).to.eql(notificationUserFamily.asJSONResponse())
                    })
            })

            it('notifications.user.post___: should return status code 200 when posting a notification for educator user type.', () => {
                const notificationUserEducator: NotificationUser = new NotificationUserMock(defaultChild)
                notificationUserEducator.type = 'educator'
                notificationUserEducator.lang = 'el'

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUserEducator)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.have.property('lastLogin')
                        delete res.body.lastLogin

                        expect(res.body).to.eql(notificationUserEducator.asJSONResponse())
                    })
            })
        })

        context('when a validation error ocurrs.', () => {
            let notificationUser: NotificationUser

            beforeEach(() => {
                notificationUser = new NotificationUserMock(defaultChild)
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the user id is invalid', () => {
                const INVALID_ID = "123"

                return request(URI)
                    .post(`/notifications/user/${INVALID_ID}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the user id is null', () => {
                const NULL_ID = null

                return request(URI)
                    .post(`/notifications/user/${NULL_ID}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the request body is null.', () => {
                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(null)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the language is invalid.', () => {
                notificationUser.lang = 'invalid language'

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.ERROR_400_INVALID_LANGUAGE)
                    })
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the language is not provided.', () => {
                delete notificationUser.lang

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.ERROR_400_LANGUAGE_NOT_PROVIDED)
                    })
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the type of user is invalid.', () => {
                notificationUser.type = 'invalid user type'

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.ERROR_400_INVALID_USER_TYPE)
                    })
            })

            it('notifications.user.post___:  should return status code 400 and info message from validation error, because the type of user is not provided.', () => {
                delete notificationUser.type

                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .then(err => {
                        expect(err.body).to.have.property('redirect_link')
                        delete err.body.redirect_link

                        expect(err.body).to.eql(ApiGatewayException.NOTIFICATION.ERROR_400_USER_TYPE_NOT_PROVIDED)
                    })
            })
        })

        context('when the user does not have permission for post to a specific child', () => {

            let notificationUser: NotificationUser
            
            before(() => {
                notificationUser = new NotificationUserMock(anotherChild)
            })

            it('notifications.user.post___: should return the status code 401 and the authentication failure informational message', () => {
                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('notifications.user.post___: should return the status code 403 when trying post notification.user for a child who is not associated with a educator user', () => {
                return request(URI)
                    .post(`/notifications/user/${anotherChild.id}`)
                    .send(notificationUser)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })


        })
    })
})
