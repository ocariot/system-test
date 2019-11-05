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
import { Weight } from '../../../src/tracking-service/model/weight'
import { WeightMock } from '../../mocks/tracking-service/weight.mock'

describe('Routes: children.sleep', () => {

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

    let incorrectWeightJSON: any

    // Weight is invalid, the timestamp field is not provided
    let incorrectWeight1: Weight = new WeightMock()
    incorrectWeight1 = getIncorrectWeightJSON()
    delete incorrectWeight1.timestamp

    // Weight is invalid, the value field is not provided
    let incorrectWeight2: Weight = new WeightMock()
    incorrectWeight2 = getIncorrectWeightJSON()
    delete incorrectWeight2.value

    // Weight is invalid, the unit field is not provided
    let incorrectWeight3: Weight = new WeightMock()
    incorrectWeight3 = getIncorrectWeightJSON()
    delete incorrectWeight3.unit

    // Weight is invalid, the timestamp is invalid
    const invalidDayDate = '2019-06-00T14:40:00Z'
    let incorrectWeight4: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.timestamp = invalidDayDate
    incorrectWeight4 = incorrectWeightJSON

    // Weight is invalid, the value is a text
    let incorrectWeight5: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.value = 'asText'
    incorrectWeight5 = incorrectWeightJSON

    // Weight is invalid, the body_fat.value is a text
    let incorrectWeight6: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.body_fat = 'asText'
    incorrectWeight6 = incorrectWeightJSON

    // Weight is invalid, the timestamp is empty
    let incorrectWeight7: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.timestamp = ''
    incorrectWeight7 = incorrectWeightJSON

    // Weight is invalid, the value is negative
    let incorrectWeight8: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.value = -1
    incorrectWeight8 = incorrectWeightJSON

    // Weight is invalid, the unit is empty
    let incorrectWeight9: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.unit = ''
    incorrectWeight9 = incorrectWeightJSON

    // Weight is invalid, the body_fat.value is negative
    let incorrectWeight10: Weight = new WeightMock()
    incorrectWeightJSON = getIncorrectWeightJSON()
    incorrectWeightJSON.body_fat = -1
    incorrectWeight10 = incorrectWeightJSON

    const AMOUNT_OF_CORRECT_WEIGHTS = 10
    const correctWeights: Array<Weight> = []
    const mixedWeights: Array<Weight> = []
    const wrongWeights: Array<Weight> = []

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

            /* populating the weight arrays */
            for (let i = 0; i < AMOUNT_OF_CORRECT_WEIGHTS; i++) {
                correctWeights[i] = new WeightMock()
                await sleep(20) // function sleep for 20 miliseconds so that the timestamp of each weight is different
            }

            mixedWeights.push(new WeightMock())
            mixedWeights.push(incorrectWeight7)

            wrongWeights.push(incorrectWeight8)
            wrongWeights.push(incorrectWeight9)
            wrongWeights.push(incorrectWeight10)

        } catch (err) {
            console.log('Failure on Before from weight.post test: ', err.message)
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

    describe('POST /children/:child_id/weights', () => {
        let weight: Weight

        beforeEach(async () => {
            try {
                weight = new WeightMock()
            } catch (err) {
                console.log('Failure in weight.post test: ', err.message)
            }
        })
        afterEach(async () => {
            try {
                await trackingDB.deleteMeasurements()
            } catch (err) {
                console.log('Failure in weight.post test: ', err.message)
            }
        })

        context('when the user posting a Weight with success', () => {

            it('weight.post001: should return status code 201 and the saved Weight by the child user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', weight.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', weight.value)
                        expect(res.body).to.have.property('unit', weight.unit)
                        expect(res.body).to.have.property('body_fat', weight.body_fat!.value)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('weight.post002: should return status code 201 and the saved Weight by the educator user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(weight.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', weight.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', weight.value)
                        expect(res.body).to.have.property('unit', weight.unit)
                        expect(res.body).to.have.property('body_fat', weight.body_fat!.value)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('weight.post003: should return status code 201 and the saved Weight by the application user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(weight.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', weight.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', weight.value)
                        expect(res.body).to.have.property('unit', weight.unit)
                        expect(res.body).to.have.property('body_fat', weight.body_fat!.value)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            it('weight.post004: should return status code 201 and the saved Weight by the family user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(weight.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('timestamp', weight.timestamp!.toISOString())
                        expect(res.body).to.have.property('value', weight.value)
                        expect(res.body).to.have.property('unit', weight.unit)
                        expect(res.body).to.have.property('body_fat', weight.body_fat!.value)
                        expect(res.body).to.have.property('child_id', defaultChild.id)
                    })
            })

            describe('when post a Weight with only required parameters', () => {
                it('weight.post005: should return status code 201 and the saved Weight', () => {

                    delete weight.body_fat

                    return request(URI)
                        .post(`/children/${defaultChild.id}/weights`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                        .send(weight.toJSON())
                        .expect(201)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body).to.have.property('timestamp', weight.timestamp!.toISOString())
                            expect(res.body).to.have.property('value', weight.value)
                            expect(res.body).to.have.property('unit', weight.unit)
                            expect(res.body).to.not.have.property('body_fat')
                            expect(res.body).to.have.property('child_id', defaultChild.id)
                        })
                })
            })

            context('when saved an list of weights', () => {

                describe('when all the weights are correct and still do not saved', () => {
                    it('weight.post006: should return status code 207, create each Weight and return a response with description of sucess each weight', () => {

                        const body: any = []

                        correctWeights.forEach(weight => {
                            const bodyElem = {
                                timestamp: weight.timestamp,
                                value: weight.value,
                                unit: weight.unit,
                                body_fat: weight.body_fat ? weight.body_fat.value ? weight.body_fat.value : weight.body_fat : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/weights`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.success.length).to.eql(AMOUNT_OF_CORRECT_WEIGHTS)
                                for (let i = 0; i < res.body.success.length; i++) {
                                    expect(res.body.success[i].code).to.eql(201)
                                    expect(res.body.success[i].item).to.have.property('id')
                                    expect(res.body.success[i].item).to.have.property('timestamp', correctWeights[i].timestamp!.toISOString())
                                    expect(res.body.success[i].item).to.have.property('value', correctWeights[i].value)
                                    expect(res.body.success[i].item).to.have.property('unit', correctWeights[i].unit)
                                    if (correctWeights[i].body_fat) {
                                        expect(res.body.success[i].item.body_fat).to.eql(correctWeights[i].body_fat!.value)
                                    }
                                    expect(res.body.success[i].item).to.have.property('child_id', defaultChild.id)
                                }
                                expect(res.body.error.length).to.eql(0)
                            })
                    })
                })

                describe('when all the weights are correct but already exists in the repository', () => {
                    before(async () => {
                        try {
                            for (let i = 0; i < correctWeights.length; i++) {
                                await trck.saveWeight(accessDefaultChildToken, correctWeights[i], defaultChild.id)
                            }
                        } catch (err) {
                            console.log('Failure in weights.post : ', err.message)
                        }
                    })
                    it('weight.post007: should return status code 207 and return a response with description of conflict in each weight', () => {

                        const body: any = []

                        correctWeights.forEach(weight => {
                            const bodyElem = {
                                timestamp: weight.timestamp,
                                value: weight.value,
                                unit: weight.unit,
                                body_fat: weight.body_fat ? weight.body_fat.value ? weight.body_fat.value : weight.body_fat : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/weights`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                for (let i = 0; i < res.body.error.length; i++) {
                                    expect(res.body.error[i].code).to.eql(409)
                                    expect(res.body.error[i].message).to.eql(ApiGatewayException.WEIGHTS.ERROR_409_WEIGHT_IS_ALREADY_REGISTERED.message)
                                    expect(res.body.error[i].item).to.have.property('timestamp', correctWeights[i].timestamp!.toISOString())
                                    expect(res.body.error[i].item).to.have.property('value', correctWeights[i].value)
                                    expect(res.body.error[i].item).to.have.property('unit', correctWeights[i].unit)
                                    if (correctWeights[i].body_fat) {
                                        expect(res.body.error[i].item.body_fat).to.eql(correctWeights[i].body_fat!.value)
                                    }
                                    expect(res.body.error[i].item).to.have.property('child_id', defaultChild.id)
                                }
                                expect(res.body.success.length).to.eql(0)
                            })
                    })
                })

                describe('when there are correct and incorrect weights in the body', () => {
                    it('weight.post008: should return status code 207, and return a response with description of sucess and error in each weight', () => {

                        const body: any = []

                        mixedWeights.forEach(weight => {
                            const bodyElem = {
                                timestamp: weight.timestamp,
                                value: weight.value,
                                unit: weight.unit,
                                body_fat: weight.body_fat ? weight.body_fat.value ? weight.body_fat.value : weight.body_fat : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/weights`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                // Success item
                                expect(res.body.success.length).to.eql(AMOUNT_OF_CORRECT_WEIGHTS)
                                expect(res.body.success[0].code).to.eql(201)
                                expect(res.body.success[0].item).to.have.property('id')
                                expect(res.body.success[0].item).to.have.property('timestamp', mixedWeights[0].timestamp!.toISOString())
                                expect(res.body.success[0].item).to.have.property('value', mixedWeights[0].value)
                                expect(res.body.success[0].item).to.have.property('unit', mixedWeights[0].unit)
                                if (mixedWeights[0].body_fat) {
                                    expect(res.body.success[0].item.body_fat).to.eql(mixedWeights[0].body_fat!.value)
                                }
                                expect(res.body.success[0].item).to.have.property('child_id', defaultChild.id)

                                // Error item
                                expect(res.body.error[0].code).to.eql(400)
                                expect(res.body.error[0].message).to.eql(`Datetime: , is not in valid ISO 8601 format.`) // timestamp is empty
                                expect(res.body.error[0].description).to.eql(`Date must be in the format: yyyy-MM-dd\\'T\\'HH:mm:ssZ'`)
                            })
                    })
                })

                describe('when all the weights are incorrect', () => {
                    it('weight.post009: should return status code 207, and return a response with description of error in each weight', () => {

                        const body: any = []

                        wrongWeights.forEach(weight => {
                            const bodyElem = {
                                timestamp: weight.timestamp,
                                value: weight.value,
                                unit: weight.unit,
                                body_fat: weight.body_fat ? weight.body_fat.value ? weight.body_fat.value : weight.body_fat : undefined
                            }
                            body.push(bodyElem)
                        })

                        return request(URI)
                            .post(`/children/${defaultChild.id}/weights`)
                            .set('Content-Type', 'application/json')
                            .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                            .send(body)
                            .expect(207)
                            .then(res => {
                                expect(res.body.error.length).to.eql(3)

                                // incorrectWeight8
                                expect(res.body.error[0].code).to.eql(400)
                                expect(res.body.error[0].message).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_NEGATIVE_VALUE.message)
                                expect(res.body.error[0].description).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_NEGATIVE_VALUE.description)

                                // incorrectWeight9
                                expect(res.body.error[1].code).to.eql(400)
                                expect(res.body.error[1].message).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_EMPTY_UNIT.message)
                                expect(res.body.error[1].description).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_EMPTY_UNIT.description)

                                // incorrectWeight10
                                expect(res.body.error[2].code).to.eql(400)
                                expect(res.body.error[2].message).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_BODY_FAT_VALUE_IS_NEGATIVE.message)
                                expect(res.body.error[2].description).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_BODY_FAT_VALUE_IS_NEGATIVE.description)
                            })
                    })
                })
            })

        }) //user posting new Weight successfully

        context('when a validation error occurs', () => {

            it('weight.post010: should return status code 400 and info message from error, because timestamp are required', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight1)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_TIMESTAMP_ARE_REQUIRED)
                    })
            })

            it('weight.post011: should return status code 400 and info message from error, because value are required', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight2)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_VALUE_ARE_REQUIRED)
                    })
            })

            it('weight.post012: should return status code 400 and info message from error, because unit are required', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight3)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_UNIT_ARE_REQUIRED)
                    })
            })

            it('weight.post013: should return status code 400 and info message from error, because timestamp day is invalid', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight4)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Datetime: ${invalidDayDate}, is not in valid ISO 8601 format.`)
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
                    })
            })

            it('weight.post014: should return status code 400 and info message from error, because value is a string', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight5)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_INVALID_VALUE)
                    })
            })

            it('weight.post015: should return status code 400 and info message from error, because body_fat.value is a string', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectWeight6)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_INVALID_BODY_FAT_VALUE)
                    })
            })

            it('weight.post016: should return status code 400 and info message from error, because child not exist', () => {

                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .post(`/children/${NON_EXISTENT_ID}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`ID ${NON_EXISTENT_ID} is not associated with a child!`)
                    })
            })

            it('weight.post017: should return status code 400 and info message from error, because child_id is invalid', () => {

                const INVALID_ID = '123'

                return request(URI)
                    .post(`/children/${INVALID_ID}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_INVALID_CHILD_ID)
                    })
            })

            it('weight.post018: should return status code 400 and info message from error, because value and unit are required', () => {

                delete weight.unit
                delete weight.value

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_400_VALUE_AND_UNIT_ARE_REQUIRED)
                    })
            })

        }) // validation error occurs

        context('when posting a new Weight for another user that not to be a child', () => {

            it('weight.post019: should return 400 and info message from error, when try create a weight for admin', async () => {

                const ADMIN_ID = await acc.getAdminID()

                return request(URI)
                    .post(`/children/${ADMIN_ID}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${ADMIN_ID} is not registered on the platform!`)
                    })
            })

            it('weight.post020: should return 400 and info message from error, when try create a weight for educator', () => {

                return request(URI)
                    .post(`/children/${defaultEducator.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultEducator.id} is not registered on the platform!`)
                    })
            })

            it('weight.post021: should return 400 and info message from error, when try create a weight for health professional', () => {

                return request(URI)
                    .post(`/children/${defaultHealthProfessional.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultHealthProfessional.id} is not registered on the platform!`)
                    })
            })

            it('weight.post022: should return 400 and info message from error, when try create a weight for family', () => {

                return request(URI)
                    .post(`/children/${defaultFamily.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultFamily.id} is not registered on the platform!`)
                    })
            })

            it('weight.post023: should return 400 and info message from error, when try create a weight for application', () => {

                return request(URI)
                    .post(`/children/${defaultApplication.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(`Child with ID ${defaultApplication.id} is not registered on the platform!`)
                    })
            })

        }) // create weight for another user that not to be a child

        describe('when the child posting a new Weight for another child', () => {
            it('weight.post024: should return status code 400 and info message from error', async () => {

                const anotherChild: Child = new ChildMock()
                let anotherChildToken

                anotherChild.institution = defaultInstitution
                await acc.saveChild(accessTokenAdmin, anotherChild)

                if (anotherChild.username && anotherChild.password) {
                    anotherChildToken = await acc.auth(anotherChild.username, anotherChild.password)
                }

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(anotherChildToken))
                    .send(weight.toJSON())
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })
        })

        context('when the user does not have permission for register Weight', () => {

            it('weight.post025: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(weight.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

            it('weight.post026: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(weight.toJSON())
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })

            })

        }) // user does not have permission for register weight

        describe('when not informed the acess token', () => {
            it('weight.post027: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(weight.toJSON())
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            let weightDuplicated: Weight = new WeightMock()
            before(async () => {
                try {
                    await trck.saveWeight(accessDefaultChildToken, weightDuplicated, defaultChild.id)
                } catch (err) {
                    console.log('Failure in weight.post test: ', err.message)
                }
            })
            it('weight.post028: should return status code 409 and info message about duplicate itens', () => {

                return request(URI)
                    .post(`/children/${defaultChild.id}/weights`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(weightDuplicated.toJSON())
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.WEIGHTS.ERROR_409_WEIGHT_IS_ALREADY_REGISTERED)
                    })
            })
        })
    })
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getIncorrectWeightJSON() {
    const incorrectWeight: any = {
        timestamp: '2019-06-20T14:40:00Z',
        value: 70.2,
        unit: 'kg',
        body_fat: 20.2
    }
    return incorrectWeight
}