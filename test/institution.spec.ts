import request from 'supertest'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { expect } from 'chai'

const URI = 'https://localhost'

let accessTokenAdmin: string

describe('Routes: Institution', () => {

    before(async () => {
        try{
            const resultAuth: any = await auth('admin', 'admin123')
            accessTokenAdmin = resultAuth.body.access_token
        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('POST /institutions', () => {
        context('when posting a new institution', () => {
            it('should return status code 201 and the saved institution', () => {
                const institution = new InstitutionMock()
                return request(URI)
                    .post('/institutions')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(institution.toJSON())
                    .expect(201)
                    .then(res =>{
                        expect(res.body).to.have.property('id')
                        expect(res.body.type).to.eql(institution.type)
                        expect(res.body.name).to.eql(institution.name)
                        expect(res.body.address).to.eql(institution.address)
                        expect(res.body.latitude).to.eql(institution.latitude)
                        expect(res.body.longitude).to.eql(institution.longitude)                        
                    })
            })
        })
    })
})

async function auth(username?: string, password?: string): Promise<any> {
    return request(URI)
        .post('/auth')
        .set('Content-Type', 'application/json')
        .send({ 'username': username, 'password': password })
}
