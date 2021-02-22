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
            console.log('Failure on Before from foodhabits.post test: ', err)
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
    
    describe('POST /foodqs', () => {
        afterEach(async () => {
            await foodDB.removeCollections()
        })

        context('when the user posting a FoodHabits for the child successfully', () => {

            it('foodhabits.post001: should return status code 200 and the saved FoodHabits by educator.', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.post002: should return status code 200 and the saved FoodHabits by family.', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

            it('foodhabits.post003: should return status code 200 and the saved FoodHabits by application.', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultFoodHabits.asJSONResponse())
                    })
            })

        })

        describe('when trying to post a FoodHabits twice for the same child', () => {
            before(async () => {
                await food.saveFoodHabits(tokensDefault.educator, defaultFoodHabits)
            })

            it('foodhabits.post004: should return an error, because the same FoodHabits is already registered for the child', () => {

                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .send(defaultFoodHabits)
                    .expect(err => {
                        expect(err.statusCode).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })
        })
        
        context('when the user does not have permission for register FoodHabits', () => {
            it('foodhabits.post005: should return the status code 401 and the authentication failure informational message, because the access token is not informed', () => {
    
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ')
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.UNAUTHORIZED)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('foodhabits.post006: should return status code 403 and info message from insufficient permissions for admin user', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(mock.adminToken))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.post007: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.child))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.post008: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.healthProfessional))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.post009: should return status code 403 and info message from insufficient permissions for educator user who is not associated with the child', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensAnother.educator))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('foodhabits.post010: should return status code 403 and info message from insufficient permissions for family user who is not associated with the child', () => {
                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(tokensAnother.family))
                    .send(defaultFoodHabits)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        })

    })
})