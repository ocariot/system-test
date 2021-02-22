import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { foodDB } from '../../../src/food/database/food.db'
import { food } from '../../utils/food.utils'

import { FoodHabitsMock } from '../../mocks/food-service/FoodHabits.mock'
import { Mock } from '../../mocks/mock'

import * as HttpStatus from 'http-status-codes'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: FoodHabits', () => {
    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    const mock: Mock = new Mock()
    let defaultFoodHabits: FoodHabitsMock

    const { accountDefault, tokensDefault, tokensAnother } = mock

    before(async () => {
        try {
            await accountDB.connect()
            await foodDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            await accountDB.removeCollections()

            mock.adminToken = accessTokenAdmin
            await mock.saveUsers()

            defaultFoodHabits = new FoodHabitsMock(accountDefault.child)
        } catch (err) {
            console.log('Failure on Before from foodhabits.get_id test: ', err)
        }
    })

    after(async () => {
        try {
            await accountDB.removeCollections()
            await foodDB.removeCollections()
            await accountDB.dispose()
            await foodDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('GET /foodqs/:foodhabits.id', () => {

        beforeEach(async () => {
            try {
                const resultDefaultFoodHabits = await food.saveFoodHabits(tokensDefault.educator, defaultFoodHabits)
                defaultFoodHabits.id = resultDefaultFoodHabits.id
            } catch (err) {
                console.log('Failure in before from foodhabits.get_id test: ', err.message)
            }
        })

        afterEach(async () => {
            try {
                await foodDB.removeCollections()
            } catch (err) {
                console.log('Failure in after from foddhabits.get_id test: ', err.message)
            }
        })

        context('when get FoodHabits successfully', () => {

            it('foodhabits.get_id001: should return status code 200 and the FoodHabits for admin user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.get_id002: should return status code 200 and the FoodHabits for application user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.get_id003: should return status code 200 and the FoodHabits for educator user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.get_id004: should return status code 200 and the FoodHabits for family user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.get_id005: should return status code 200 and the FoodHabits for health professional user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.healthProfessional))
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.deep.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

        })

        context('when the FoodHabits not exists', () => {

            it('foodhabits.get_id006: should return an error, because FoodHabits.id is invalid', async () => {

                const INVALID_ID = '123'

                return request(URI)
                    .get(`/foodqs/${INVALID_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('foodhabits.get_id007: should return an error, because FoodHabits.id not found', async () => {

                const NOT_EXISTENT_ID = '57dd603000055130442e81b1'

                return request(URI)
                    .get(`/foodqs/${NOT_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        })

        context('when the user does not have permission to get FoodHabits fo specific child.', () => {

            it('foodhabits.get_id008: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.deep.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('foodhabits.get_id009: should return status code 403 and info message from insufficient permissions for child user', async () => {

                return request(URI)
                    .get(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.child))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when the child is not associated with the user', () => {

                it('foodhabits.get_id010: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', async () => {
                    return request(URI)
                        .get(`/foodqs/${defaultFoodHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(tokensAnother.educator))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(res => {
                            expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('foodhabits.get_id011: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', async () => {
                    return request(URI)
                        .get(`/foodqs/${defaultFoodHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(tokensAnother.family))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(res => {
                            expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('foodhabits.get_id012: should return status code 403 and info message from insufficient permissions for health professional user who is not associated with the child', async () => {
                    return request(URI)
                        .get(`/foodqs/${defaultFoodHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(tokensAnother.healthProfessional))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(res => {
                            expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            })

        })
    })
})