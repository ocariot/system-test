import supertest from 'supertest'
import expect from 'chai'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

describe('Routes: Auth', () => {
    const request = supertest('https://ocariot.nutes.uepb.edu.br')

    describe('POST /auth', () => {
        context('when the authentication was successful', () => {
            it('should return the access token', () => {
                supertest('https://ocariot.nutes.uepb.edu.br')
                    .post('/auth')
                    .send({ username: 'admin', password: 'mysecretkey15' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        console.log('res')
                        expect(res.body).to.have.property('access_token')
                    })
                    .catch(e => {
                        console.log(e)
                    })
            })
        })

        context('when the username or password does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {
                request
                    .post('/auth')
                    .send({ username: 'any', password: 'any' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(res => {
                        expect(res.body.message).to.eql('Invalid username or password!')
                    })
            })
        })

        context('when there are validation errors in authentication', () => {
            it('should return status code 400 and info message about validation errors', () => {
                request
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