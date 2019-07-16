import request from 'supertest'
import { expect } from 'chai'


describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    describe('POST /auth', () => {

        context('Admin authenticated successfull', () => {

            it('001. should return status code 200 and the access token', async () => {

                const adminUsername = process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin'
                const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123'

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': adminUsername, 'password': adminPassword })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})