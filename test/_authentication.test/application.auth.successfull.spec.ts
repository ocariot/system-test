import request from 'supertest'
import { expect } from 'chai'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { Application } from '../../src/account-service/model/application'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'default application'
    defaultApplication.password = 'default pass'
    defaultApplication.application_name = 'default application name'

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /auth', () => {

        context('Application authenticated successfull', () => {
            before(async () => {
                try {
                    await con.connect(0, 1000)

                    const token_admin: string = await acc.getAdminToken()
                    await acc.saveApplication(token_admin, defaultApplication)

                } catch (err) {
                    console.log('Failure in test', err)
                }
            })
            it('should return status code 200 and the access token', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultApplication.username, 'password': defaultApplication.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})