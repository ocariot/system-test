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
import { Sleep, SleepType } from '../../../src/tracking-service/model/sleep'
import { SleepMock } from '../../mocks/tracking-service/sleep.mock'
import { PhasesPatternType, StagesPatternType } from '../../../src/tracking-service/model/sleep.pattern.data.set'
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: users.children.sleep', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
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

    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string


    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const SLEEP_RECORDS: Array<Sleep> = []
    const SLEEP_AMOUNT = 10 // amount of sleep that will be inserted into the array SLEEP_RECORDS

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

            // saves AMOUNT sleep in an array that simulates the database (most recent sleep first).
            // SLEEP_RECORDS[0] = last saved sleep, SLEEP_RECORDS[1] = penultimate sleep saved ...
            for (let i = (SLEEP_AMOUNT - 1); i >= 0; i--) {
                const newSleep: Sleep = new SleepMock()
                const result = await trck.saveSleep(accessDefaultChildToken, newSleep, defaultChild.id)
                newSleep.id = result.id
                newSleep.child_id = result.child_id
                newSleep.pattern!.summary = getSummary(newSleep) // summary obtained through a function, which will be used to check if the API calculated summary is correct
                SLEEP_RECORDS[i] = newSleep
            }

        } catch (err) {
            console.log('Failure on Before from sleep.get_all test: ', err)
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

    describe('GET /children/:child_id/sleep', () => {

        context('when the user get all sleep of the child successfully', () => {

            it('sleep.get_all001: should return status code 200 and and a list with all sleep for admin user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            it('sleep.get_all002: should return status code 200 and and a list with all sleep for child user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            it('sleep.get_all003: should return status code 200 and and a list with all sleep for educator user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            it('sleep.get_all004: should return status code 200 and and a list with all sleep for health professional user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            it('sleep.get_all005: should return status code 200 and and a list with all sleep for family user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            it('sleep.get_all006: should return status code 200 and and a list with all sleep for application user', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(SLEEP_AMOUNT)
                        SLEEP_RECORDS.forEach(function (sleep, index) {
                            expect(res.body[index]).to.have.property('id', sleep.id)
                            expect(res.body[index]).to.have.property('start_time', sleep.start_time!.toISOString())
                            expect(res.body[index]).to.have.property('end_time', sleep.end_time!.toISOString())
                            expect(res.body[index]).to.have.property('duration', sleep.duration)
                            expect(res.body[index]).to.have.property('type', sleep.type)
                            sleep.pattern!.data_set.forEach(function (elem, index2) {
                                expect(res.body[index].pattern.data_set[index2].start_time).to.eql(elem.start_time.toISOString())
                                expect(res.body[index].pattern.data_set[index2].name).to.eql(elem.name)
                                expect(res.body[index].pattern.data_set[index2].duration).to.eql(elem.duration)
                            })
                            expect(res.body[index].pattern.summary).to.have.deep.eql(sleep.pattern!.summary)
                            expect(res.body[index]).to.have.property('child_id', sleep.child_id)
                        })
                    })
            })

            context('when get all sleep with some specification', () => {

                it('sleep.get_all007: should return status code 200 and a list with the seven most recently registered sleep', () => {

                    const PAGE = 1
                    const LIMIT = 7

                    return request(URI)
                        .get(`/children/${defaultChild.id}/sleep?page=${PAGE}&limit=${LIMIT}`)
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)
                            res.body.forEach(function (sleep_res, index) {
                                expect(sleep_res).to.have.property('id', SLEEP_RECORDS[index].id)
                                expect(sleep_res).to.have.property('start_time', SLEEP_RECORDS[index].start_time!.toISOString())
                                expect(sleep_res).to.have.property('end_time', SLEEP_RECORDS[index].end_time!.toISOString())
                                expect(sleep_res).to.have.property('duration', SLEEP_RECORDS[index].duration)
                                expect(sleep_res).to.have.property('type', SLEEP_RECORDS[index].type)
                                sleep_res.pattern!.data_set.forEach(function (elem, index2) {
                                    expect(elem.start_time).to.eql(SLEEP_RECORDS[index].pattern!.data_set[index2].start_time.toISOString())
                                    expect(elem.name).to.eql(SLEEP_RECORDS[index].pattern!.data_set[index2].name)
                                    expect(elem.duration).to.eql(SLEEP_RECORDS[index].pattern!.data_set[index2].duration)
                                })
                                expect(res.body[index].pattern.summary).to.have.deep.eql(SLEEP_RECORDS[index].pattern!.summary)
                                expect(sleep_res).to.have.property('child_id', SLEEP_RECORDS[index].child_id)
                            })
                        })
                })

                it('sleep.get_all008: should return status code 200 and a list with five sleep sorted by the greater start_time', () => {

                    const PAGE = 1
                    const LIMIT = 5
                    const SORT = 'start_time'

                    // copy by value of the SLEEP_RECORDS
                    const SLEEP_RECORDS_COPY = SLEEP_RECORDS.slice()

                    // sort by the greater sleep start_time
                    SLEEP_RECORDS_COPY.sort(function (s1, s2) {
                        return s1.start_time! < s2.start_time! ? 1 : -1
                    })

                    return request(URI)
                        .get(`/children/${defaultChild.id}/sleep?page=${PAGE}&limit=${LIMIT}&sort=-${SORT}`) // sort by the biggest start_time
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(LIMIT)
                            res.body.forEach(function (sleep_res, index) { // when the amount of sleep is specified, iterate through the response
                                expect(sleep_res).to.have.property('id', SLEEP_RECORDS_COPY[index].id)
                                expect(sleep_res).to.have.property('start_time', SLEEP_RECORDS_COPY[index].start_time!.toISOString())
                                expect(sleep_res).to.have.property('end_time', SLEEP_RECORDS_COPY[index].end_time!.toISOString())
                                expect(sleep_res).to.have.property('duration', SLEEP_RECORDS_COPY[index].duration)
                                expect(sleep_res).to.have.property('type', SLEEP_RECORDS_COPY[index].type)
                                sleep_res.pattern!.data_set.forEach(function (elem, index2) {
                                    expect(elem.start_time).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].start_time.toISOString())
                                    expect(elem.name).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].name)
                                    expect(elem.duration).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].duration)
                                })
                                expect(sleep_res.pattern.summary).to.have.deep.eql(SLEEP_RECORDS[index].pattern!.summary)
                                expect(sleep_res).to.have.property('child_id', SLEEP_RECORDS_COPY[index].child_id)
                            })
                        })
                })

                it('sleep.get_all009: should return status code 200 and a list with all sleep sorted by the lowest duration', () => {

                    const SORT = 'duration'

                    // copy by value of the SLEEP_RECORDS
                    const SLEEP_RECORDS_COPY = SLEEP_RECORDS.slice()

                    // sort by the lowest sleep duration
                    SLEEP_RECORDS_COPY.sort(function (s1, s2) {
                        return s1.duration! > s2.duration! ? 1 : -1
                    })

                    return request(URI)
                        .get(`/children/${defaultChild.id}/sleep?sort=${SORT}`) // sort by the lowest duration
                        .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).is.an.instanceOf(Array)
                            expect(res.body.length).to.eql(SLEEP_AMOUNT)
                            res.body.forEach(function (sleep_res, index) { // when the amount of sleep is specified, iterate through the response
                                expect(sleep_res).to.have.property('id', SLEEP_RECORDS_COPY[index].id)
                                expect(sleep_res).to.have.property('start_time', SLEEP_RECORDS_COPY[index].start_time!.toISOString())
                                expect(sleep_res).to.have.property('end_time', SLEEP_RECORDS_COPY[index].end_time!.toISOString())
                                expect(sleep_res).to.have.property('duration', SLEEP_RECORDS_COPY[index].duration)
                                expect(sleep_res).to.have.property('type', SLEEP_RECORDS_COPY[index].type)
                                sleep_res.pattern!.data_set.forEach(function (elem, index2) {
                                    expect(elem.start_time).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].start_time.toISOString())
                                    expect(elem.name).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].name)
                                    expect(elem.duration).to.eql(SLEEP_RECORDS_COPY[index].pattern!.data_set[index2].duration)
                                })
                                expect(sleep_res.pattern.summary).to.have.deep.eql(SLEEP_RECORDS_COPY[index].pattern!.summary)
                                expect(sleep_res).to.have.property('child_id', SLEEP_RECORDS_COPY[index].child_id)
                            })
                        })
                })

            }) // get with some specification

        }) // get sleep successfully

        describe('when a validation error occurs', () => {

            it('sleep.get_all010: should return status code 400 and info message from child_id is invalid', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .get(`/children/${INVALID_ID}/sleep`)
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.SLEEP.ERROR_400_INVALID_CHILD_ID)
                    })
            })

        }) // validation error occurs

        describe('when not informed the acess token', () => {
            it('sleep.get_all011: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        context('when the user does not have permission for get all sleeps', () => {

            describe('when a child get all sleeps of other child', () => {
                it('physical.activities.get_id013: should return the status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/sleep`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('physical.activities.get_id014: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .get(`/children/${defaultChild.id}/sleep`)
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
                        .get(`/children/${defaultChild.id}/sleep`)
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
                        .get(`/children/${defaultChild.id}/sleep`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

        describe('when get all sleep of a child that has been deleted', () => {
            before(async () => {
                try {
                    await acc.deleteUser(accessTokenAdmin, defaultChild.id)
                } catch (err) {
                    console.log('Failure in physical.activities.get_all test: ', err.message)
                }
            })
            it('sleep.get_all012: should return status code 400 and info message from child not found', async () => {

                return request(URI)
                    .get(`/children/${defaultChild.id}/sleep`)
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

function getSummary(sleep: Sleep) {
    let summary: any = getSummaryJSON(sleep.type)

    if (sleep.type === SleepType.CLASSIC) {
        sleep.pattern!.data_set.forEach(item => {
            if (item.name === PhasesPatternType.ASLEEP) {
                summary.asleep.count += 1
                summary.asleep.duration += item.duration
            } else if (item.name === PhasesPatternType.AWAKE) {
                summary.awake.count += 1
                summary.awake.duration += item.duration
            } else if (item.name === PhasesPatternType.RESTLESS) {
                summary.restless.count += 1
                summary.restless.duration += item.duration
            }
        })
    } else {
        sleep.pattern!.data_set.forEach(item => {
            if (item.name === StagesPatternType.AWAKE) {
                summary.awake.count += 1
                summary.awake.duration += item.duration
            } else if (item.name === StagesPatternType.LIGHT) {
                summary.light.count += 1
                summary.light.duration += item.duration
            } else if (item.name === StagesPatternType.DEEP) {
                summary.deep.count += 1
                summary.deep.duration += item.duration
            } else if (item.name === StagesPatternType.REM) {
                summary.rem.count += 1
                summary.rem.duration += item.duration
            }
        })
    }

    return summary
}

function getSummaryJSON(type?: SleepType) {
    let summaryJSON: any
    if (type === SleepType.CLASSIC) {
        summaryJSON = {
            asleep: {
                count: 0,
                duration: 0
            },
            awake: {
                count: 0,
                duration: 0
            },
            restless: {
                count: 0,
                duration: 0
            }
        }
    } else {
        summaryJSON = {
            light: {
                count: 0,
                duration: 0
            },
            awake: {
                count: 0,
                duration: 0
            },
            deep: {
                count: 0,
                duration: 0
            },
            rem: {
                count: 0,
                duration: 0
            }
        }
    }

    return summaryJSON
}