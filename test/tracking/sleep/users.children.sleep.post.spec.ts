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
import { Sleep } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'

describe('Routes: users.children.sleep', () => {

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

    // // Incorrect sleep objects
    // const incorrectSleepJSON: any = {
    //     start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
    //     end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
    //     duration: 1178000,
    //     pattern: undefined,
    //     type: '',
    // }

    // const incorrectActivity: Sleep = new Sleep().fromJSON(incorrectSleepJSON)


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
            console.log('Failure on Before from sleep.post test: ', err.message)
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

    describe('POST /users/children/:child_id/sleep', () => {
        let sleep: Sleep

        beforeEach(async () => {
            try {
                sleep = new SleepMock()
            } catch (err) {
                console.log('Failure in sleep.post test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteSleepsRecords()
            } catch (err) {
                console.log('Failure in sleep.post test: ', err.message)
            }
        })

        context('when the user posting a Sleep with success', () => {

            it('sleep.post001: should return status code 201 and the saved Sleep by the child user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleep.duration)

                        sleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post002: should return status code 201 and the saved Sleep by the educator user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(sleep.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleep.duration)

                        sleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post003: should return status code 201 and the saved Sleep by the family user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(sleep.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleep.duration)

                        sleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

            it('sleep.post004: should return status code 201 and the saved Sleep by the application user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(sleep.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body.duration).to.eql(sleep.duration)

                        sleep.pattern!.data_set.forEach(function (elem, index) {
                            expect(res.body.pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(res.body.pattern.data_set[index].name).to.eql(elem.name)
                            expect(res.body.pattern.data_set[index].duration).to.eql(elem.duration)
                        })

                        expect(res.body.child_id).to.eql(defaultChild.id)
                    })
            })

        }) //user posting new sleep successfully

        context('when a validation error occurs', () => {

            it('sleep.post005: should return status code 400 and info message from validation error, because physical sleep start_time is not provided', () => {

                delete sleep.start_time

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_REQUIRED)
                    })
            })

            it('sleep.post006: should return status code 400 and info message from validation error, because physical sleep end_time is not provided', () => {

                delete sleep.end_time

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_END_TIME_IS_REQUIRED)
                    })
            })

            it('sleep.post007: should return status code 400 and info message from validatio error, because start_time is greater than end_time', async () => {

                sleep.end_time = new Date()
                await sleepFunction(100)
                sleep.start_time = new Date()

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })
            })

            it.only('sleep.post008: should return status code 400 and info message from validatio error, because duration is negative', () => {

                sleep.duration! = -sleep.duration!
                console.log(sleep.duration)

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME)
                    })
            })

        }) // validation error occurs

        context('when posting a new Sleep for another user that not to be a child', () => {

            it('physical.activities.post026: should return ??? for admin', async () => {

                return request(URI)
                    .post(`/users/children/${await acc.getAdminID()}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post027: should return ??? for educator', () => {

                return request(URI)
                    .post(`/users/children/${defaultEducator.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post028: should return ??? for health professional', () => {

                return request(URI)
                    .post(`/users/children/${defaultHealthProfessional.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post029: should return ??? for family', () => {

                return request(URI)
                    .post(`/users/children/${defaultFamily.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

            it('physical.activities.post030: should return ??? for application', () => {

                return request(URI)
                    .post(`/users/children/${defaultApplication.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })
            })

        }) // another user that not to be a child

        describe('when the child posting a new Sleep for another child', () => {

            it('physical.activities.post031: should return status code 400 and info message ???', async () => {

                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)

                if (anotherChild.username && anotherChild.password) {
                    anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                }

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .send(sleep.toJSON())
                    .expect(400)
                    .then(err => {
                        // expect(err.body).to.eql(ApiGatewayException.???)
                    })

            })
        })

        context('when the user does not have permission for register Sleep', () => {

            it('physical.activities.post032: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(sleep.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('physical.activities.post033: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(sleep.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })
        }) // does not have permission

        describe('when not informed the acess token', () => {

            it('physical.activities.post034: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(sleep.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {

            it('physical.activities.post035: should return status code 409 and info message about duplicate itens', async () => {

                try {
                    await trck.saveSleep(accessDefaultChildToken, sleep, defaultChild.id)
                } catch (err) {
                    console.log('Failure in sleep.post test: ', err.message)
                }

                return request(URI)
                    .post(`/users/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(sleep.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.PHYSICAL_ACTIVITY.ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED)
                    })
            })

        })
    })
})

const sleepFunction = (milliseconds) => { return new Promise(resolve => setTimeout(resolve, milliseconds)) }