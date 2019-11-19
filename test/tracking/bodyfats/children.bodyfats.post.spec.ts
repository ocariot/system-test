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
import { ChildrenGroup } from '../../../src/account-service/model/children.group'

describe('Routes: children.bodyfats', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAnotherEducator: string
    let accessTokenAnotherFamily: string

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

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    let incorrectBodyFatJSON: any

    // BodyFat is invalid, the timestamp field is not provided
    let incorrectBodyFat1: BodyFat = new BodyFatMock()
    incorrectBodyFat1 = getIncorrectBodyFatJSON()
    delete incorrectBodyFat1.timestamp

    // BodyFat is invalid, the value field is not provided
    let incorrectBodyFat2: BodyFat = new BodyFatMock()
    incorrectBodyFat2 = getIncorrectBodyFatJSON()
    delete incorrectBodyFat2.value

    // BodyFat is invalid, the timestamp is invalid
    const invalidMonthDate = '2019-00-11T14:40:00Z'
    let incorrectBodyFat3: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.timestamp = invalidMonthDate
    incorrectBodyFat3 = incorrectBodyFatJSON

    // BodyFat is invalid, the value is a text
    let incorrectBodyFat4: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.value = 'asText'
    incorrectBodyFat4 = incorrectBodyFatJSON

    // BodyFat is invalid, the timestamp is empty
    let incorrectBodyFat5: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.timestamp = ''
    incorrectBodyFat5 = incorrectBodyFatJSON

    // BodyFat is invalid, the value is negative
    let incorrectBodyFat6: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.value = -1
    incorrectBodyFat6 = incorrectBodyFatJSON

    // BodyFat is invalid, the value is null
    let incorrectBodyFat7: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.value = null
    incorrectBodyFat7 = incorrectBodyFatJSON

    // BodyFat is invalid, the timestamp is null
    let incorrectBodyFat8: BodyFat = new BodyFatMock()
    incorrectBodyFatJSON = getIncorrectBodyFatJSON()
    incorrectBodyFatJSON.timestamp = null
    incorrectBodyFat8 = incorrectBodyFatJSON

    const AMOUNT_OF_CORRECT_BODYFATS = 10
    const correctBodyfats: Array<BodyFat> = []
    const mixedBodyfats: Array<BodyFat> = []
    const wrongBodyfats: Array<BodyFat> = []

    before(async () => {
        try {
            await accountDB.connect()
            await trackingDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token

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
            defaultChildrenGroup.children = new Array<Child>(resultDefaultChild)

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

            // Associating defaultChildrenGroup with educator
            const resultChildrenGroup = await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            defaultChildrenGroup.id = resultChildrenGroup.id

            /* populating the BodyFat arrays */
            for (let i = 0; i < AMOUNT_OF_CORRECT_BODYFATS; i++) {
                correctBodyfats[i] = new BodyFatMock()
                await sleep(20) // function sleep for 20 miliseconds so that the timestamp of each BodyFat is different
            }

            mixedBodyfats.push(new BodyFatMock())
            mixedBodyfats.push(incorrectBodyFat6)

            wrongBodyfats.push(incorrectBodyFat7)
            wrongBodyfats.push(incorrectBodyFat8)

        } catch (err) {
            console.log('Failure on Before from bodyfats.post test: ', err.message)
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

    describe('POST /children/:child_id/bodyfats', () => {
        let bodyfat: BodyFat

        beforeEach(async () => {
            try {
                bodyfat = new BodyFatMock()
            } catch (err) {
                console.log('Failure in bodyfats.post test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteMeasurements()
            } catch (err) {
                console.log('Failure in bodyfats.post test: ', err.message)
            }
        })

        context('when the user posting a Body Fat with success', () => {

            it('bodyfats.post001: should return status code 201 and the saved Body Fat by the child user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', bodyfat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', bodyfat.value)
                        expect(res.body).to.have.property('unit', bodyfat.unit)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('bodyfats.post002: should return status code 201 and the saved Body Fat by the educator user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(bodyfat.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', bodyfat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', bodyfat.value)
                        expect(res.body).to.have.property('unit', bodyfat.unit)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('bodyfats.post003: should return status code 201 and the saved Body Fat by the application user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(bodyfat.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', bodyfat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', bodyfat.value)
                        expect(res.body).to.have.property('unit', bodyfat.unit)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('bodyfats.post004: should return status code 201 and the saved Body Fat by the family user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(bodyfat.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', bodyfat.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', bodyfat.value)
                        expect(res.body).to.have.property('unit', bodyfat.unit)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            context('when saved an list of Body Fats', () => {

                describe('when all the Body Fats are correct and still do not saved', () => {
                    it('bodyfats.post005: should return status code 207, create each Body Fat and return a response with description of sucess each body fat', () => {

                        const body: any = []

                        correctBodyfats.forEach(body_fat => {
                            const bodyElem = {
                                timestamp: body_fat.timestamp,
                                value: body_fat.value,
                                unit: body_fat.unit
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/bodyfats`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.success.length).to.eql(AMOUNT_OF_CORRECT_BODYFATS)
                                for (let i = 0; i < res.body.success.length; i++) {
                                    expect(res.body.success[i].code).to.eql(201)
                                    expect(res.body.success[i].item).to.have.property('id')
                                    expect(res.body.success[i].item).to.have.property('timestamp', correctBodyfats[i].timestamp!.toISOString())
                                    expect(res.body.success[i].item).to.have.property('value', correctBodyfats[i].value)
                                    expect(res.body.success[i].item).to.have.property('unit', correctBodyfats[i].unit)
                                    expect(res.body.success[i].item).to.have.property('child_id', defaultChild.id)
                                }
                                expect(res.body.error.length).to.eql(0)
                            })
                    })
                })

                describe('when all the Body Fats are correct but already exists in the repository', () => {
                    before(async () => {
                        try {
                            for (let i = 0; i < correctBodyfats.length; i++) {
                                await trck.saveBodyFat(accessDefaultChildToken, correctBodyfats[i], defaultChild.id)
                            }
                        } catch (err) {
                            console.log('Failure in BodyFats.post : ', err.message)
                        }
                    })
                    it('bodyfats.post006: should return status code 207 and return a response with description of conflict in each body fat', () => {

                        const body: any = []

                        correctBodyfats.forEach(body_fat => {
                            const bodyElem = {
                                timestamp: body_fat.timestamp,
                                value: body_fat.value,
                                unit: body_fat.unit
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/bodyfats`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                for (let i = 0; i < res.body.error.length; i++) {
                                    expect(res.body.error[i].code).to.eql(409)
                                    expect(res.body.error[i].message).to.eql(ApiGatewayException.BODYFATS.ERROR_409_BODYFATS_IS_ALREADY_REGISTERED.message)
                                    expect(res.body.error[i].item).to.have.property('timestamp', correctBodyfats[i].timestamp!.toISOString())
                                    expect(res.body.error[i].item).to.have.property('value', correctBodyfats[i].value)
                                    expect(res.body.error[i].item).to.have.property('unit', correctBodyfats[i].unit)
                                    expect(res.body.error[i].item).to.have.property('child_id', defaultChild.id)
                                }
                                expect(res.body.success.length).to.eql(0)
                            })
                    })
                })

                describe('when there are correct and incorrect Body Fats in the body', () => {
                    it('bodyfats.post007: should return status code 207, and return a response with description of sucess and error in each body fat', () => {

                        const body: any = []

                        mixedBodyfats.forEach(body_fat => {
                            const bodyElem = {
                                timestamp: body_fat.timestamp,
                                value: body_fat.value,
                                unit: body_fat.unit
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/bodyfats`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                // Success item
                                expect(res.body.success[0].code).to.eql(201)
                                expect(res.body.success[0].item).to.have.property('id')
                                expect(res.body.success[0].item).to.have.property('timestamp', mixedBodyfats[0].timestamp!.toISOString())
                                expect(res.body.success[0].item).to.have.property('value', mixedBodyfats[0].value)
                                expect(res.body.success[0].item).to.have.property('unit', mixedBodyfats[0].unit)
                                expect(res.body.success[0].item).to.have.property('child_id', defaultChild.id)

                                // Error item
                                expect(res.body.error[0].code).to.eql(400)
                                expect(res.body.error[0].message).to.eql(ApiGatewayException.BODYFATS.ERROR_400_NEGATIVE_VALUE.message) // negative value
                                expect(res.body.error[0].description).to.eql(ApiGatewayException.BODYFATS.ERROR_400_NEGATIVE_VALUE.description)
                            })
                    })
                })

                describe('when all the Body Fats are incorrect', () => {
                    it('bodyfats.post008: should return status code 207, and return a response with description of error in each bodyfat', () => {

                        const body: any = []

                        wrongBodyfats.forEach(body_fat => {
                            const bodyElem = {
                                timestamp: body_fat.timestamp,
                                value: body_fat.value,
                                unit: body_fat.unit
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/bodyfats`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.error.length).to.eql(wrongBodyfats.length)

                                // incorrectBodyFat7 (valus is null)
                                expect(res.body.error[0].code).to.eql(400)
                                expect(res.body.error[0].message).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_VALUE.message)
                                expect(res.body.error[0].description).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_VALUE.description)

                                // incorrectBodyFat8 (timestamp is null)
                                expect(res.body.error[1].code).to.eql(400)
                                expect(res.body.error[1].message).to.eql(ApiGatewayException.BODYFATS.ERROR_400_DATE_IS_NULL.message)
                                expect(res.body.error[1].description).to.eql(ApiGatewayException.BODYFATS.ERROR_400_DATE_IS_NULL.description)
                            })
                    })
                })
            })

        }) //user posting new BodyFat successfully

        context('when a validation error occurs', () => {

            it('bodyfats.post009: should return status code 400 and info message from error, because timestamp are required', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat1)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_TIMESTAMP_ARE_REQUIRED)
                    })
            })

            it('bodyfats.post010: should return status code 400 and info message from error, because value are required', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat2)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_VALUE_ARE_REQUIRED)
                    })
            })

            it('bodyfats.post011: should return status code 400 and info message from error, because timestamp month is invalid', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat3)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Datetime: ${invalidMonthDate}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
                    })
            })

            it('bodyfats.post012: should return status code 400 and info message from error, because value is a string', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat4)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_VALUE)
                    })
            })

            it('bodyfats.post013: should return status code 400 and info message from error, because timestamp is empty', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat5)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Datetime: , is not in valid ISO 8601 format.`) // timestamp is empty
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
                    })
            })

            it('bodyfats.post014: should return status code 400 and info message from error, because child not exist', () => {

                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .post(`/children/${NON_EXISTENT_ID}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${NON_EXISTENT_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('bodyfats.post015: should return status code 400 and info message from error, because child_id is invalid', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .post(`/children/${INVALID_ID}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('bodyfats.post016: should return status code 400 and info message from error, because timestamp and value are required', () => {

                delete bodyfat.timestamp
                delete bodyfat.value

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_TIMESTAMP_AND_VALUE_ARE_REQUIRED)
                    })
            })

            //SOME FIELDS HAVE NULL VALUE
            it('bodyfats.post027: should return status code 400 and info message from error, because timestamp is null', () => {

                const incorrectBodyFat = getIncorrectBodyFatJSON()
                incorrectBodyFat.timestamp = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_DATE_IS_NULL)
                    })
            })

            it('bodyfats.post028: should return status code 400 and info message from error, because value is null', () => {

                const incorrectBodyFat = getIncorrectBodyFatJSON()
                incorrectBodyFat.value = null

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectBodyFat)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_400_INVALID_VALUE)
                    })
            })
            //SOME FIELDS HAVE NULL VALUE

        }) // validation error occurs

        context('when posting a new Body Fat for another user that not to be a child', () => {

            it('bodyfats.post017: should return 400 and info message from error, when try create a body fat for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()

                return request(URI)
                    .post(`/children/${ADMIN_ID}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${ADMIN_ID} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('bodyfats.post018: should return 400 and info message from error, when try create a body fat for educator', () => {

                return request(URI)
                    .post(`/children/${defaultEducator.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultEducator.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('bodyfats.post019: should return 400 and info message from error, when try create a body fat for health professional', () => {

                return request(URI)
                    .post(`/children/${defaultHealthProfessional.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultHealthProfessional.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('bodyfats.post020: should return 400 and info message from error, when try create a body fat for family', () => {

                return request(URI)
                    .post(`/children/${defaultFamily.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultFamily.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

            it('bodyfats.post021: should return 400 and info message from error, when try create a body fat for applic' +
                'ation', () => {

                return request(URI)
                    .post(`/children/${defaultApplication.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(bodyfat.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`There is no registered Child with ID: ${defaultApplication.id} on the platform!`)
                        expect(err.body.description).to.eql('Please register the Child and try again...')
                    })
            })

        }) // create bodyfats for another user that not to be a child

        context('when the user does not have permission for register Body Fat', () => {

            describe('when the child posting a new Body Fat for another child', () => {
                it('bodyfats.post022: should return status code 403 and info message from insufficient permissions for another child', async () => {

                    const anotherChild: Child = new ChildMock()
                    let anotherChildToken

                    anotherChild.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, anotherChild)

                    if (anotherChild.username && anotherChild.password) {
                        anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                    }

                    return request(URI)
                        .post(`/children/${defaultChild.id}/bodyfats`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(anotherChildToken))
                        .send(bodyfat.toJSON())
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })
            })

            it('bodyfats.post023: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(bodyfat.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('bodyfats.post024: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(bodyfat.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('bodyfats.post027: should return status code 403 and info message from insufficient permissions for health professional user', async () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/bodyfats`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(bodyfat.toJSON())
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })

                })
            })

            describe('when the child is not associated with the family', () => {
                it('bodyfats.post028: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', async () => {

                    return request(URI)
                        .post(`/children/${defaultChild.id}/bodyfats`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(bodyfat.toJSON())
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

        }) // user does not have permission for register bodyfats

        describe('when not informed the acess token', () => {
            it('bodyfats.post025: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(bodyfat.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            let BodyFatDuplicated: BodyFat = new BodyFatMock()
            before(async () => {
                try {
                    await trck.saveBodyFat(accessDefaultChildToken, BodyFatDuplicated, defaultChild.id)
                } catch (err) {
                    console.log('Failure in bodyfats.post test: ', err.message)
                }
            })
            it('bodyfats.post026: should return status code 409 and info message about duplicate itens', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(BodyFatDuplicated.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.BODYFATS.ERROR_409_BODYFATS_IS_ALREADY_REGISTERED)
                    })
            })
        })
    })
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getIncorrectBodyFatJSON() {
    const incorrectBodyFat: any = {
        timestamp: '2019-06-20T14:40:00Z',
        value: 20.2,
        unit: '%'
    }
    return incorrectBodyFat
}