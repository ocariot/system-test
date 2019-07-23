import request from 'supertest'
import { expect } from 'chai'
import { Strings } from '../utils/string.error.message'
import { acc } from '../utils/account.utils'
import { Institution } from '../../src/account-service/model/institution'
import { Child } from '../../src/account-service/model/child'
import { Educator } from '../../src/account-service/model/educator'
import { HealthProfessional } from '../../src/account-service/model/health.professional'
import { Family } from '../../src/account-service/model/family'
import { Application } from '../../src/account-service/model/application'
import { AccountDb } from '../../src/account-service/database/account.db'

describe('Routes: Auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    const con = new AccountDb()

    let accessTokenAdmin: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new Child()
    defaultChild.username = 'default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'default educator'
    defaultEducator.password = 'default pass'

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'default health professional'
    defaultHealthProfessional.password = 'default pass'

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'default family'
    defaultFamily.password = 'default pass'

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'default application'
    defaultApplication.password = 'default pass'
    defaultApplication.application_name = 'default application name'

    before(async () => {
        try {
            await con.connect(0, 1000)
            await con.removeCollections()
                
            accessTokenAdmin = await acc.getAdminToken()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = resultInstitution
            defaultEducator.institution = resultInstitution
            defaultHealthProfessional.institution = resultInstitution
            defaultFamily.institution = resultInstitution
            defaultApplication.institution = resultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            const resultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultHealthProfessional.id

            defaultFamily.children = [resultChild]
            const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultFamily.id
            defaultFamily.children = resultFamily.children

            const resultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultApplication.id

        } catch (err) {
            console.log('Failure on Before from auth.post test', err)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
            await con.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /auth', () => {

        context('when the authentication was successful', () => {

            it('auth.post001: should return the access token to admin', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'admin', 'password': 'admin123' })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

            it('auth.post002: should return the access token to child', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultChild.username, 'password': defaultChild.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

            it('auth.post003: should return the access token to educator', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultEducator.username, 'password': defaultEducator.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

            it('auth.post004: should return the access token to health professional', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultHealthProfessional.username, 'password': defaultHealthProfessional.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

            it('auth.post005: should return the access token to family', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultFamily.username, 'password': defaultFamily.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

            it('auth.post006: should return the access token to application', async () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': defaultApplication.username, 'password': defaultApplication.password })
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })

        }) // authentication was successful

        context('when the user was not authorized ', () => {

            it('auth.post007: should return status code 401 and info message about unauthorized, because username does not exist', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': 'non-exist username', 'password': 'admin123' })
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401)
                    })
            })

            it('auth.post008: should return status code 401 and info message about unauthorized, because password does not exist', () => {

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

        context('when a validation error occurs', () => {

            it('auth.post009: should return status code 400 and info message about validation errors, because the username was not informed', () => {

                return request(URI)
                    .post('/auth')
                    .set('Content-Type', 'application/json')
                    .send({ 'username': '', 'password': 'non-existent password' })
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_400_USERNAME)
                    })
            })

            it('auth.post010: should return status code 400 and info message about validation errors, because the password was not informed', () => {

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



