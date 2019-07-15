import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'

describe('Routes: Auth', () => {

    const URI = 'https://localhost'

    describe('POST /auth', () => {

        context('when there are validation errors in the authentication, because the password was not informed', () => {

            it('should return status code 400 and info message about validation errors', () => {

                const adminUsername = process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin'

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': adminUsername})
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_400_PASSWORD)
                    })
            })
        })
    })
})