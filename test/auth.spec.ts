import request from 'supertest'
import { expect } from 'chai'

const URI = 'https://localhost'

describe('Routes: Auth', () => {

    describe('POST /auth', () => {
        context('when the authentication was successful', () => {
            it('should return the access token', () => {
                return request(URI)
                    .post('/auth')
                    .send({ username: 'admin', password: 'admin123' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then((res) => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })

        context('when the username does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {
                return request(URI)
                    .post('/auth')
                    .send({ username: 'admi', password: 'admin123' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(res => {
                        expect(res.body.message).to.eql('Invalid username or password!')
                    })
            })
        })

        context('when the password does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {
                return request(URI)
                    .post('/auth')
                    .send({ username: 'admin', password: 'admin' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(res => {
                        expect(res.body.message).to.eql('Invalid username or password!')
                    })
            })
        })

        context('when there are validation errors in authentication', () => {
            it('should return status code 400 and info message about validation errors', () => {
                return request(URI)
                    .post('/auth')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql('Required fields were not provided...')
                        expect(res.body.description).to.eql('Authentication validation: username, password is required!')
                    })
            })
        })
    })
})