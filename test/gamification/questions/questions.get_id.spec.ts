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

    const defaultQuestion: QuestionMock = new QuestionMock()
    const anotherQuestion: QuestionMock = new QuestionMock()

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
            console.log('Failure on Before from questions.get_id test: ', err)
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

    describe('GET /questions/:question.id', () => {

        context('when the user get a question successfully', () => {
            before(async () => {
                const resultDefaultQuestion = await gamification.saveQuestion(tokensDefault.application, defaultQuestion)
                defaultQuestion.id = resultDefaultQuestion.id
            })

            after(async () => {
                await gamificationDB.removeCollections()
            })

            it('questions.get_id001: should return status code 200 and the Question for admin user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.get_id002: should return status code 200 and the Question for application user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.get_id003: should return status code 200 and the Question for child user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.child))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.get_id004: should return status code 200 and the Question for educator user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.educator))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.get_id005: should return status code 200 and the Question for family user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.family))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

            it('questions.get_id006: should return status code 200 and the Question for health professional user', () => {
                return request(URI)
                    .get(`/questions/${defaultQuestion.id}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.healthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(HttpStatus.OK)
                    .then(res => {
                        expect(res.body).to.eql(defaultQuestion.asJSONResponse())
                    })
            })

        })

        context('when the user does not have permission to get a Question', () => {
            before(async () => {
                const resultDefaultQuestion = await gamification.saveQuestion(tokensDefault.application, defaultQuestion)
                defaultQuestion.id = resultDefaultQuestion.id
            })

            after(async () => {
                await gamificationDB.removeCollections()
            })

            describe('when not informed the access token', () => {

                it('questions.get_id007: should return the status code 401 and the authentication failure informational message.', () => {
                    return request(URI)
                        .get(`/questions/${defaultQuestion.id}`)
                        .set('Authorization', 'Bearer ')
                        .set('Content-Type', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

            })

        })

        context('when the question not found', () => {
            before(async () => {
                const resultAnotherQuestion = await gamification.saveQuestion(tokensDefault.application, anotherQuestion)
                anotherQuestion.id = resultAnotherQuestion.id
            })

            after(async () => {
                await gamificationDB.removeCollections()
            })

            describe('when the question has been deleted', () => {
                before(async () => {
                    await gamification.deleteQuestion(tokensDefault.application, anotherQuestion)
                })

                it('questions.get_id008: should return status code 404 when get a deleted question', () => {

                    return request(URI)
                        .get(`/questions/${anotherQuestion.id}`)
                        .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                        .set('Content-Type', 'application/json')
                        .then(err => {
                            expect(err.status).to.eql(HttpStatus.NOT_FOUND)
                        })
                })
            })

            it('questions.get_id009: should return status code 404 when get an inexistent question', () => {
                const INEXISTENT_ID = '111111111111111111111111'

                return request(URI)
                    .get(`/questions/${INEXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(tokensDefault.application))
                    .set('Content-Type', 'application/json')
                    .then(err => {
                        expect(err.status).to.eql(HttpStatus.NOT_FOUND)
                    })
            })

        })

    })

})