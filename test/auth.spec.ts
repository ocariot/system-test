import request from 'supertest'
import { expect } from 'chai'
import { Strings } from './utils/string.error.message'

const URI = 'https://localhost'

describe('Routes: Auth', () => {
                      
    describe('POST /auth', () => {
        context('when the authentication was successful', () => {
            it('should return the access token', async() => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'admin', 'password': 'admin123' })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })                
            })
        }) 

        context('when the username does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'non-exist username', 'password': 'admin123' })
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            })
        })

        context('when the password does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {
                
                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'admin', 'password': 'non-existent password' })
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            }) 
        })
        
        context('when there are validation errors in the authentication, because the username was not informed', () => {
            it('should return status code 400 and info message about validation errors', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': '', 'password': 'non-existent password' })
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_400_USERNAME)
                    })
            })
        })
        
        context('when there are validation errors in the authentication, because the password was not informed', () => {
            it('should return status code 400 and info message about validation errors', () => {
                
                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'admin', 'password': '' })
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_400_PASSWORD)
                    })
            })
        })
    })
})


 
