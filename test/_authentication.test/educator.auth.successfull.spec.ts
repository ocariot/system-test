import request from 'supertest'
import { expect } from 'chai'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { InstitutionMock } from '../mocks/account-service/institution.mock'
import { Educator } from '../../src/account-service/model/educator'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'default educator'
    defaultEducator.password = 'default pass'

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })    

    describe('POST /auth', () => {

        context('Educator authenticated successfull', () => {
            before(async () => {
                try {
                    await con.connect(0, 1000)

                    const token_admin: string = await acc.auth(
                        process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
                        process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')

                    const resultInstitution = await acc.saveInstitution(token_admin, new InstitutionMock())
                    defaultEducator.institution = resultInstitution

                    await acc.saveEducator(token_admin, defaultEducator)

                } catch (err) {
                    console.log('Failure in test', err)
                }
            })
            it('e001. should return status code 200 and the access token', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultEducator.username, 'password': defaultEducator.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})