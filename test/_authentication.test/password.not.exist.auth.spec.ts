import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'

describe('Routes: Auth', () => {

    const URI = 'https://localhost'

    describe('Admin auth fall', () => {

        context('when the password does not exists', () => {

            it('should return status code 401 and info message about unauthorized', () => {

                const adminUsername = process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin'
                const password = 'non existent password'

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': adminUsername, 'password': password })
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            })
        })
    })
})