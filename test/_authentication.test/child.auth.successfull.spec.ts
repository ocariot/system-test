import request from 'supertest'
import { expect } from 'chai'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { InstitutionMock } from '../mocks/account-service/institution.mock';
import { Child } from '../../src/account-service/model/child';

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('Routes: Auth - POST /auth', () => {

        context('Child authenticated successfull', () => {
            before(async () => {
                try {
                    await con.connect(0, 1000)

                    const token_admin: string = await acc.getAdminToken()
                    const resultInstitution = await acc.saveInstitution(token_admin, new InstitutionMock())
                    defaultChild.institution = resultInstitution

                    await acc.saveChild(token_admin, defaultChild)

                } catch (err) {
                    console.log('Failure in test', err)
                }
            })
            it('should return status code 200 and the access token', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultChild.username, 'password': defaultChild.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})