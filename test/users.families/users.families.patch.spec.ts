import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { Family } from '../../src/account-service/model/family'

describe('Routes: users.families', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default institution'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another institutions'

    const defaultChild: Child = new Child
    defaultChild.username = 'default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 14

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'Default family'
    defaultFamily.password = 'Default pass'

    const anotherFamily: Family = new Family()
    anotherFamily.username = 'another family'
    anotherFamily.password = 'another pass'


    const con = new AccountDb()

    before(async () => {
        try {
            await con.connect(0, 1000)

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await con.removeCollections()

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id

            defaultChild.institution = defaultInstitution
            anotherChild.institution = defaultInstitution
            defaultFamily.institution = defaultInstitution

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

            anotherFamily.institution = anotherInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(defaultChild)

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id
            anotherFamily.children = new Array<Child>(anotherChild)

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id


        } catch (err) {
            console.log('Failure on Before from users.families.patch test: ', err)
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

    describe('PATCH/users/families/', () => {

        context('when the admin update a family successfully', () => {
            it('families.post001: should return status code 200 and username, children and institution of the family updated', () => {

                defaultFamily.username = 'new cool username'
                defaultFamily.children = new Array<Child>(anotherChild)
                defaultFamily.institution = anotherInstitution

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'new cool username', children: [anotherChild.id], institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id', defaultFamily.id)
                        expect(res.body).to.have.property('username', defaultFamily.username)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children[0]).to.have.property('id', anotherChild.id)
                        expect(res.body.children[0]).to.have.property('username', anotherChild.username)
                        expect(res.body.children[0]).to.have.property('gender', anotherChild.gender)
                        expect(res.body.children[0]).to.have.property('age', anotherChild.age)
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id', defaultInstitution.id)
                        expect(res.body.children[0].institution).to.have.property('type', defaultInstitution.type)
                        expect(res.body.children[0].institution).to.have.property('name', defaultInstitution.name)
                        expect(res.body.children[0].institution).to.have.property('address', defaultInstitution.address)
                        expect(res.body.children[0].institution).to.have.property('latitude', defaultInstitution.latitude)
                        expect(res.body.children[0].institution).to.have.property('longitude', defaultInstitution.longitude)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id', anotherInstitution.id)
                        expect(res.body.institution).to.have.property('type', anotherInstitution.type)
                        expect(res.body.institution).to.have.property('name', anotherInstitution.name)
                    })
            })
        })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveFamily(accessTokenAdmin, anotherFamily)
                } catch (err) {
                    console.log('Failure on users.families.patch test: ', err)
                }
            })
            it('families.patch002: should return status code 409 and info message about family is already registered', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: anotherFamily.username })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.FAMILY.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('families.patch003: should return status code 400 and message info message from invalid parameter, because children does not exist', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ children: [acc.NON_EXISTENT_ID] })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        const EXPECTED_RESPONSE = Strings.FAMILY.ERROR_400_CHILDREN_NOT_REGISTERED
                        EXPECTED_RESPONSE.description += ' '.concat(acc.NON_EXISTENT_ID)
                        expect(err.body).to.eql(EXPECTED_RESPONSE)
                        // se o ID enviado possuir caracteres numéricos e alfabéticos a resposta é correta!
                    })
            })

            it('families.patch004: should return status code 400 and info message from children id(ids) is invalid', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ children: [acc.INVALID_ID] })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.patch005: should return status code 400 and info message from invalid parameter, because institution_id is invalid', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ institution_id: acc.INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

            it('families.patch006: should return status code 400 and info message from invalid parameter, because institution was not registered', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        }) // validation error occurs

        context('when the user does not have permission to update families', () => {

            it('families.patch007: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch008: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch009: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch010: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch011: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.patch012: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
