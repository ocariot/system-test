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
            await foodDB.removeCollections()

            mock.adminToken = accessTokenAdmin
            await mock.saveUsers()

            defaultFoodHabits = new FoodHabitsMock(accountDefault.child)
        } catch (err) {
            console.log('Failure on Before from foodhabits.delete test: ', err)
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

    describe('DELETE /foodqs/:foodhabits.id', () => {

        beforeEach(async () => {
            try {
                const resultDefaultFoodHabits = await food.saveFoodHabits(tokensDefault.educator, defaultFoodHabits)
                defaultFoodHabits.id = resultDefaultFoodHabits.id
            } catch (err) {
                console.log('Failure in before from foodhabits.delete test: ', err.message)
            }
        })

        afterEach(async () => {
            try {
                await foodDB.removeCollections()
            } catch (err) {
                console.log('Failure in after from foodhabits.delete test: ', err.message)
            }
        })

        context('when delete FoodHabits successfully', () => {

            it('foodhabits.delete001: should return status code 204 and no content for admin user', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('foodhabits.delete002: should return status code 204 and no content for family user', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .expect(HttpStatus.NO_CONTENT)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        })

        context('when the user does not have permission to delete a FoodHabits for a specific child', () => {

            it('foodhabits.delete003: should return status code 403 and insufficient permissions info message when an application user tries to delete a FoodHabits', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.delete004: should return status code 403 and insufficient permissions info message when a child user tries to delete a FoodHabits', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.child))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.delete005: should return status code 403 and insufficient permissions info message when an educator user tries to delete a FoodHabits', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.delete006: should return status code 403 and insufficient permissions info message when a health professional user tries to delete a FoodHabits', async () => {

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.healthProfessional))
                    .expect(HttpStatus.FORBIDDEN)
                    .then(res => {
                        expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            describe('when not informed the access token', () => {

                it('foodhabits.delete007: should return the status code 401 and the authentication failure informational message', async () => {
                    return request(URI)
                        .delete(`/foodqs/${defaultFoodHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat())
                        .expect(HttpStatus.UNAUTHORIZED)
                        .then(res => {
                            expect(res.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })
                
            })

            describe('when the user is not associated with the child', () => {

                it('foodhabits.delete008: should return status code 403 and info message from insufficient permissions when a family user who is not associated with the child tries to delete a FoodHabits', async () => {
                    return request(URI)
                        .delete(`/foodqs/${defaultFoodHabits.id}`)
                        .set('Content-Type', 'application/json')
                        .set('Authorization', 'Bearer '.concat(tokensAnother.family))
                        .expect(HttpStatus.FORBIDDEN)
                        .then(res => {
                            expect(res.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            })

        })

        context('when a validation error occurs', () => {

            it('foodhabits.delete009: should return status code 404 and a message error for not entity found', async () => {
                const NON_EXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .delete(`/foodqs/${NON_EXISTENT_ID}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .expect(HttpStatus.NOT_FOUND)
                    .then(res => {
                        expect(res.body.error.message).to.eql(`Entity not found: Foodq with id "${NON_EXISTENT_ID}"`)
                    })
            })

            it('foodhabits.delete010: should return status code 404 and a message error for not entity found when tries delete a FoodHabits twice', async () => {
                await food.deleteFoodHabits(accessTokenAdmin, defaultFoodHabits)

                return request(URI)
                    .delete(`/foodqs/${defaultFoodHabits.id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .expect(HttpStatus.NOT_FOUND)
                    .then(res => {
                        expect(res.body.error.message).to.eql(`Entity not found: Foodq with id "${defaultFoodHabits.id}"`)
                    })
            })

        })

    })
})