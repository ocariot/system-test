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

describe('Routes: users.children.sleep', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenEducator: string
    // let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()

    let accessDefaultChildToken: string

    const defaultSleep: Sleep = new SleepMock()
    const otherSleep: Sleep = new SleepMock()

    const defaultStart_time: Date = new Date()
    const defaultEnd_time: Date = new Date(new Date(defaultStart_time)
        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenEducator = tokens.educator.access_token
            // accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

            // getting default child token
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

        } catch (err) {
            console.log('Failure on Before from sleep.patch test: ', err)
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

    describe('PATCH /users/children/:child_id/sleep/:sleep_id', () => {

        beforeEach(async () => {
            try {

                // save default sleep for default child
                const resultDefaultSleep = await trck.saveSleep(accessDefaultChildToken, defaultSleep, defaultChild.id)
                defaultSleep.id = resultDefaultSleep.id
                defaultSleep.child_id = resultDefaultSleep.child_id

            } catch (err) {
                console.log('Failure on Before from sleep.patch test: ', err)
            }
        })

        afterEach(async () => {
            try {
                trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure on Before from sleep.patch test: ', err)
            }
        })

        context('when the user update a sleep of the child successfully', () => {

            it('sleep.patch001: should return status code 200 and updated start_time, end_time and duration for educator user', () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        defaultSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.patch002: should return status code 200 and updated sleep for application user', () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: otherSleep.pattern,
                    child_id: otherSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        otherSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.patch003: should return status code 200 and updated sleep for family user', async () => {

                const body = {
                    start_time: otherSleep.start_time,
                    end_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: otherSleep.pattern,
                    child_id: otherSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(otherSleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(otherSleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(otherSleep.duration)

                        otherSleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

        }) // update sleep successfully

        describe('when a validation error occurs', () => {

            it('sleep.patch004: should return status code 400 and info message about invalid Date, because start_time is greater than end_time', () => {

                const body = {
                    start_time: defaultEnd_time, // start_time greater than end_time
                    end_time: defaultStart_time, // end_time smaller than start_time
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern,
                    child_id: defaultSleep.child_id
                }

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })

            })

        }) // validation error occurs

        // describe('when sleep is not found', () => {

        //     it('sleep.patch017: should return status code 404 and info message from sleep not found', () => {

        //         const body = {
        //             start_time: defaultSleep.start_time,
        //             end_time: defaultSleep.end_time,
        //             duration: defaultSleep.duration,
        //             pattern: defaultSleep.pattern!,
        //             child_id: defaultSleep.child_id
        //         }

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${acc.NON_EXISTENT_ID}`)
        //             .send(body)
        //             .set('Content-Type', 'application/json')
        //             .set('Authorization', 'Bearer '.concat(accessTokenEducator))
        //             .expect(404)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
        //             })
        //     })
        // })

        // context('when the user does not have permission for update sleep', () => {

        //     const body = {
        //         start_time: defaultSleep.start_time,
        //         end_time: defaultSleep.end_time,
        //         duration: defaultSleep.duration,
        //         pattern: defaultSleep.pattern!,
        //         child_id: defaultSleep.child_id
        //     }

        //     it('sleep.patch018: should return status code 403 and info message from insufficient permissions for admin user', () => {

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
        //             .send(body)
        //             .set('Content-Type', 'application/json')
        //             .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        //             .expect(403)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
        //             })
        //     })

        //     it('sleep.patch019: should return status code 403 and info message from insufficient permissions for child user', () => {

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
        //             .send(body)
        //             .set('Content-Type', 'application/json')
        //             .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
        //             .expect(403)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
        //             })
        //     })

        //     it('sleep.patch020: should return status code 403 and info message from insufficient permissions for health professional user', () => {

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
        //             .send(body)
        //             .set('Content-Type', 'application/json')
        //             .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
        //             .expect(403)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
        //             })
        //     })

        // }) // user does not have permission

        // describe('when not informed the acess token', () => {

        //     it('sleep.patch021: should return the status code 401 and the authentication failure informational message', () => {

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
        //             .send({})
        //             .set('Content-Type', 'application/json')
        //             .set('Authorization', 'Bearer ')
        //             .expect(401)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
        //             })
        //     })
        // })

        // describe('when update a sleep of a child that has been deleted', () => {

        //     it('sleep.patch022: should return status code 404 and info message from sleep not found', async () => {

        //         await acc.deleteUser(accessTokenAdmin, defaultChild.id)

        //         const body = {
        //             name: defaultSleep.name,
        //             start_time: defaultSleep.start_time,
        //             end_time: defaultSleep.end_time,
        //             duration: defaultSleep.duration,
        //             calories: defaultSleep.calories,
        //             steps: defaultSleep.steps ? defaultSleep.steps : undefined,
        //             levels: defaultSleep.levels ? defaultSleep.levels : undefined,
        //             child_id: defaultSleep.child_id
        //         }

        //         return request(URI)
        //             .patch(`/users/children/${defaultChild.id}/sleep/${defaultSleep.id}`)
        //             .send(body)
        //             .set('Authorization', 'Bearer '.concat(accessTokenEducator))
        //             .set('Content-Type', 'application/json')
        //             .expect(404)
        //             .then(err => {
        //                 expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND)
        //             })
        //     })
        // })
    })
})