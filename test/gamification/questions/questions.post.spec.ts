import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { gamificationDB } from '../../../src/gamification-service/database/gamification.db'
import { gamification } from '../../utils/gamification.utils'

import { QuestionMock } from '../../mocks/gamification-service/question.mock'
import { Mock } from '../../mocks/mock'

import * as HttpStatus from 'http-status-codes'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: Questions', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    const mock: Mock = new Mock()
    let defaultQuestion: QuestionMock = new QuestionMock()

    const { tokensDefault } = mock

    before(async () => {
        try {
            await accountDB.connect()
            await gamificationDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            await accountDB.removeCollections()
            await gamificationDB.removeCollections()

            mock.adminToken = accessTokenAdmin
            await mock.saveUsers()
        } catch (err) {
            console.log('Failure on Before from questions.post test: ', err)
        }
    })

    after(async () => {
        try {
            await accountDB.removeCollections()
            await gamificationDB.removeCollections()
            await accountDB.dispose()
            await gamificationDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /questions', () => {
        afterEach(async () => {
            await gamificationDB.removeCollections()
        })

        context('when the user posting a question successfully', () => {

            it('questions.post001: should return status code 200 and the saved question for application user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.post002: should return status code 200 and the saved question for family user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.post003: should return status code 200 and the saved question for educator user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

        })

        context('when the user does not have permission to register a question', () => {

            describe('when not informed the acess token', () => {

                it('questions.post004: should return the status code 401 and the authentication failure informational message.', () => {
                    return request(URI)
                        .post('/questions')
                        .set('Authorization', 'Bearer '.concat())
                        .set('Content-Type', 'application/json')
                        .send(defaultQuestion)
                        .expect(HttpStatus.UNAUTHORIZED)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

            })

            it('questions.post005: should return status code 403 and info message from insufficient permissions for admin user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('questions.post006: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.child))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('questions.post007: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.healthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.FORBIDDEN)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        })

        context('when a duplication ocurrs', () => {
            before(async () => {
                await gamification.saveQuestion(tokensDefault.application, defaultQuestion)
            })

            it('questions.post008: should return status code 409 when posting a duplicated question', () => {
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(defaultQuestion)
                    .expect(HttpStatus.CONFLICT)
                    .then(err => {
                    })
            })

        })

        context('when a validation error ocurrs', () => {
            
            it('questions.post009: should return an error when posting an empty object', () => {
                const EMPTY_BODY = {}

                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(EMPTY_BODY)
                    .then(err => {
                        expect(err.status).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('questions.post010: should return an error when posting a question with a invalid id', () => {
                const wrongQuestion = defaultQuestion.asJSONRequest()
                wrongQuestion.id = '123'

                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(wrongQuestion)
                    .then(err => {
                        expect(err.status).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('questions.post011: should return an error when posting a null object', () => {
                const NULL_BODY = null

                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(NULL_BODY)
                    .then(err => {
                        expect(err.status).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

            it('questions.post012: should return an error, because question.possible_answers is not an array', () => {
                const wrongQuestion = defaultQuestion.asJSONRequest()
                wrongQuestion.possible_answers = 123
                
                return request(URI)
                    .post('/questions')
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .send(wrongQuestion)
                    .then(err => {
                        expect(err.status).to.be.gte(HttpStatus.BAD_REQUEST)
                    })
            })

        })

    })

})