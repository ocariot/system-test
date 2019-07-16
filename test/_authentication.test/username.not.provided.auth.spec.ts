import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    describe('POST /auth', () => {

        context('when there are validation errors in the authentication, because the username was not informed', () => {

            it('should return status code 400 and info message about validation errors', () => {

                const password = 'non-existent password'

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'password': password })
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_400_USERNAME)
                    })
            })
        })
    })
})