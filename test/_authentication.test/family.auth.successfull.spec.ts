import request from 'supertest'
import { expect } from 'chai'
import { AccountDb } from '../../src/account-service/database/account.db'
import { acc } from '../utils/account.utils'
import { InstitutionMock } from '../mocks/account-service/institution.mock'
import { Family } from '../../src/account-service/model/family'
import { Child } from '../../src/account-service/model/child'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    const defaultChild: Child = new Child()
    defaultChild.username = 'default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })    

    describe('POST /auth', () => {

        context('Family authenticated successfull', () => {
            before(async () => {
                try {
                    await con.connect(0, 1000)

                    const token_admin: string = await acc.auth(
                        process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
                        process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')

                    const resultInstitution = await acc.saveInstitution(token_admin, new InstitutionMock())
                    defaultFamily.institution = resultInstitution
                    defaultChild.institution = resultInstitution

                    const resultChild = await acc.saveChild(token_admin, defaultChild)
                    defaultChild.id = resultChild.id
                    defaultFamily.children = [resultChild]

                    await acc.saveFamily(token_admin, defaultFamily)

                } catch (err) {
                    console.log('Failure in test', err)
                }
            })
            it('should return status code 200 and the access token', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultFamily.username, 'password': defaultFamily.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })
    })
})