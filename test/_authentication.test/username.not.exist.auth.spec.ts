import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    describe('POST /auth', () => {

        context('when the username does not exist', () => {

            it('should return status code 401 and info message about unauthorized', () => {

                const username = 'non-existent username'
                const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123'

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': username, 'password': adminPassword })
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            })
        })
    })
})