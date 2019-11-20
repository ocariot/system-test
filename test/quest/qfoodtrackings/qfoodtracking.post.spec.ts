import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { quest } from '../../utils/quest.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { questionnaireDB } from '../../../src/quizzes/database/quests.db'
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
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { QfoodtrackingMock } from '../../mocks/quest-service/qfoodtracking.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { ChildrenGroupMock } from '../../mocks/account-service/children.group.mock'

describe('Routes: QFoodtracking', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenAnotherChild: string
    let accessTokenAnotherEducator: string
    let accessTokenAnotherFamily: string

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

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    const defaultQfoodtracking = new QfoodtrackingMock()

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenAnotherChild = tokens.child.access_token
            accessTokenAnotherEducator = tokens.educator.access_token
            accessTokenAnotherFamily = tokens.family.access_token

            // Save institution and associating all user for her
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

            // Associating the QFoodTracking with the child
            defaultQfoodtracking.child_id = defaultChild.id

            // Registering users
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

            // Associating defaultChildrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(accessDefaultEducatorToken, defaultEducator, defaultChildrenGroup)
            await acc.saveChildrenGroupsForEducator(accessDefaultHealthProfessionalToken, defaultHealthProfessional, defaultChildrenGroup)

        } catch (err) {
            console.log('Failure on Before from weight.delete test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await questionnaireDB.removeCollections()
            await accountDB.dispose()
            await questionnaireDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /qfoodtrackings', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQFoodTracking()
            } catch (err) {
                console.log('Failure on Before in qfoodtracking.post test: ', err.message)
            }
        })

        context('when the user posting a QFoodtracking for the child successfully', () => {

            it('qfoodtracking.post001: should return status code 200 and the saved QFoodtracking by own child', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQfoodtracking)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.date).to.eql(defaultQfoodtracking.date!.toISOString())
                        expect(res.body.type).to.eql(defaultQfoodtracking.type)
                        expect(res.body.categories_array).to.eql(defaultQfoodtracking.categories_array)
                    })
            })

            it('qfoodtracking.post002: should return status code 200 and the saved QFoodtracking by the educator', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQfoodtracking)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.date).to.eql(defaultQfoodtracking.date!.toISOString())
                        expect(res.body.type).to.eql(defaultQfoodtracking.type)
                        expect(res.body.categories_array).to.eql(defaultQfoodtracking.categories_array)
                    })
            })

            it('qfoodtracking.post003: should return status code 200 and the saved QFoodtracking by the family', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQfoodtracking)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.date).to.eql(defaultQfoodtracking.date!.toISOString())
                        expect(res.body.type).to.eql(defaultQfoodtracking.type)
                        expect(res.body.categories_array).to.eql(defaultQfoodtracking.categories_array)
                    })
            })

            it('qfoodtracking.post004: should return status code 200 and the saved QFoodtracking by the application', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQfoodtracking)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.date).to.eql(defaultQfoodtracking.date!.toISOString())
                        expect(res.body.type).to.eql(defaultQfoodtracking.type)
                        expect(res.body.categories_array).to.eql(defaultQfoodtracking.categories_array)
                    })
            })

        }) // posting a QFoodtracking successfully

        describe('when the child posting a empty Object to himself', () => {
            it('qfoodtracking.post005: should return status code ?', () => {

                const body = {}

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(body)
                    .expect(200)
                    .then(res => {
                        console.log('post a empty object result: ', res.body)
                    })
            })
        })

        describe('when the child posting a empty Object twice for the same child', () => {
            it('qfoodtracking.post006: should return status code ?', async () => {

                const body = { child_id: defaultChild.id }
                const result = await quest.saveQFoodTracking(accessDefaultChildToken, body)
                console.log('objeto vazio registrado pela primeira vez', result)

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(body)
                    .expect(200)
                    .then(res => {
                        console.log('objetado vazio registrado pela segunda vez para a mesma criança: ', res.body)
                    })
            })
        })


        describe('when the child posting the same QFoodTracking twice for the same child', () => {
            before(async () => {
                try {
                    await quest.saveQFoodTracking(accessDefaultChildToken, defaultQfoodtracking)
                } catch (err) {
                    console.log('Failure in qfoodtracking.post test: ', err.message)
                }
            })
            it('qfoodtracking.post007: should return status code ?', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQfoodtracking)
                    .expect(500)
                    .then(res => {
                        console.log('Registrando o mesmo questionário para a mesma criança', res.body)
                    })
            })
        })

        context('when a validation error occurs', () => {

            it('qfoodtracking.post008: should return status code ?, because the amount of a given food is negative', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.categories_array[1] = '-1' //indicates that the child ate a negative amount of a particular food

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(200)
                    .then(err => {
                        console.log('Criança comendo uma quantidade negativa de pão: ', err.body)
                    })
            })

            it('qfoodtracking.post009: should return status code ?, because the food is not in any category', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.categories_array[0] = 'Toy' //indicates that the child ate a Toy

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(200)
                    .then(err => {
                        console.log('Criança comendo um brinquedo: ', err.body)
                    })
            })

            // WITHOUT ENTERING ALL FIELDS
            it('qfoodtracking.post010: should return status code ?, because child_id is not provided', () => {
                delete defaultQfoodtracking.child_id

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQfoodtracking)
                    .expect(200)
                    .then(err => {
                    })
            })
            // WITHOUT ENTERING ALL FIELDS

            it('qfoodtracking.post011: should return status code ?, because date is null', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.date = null

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                    })
            })

            // SOME FIELD HAS NULL VALUE
            it('qfoodtracking.post012: should return status code ?, because date is null', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.date = null

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                    })
            })

            it('qfoodtracking.post013: should return status code ?, because type is null', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.type = null

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                    })
            })

            it('qfoodtracking.post014: should return status code ?, because categories_array is null', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.categories_array = null

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                    })
            })
            // SOME FIELD HAS NULL VALUE

            // SOME FIELD HAS INVALID
            it('qfoodtracking.post015: should return status code ?, because date is a number', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.date = 20191120174931219

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                        console.log(err.body)
                        console.log(err.body.error.details)
                    })
            })

            it('qfoodtracking.post016: should return status code ?, because type is a number', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.type = 12345

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                        console.log(err.body)
                        console.log(err.body.error.details)
                    })
            })

            it('qfoodtracking.post017: should return status code ?, because categories_array is a number', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.categories_array = null

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                        console.log(err.body)
                        console.log(err.body.error.details)
                    })
            })
            // SOME FIELD HAS INVALID

            it('qfoodtracking.post018: should return status code ?, because month is invalid', () => {
                const incorrectQFoodTracking = getQFoodTrackingJSON()
                incorrectQFoodTracking.date = '2019-13-01T19:40:45.124Z' // invalid month(13)

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(incorrectQFoodTracking)
                    .expect(422)
                    .then(err => {
                        console.log(err.body)
                        console.log(err.body.error.details)
                    })
            })

        })

        context('when the user does not have permission for register QFoodTracking', () => {

            it('qfoodtracking.post019: should return status code 403 and info message from insufficient permissions for admin', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQfoodtracking)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('qfoodtracking.post020: should return status code 403 and info message from insufficient permissions for Health Professional', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQfoodtracking)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('qfoodtracking.post021: should return status code 403 and info message from insufficient permissions for another child', () => {

                return request(URI)
                    .post('/qfoodtrackings')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAnotherChild))
                    .send(defaultQfoodtracking)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child does not belong to any of the groups associated with the educator', () => {
                it('qfoodtracking.post022: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {

                    return request(URI)
                        .post('/qfoodtrackings')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherEducator))
                        .send(defaultQfoodtracking)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            describe('when the child does not belong to any of the groups associated with the family', () => {
                it('qfoodtracking.post023: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {

                    return request(URI)
                        .post('/qfoodtrackings')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(accessTokenAnotherFamily))
                        .send(defaultQfoodtracking)
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })

    })
})

function getQFoodTrackingJSON() {

    const incorrectQFoodTrackingJSON: any = {
        id: '5dd572e805560300431b1004',
        child_id: '5a62be07de34500146d9c544',
        date: '2019-11-07T19:40:45.124Z',
        type: 'Breakfast',
        categories_array: ['Bread', '2', 'Eggs', '3', 'low_milk', '1']
    }

    return incorrectQFoodTrackingJSON
}