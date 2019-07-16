import request from 'supertest'
import { expect } from 'chai'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { InstitutionMock } from '../mocks/account-service/institution.mock'
import { HealthProfessional } from '../../src/account-service/model/health.professional'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'default health professional'
    defaultHealthProfessional.password = 'default pass'

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })    

    describe('POST /auth', () => {

        context('Health Professional authenticated successfull', () => {
            before(async () => {
                try {
                    await con.connect(0, 1000)

                    const token_admin: string = await acc.auth(
                        process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
                        process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')

                    const resultInstitution = await acc.saveInstitution(token_admin, new InstitutionMock())
                    defaultHealthProfessional.institution = resultInstitution

                    await acc.saveHealthProfessional(token_admin, defaultHealthProfessional)

                } catch (err) {
                    console.log('Failure in test', err)
                }
            })
            it('should return status code 200 and the access token', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultHealthProfessional.username, 'password': defaultHealthProfessional.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})