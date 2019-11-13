import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { Family } from '../../../src/account-service/model/family'

describe('Routes: families', () => {

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

    let defaultFamilyToken: string

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token
            accessTokenEducator = tokens.educator.access_token
            accessTokenHealthProfessional = tokens.health_professional.access_token
            accessTokenFamily = tokens.family.access_token
            accessTokenApplication = tokens.application.access_token

            await accountDB.removeCollections()

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

            if (defaultFamily.username && defaultFamily.password){
                defaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            const resultGetDefaultFamily = await acc.getFamilyById(accessTokenAdmin, defaultFamily.id)
            defaultFamily.last_login = resultGetDefaultFamily.last_login

        } catch (err) {
            console.log('Failure on Before from families.patch test: ', err)
        }
    })

    after(async () => {
        try {
            await accountDB.removeCollections()
            await accountDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('PATCH /families/:family_id', () => {

        context('when the admin update a family successfully', () => {

            it('families.patch001: should return status code 200 and username, children and institution of the family updated for admin user', () => {

                defaultFamily.username = 'new cool username'
                defaultFamily.children = new Array<Child>(anotherChild)
                defaultFamily.institution = anotherInstitution

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'new cool username', children: [anotherChild.id], institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(anotherInstitution.id)
                        expect(res.body.children[0].id).to.eql(anotherChild.id)
                        expect(res.body.children[0].username).to.eql(anotherChild.username)
                        expect(res.body.children[0].gender).to.eql(anotherChild.gender)
                        expect(res.body.children[0].age).to.eql(anotherChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.last_login).to.eql(defaultFamily.last_login)
                    })
            })

            it('families.patch002: should return status code 200 and username, children and institution of the family updated by herself', () => {

                defaultFamily.username = 'anothercoolusername'
                defaultFamily.children = new Array<Child>(defaultChild)
                defaultFamily.institution = defaultInstitution

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'anothercoolusername', children: [defaultChild.id], institution_id: defaultInstitution.id })
                    .set('Authorization', 'Bearer '.concat(defaultFamilyToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.children[0].id).to.eql(defaultChild.id)
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.children[0].institution_id).to.eql(defaultInstitution.id)
                        expect(res.body.last_login).to.eql(defaultFamily.last_login)
                    })
            })

        })

        describe('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await acc.saveFamily(accessTokenAdmin, anotherFamily)
                } catch (err) {
                    console.log('Failure on families.patch test: ', err)
                }
            })
            it('families.patch003: should return status code 409 and info message about family is already registered', () => {

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: anotherFamily.username })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_409_DUPLICATE)
                    })
            })
        })

        describe('when a validation error occurs', () => {

            it('families.patch004: should return status code 400 and message info message from invalid parameter, because children does not exist', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the child

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ children: [NON_EXISTENT_ID] })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        const EXPECTED_RESPONSE = ApiGatewayException.FAMILY.ERROR_400_CHILDREN_NOT_REGISTERED
                        EXPECTED_RESPONSE.description += ' '.concat(acc.NON_EXISTENT_ID)
                        expect(err.body).to.eql(EXPECTED_RESPONSE)
                    })
            })

            it('families.patch005: should return status code 400 and info message from children id(ids) is invalid', () => {
                const INVALID_ID = '123' // invalid id of the child

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ children: [INVALID_ID] })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('One or more request fields are invalid...')
                        expect(err.body.description).to.eql(`The following IDs from children attribute are not in valid format: ${INVALID_ID}`)
                    })
            })

            it('families.patch006: should return status code 400 and info message from invalid parameter, because institution_id is invalid', () => {
                const INVALID_ID = '123' // invalid id of the institution

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ institution_id: INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                    })
            })

            it('families.patch007: should return status code 400 and info message from invalid parameter, because institution was not registered', () => {
                const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the institution

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ institution_id: NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })

            it('families.patch008: should return status code 400 and message from invalid parameter, because username is null', () => {
                const NULL_USERNAME = null // invalid username of the family

                return request(URI)
                .patch(`/families/${defaultFamily.id}`)
                .send({ username: NULL_USERNAME })
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(err => {
                    expect(err.body).to.eql(ApiGatewayException.FAMILY.ERROR_400_INVALID_USERNAME)
                })
            })

            it('families.patch009: should return status code 400 and message from invalid parameter, because children is null', () => {
                const NULL_CHILDREN = null // invalid id of the children

                return request(URI)
                .patch(`/families/${defaultFamily.id}`)
                .send({ children: NULL_CHILDREN })
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(err => {
                    expect(err.body.message).to.eql('One or more request fields are invalid...')
                    expect(err.body.description).to.eql(`The following IDs from children attribute are not in valid format: ${NULL_CHILDREN}`)
                })
            })

            it('families.patch010: should return status code 400 and message from invalid parameter, because istitution is null', () => {
                const NULL_INSTITUTION = null // invalid id of the institution

                return request(URI)
                .patch(`/families/${defaultFamily.id}`)
                .send({ institution_id: NULL_INSTITUTION })
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(err => {
                    expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_ID_IS_INVALID)
                })
            })
        }) // validation error occurs

        context('when the user does not have permission to update families', () => {

            it('families.patch011: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch012: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch013: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch014: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.patch015: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.patch016: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .patch(`/families/${defaultFamily.id}`)
                    .send({ username: 'updated name' })
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })
})
