import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Child } from '../../../src/account-service/model/child'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'

describe('Routes: users.children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let defaultChildToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'
    anotherInstitution.address = 'another address'
    anotherInstitution.latitude = -7.2100766
    anotherInstitution.longitude = -35.9175756

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 8

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
            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultAnotherInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultAnotherInstitution.id

            if (defaultChild.username && defaultChild.password) {
                defaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

        } catch (err) {
            console.log('Failure on Before from users.children.patch test: ', err)
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

    describe('PATCH /users/children/:child_id', () => {

        context('when the update was successful by admin user', () => {

            it('children.patch001: should return status code 200 and updated username, institution, age and gender of the child', () => {

                defaultChild.username = 'Default username updated'
                defaultChild.age = 13
                defaultChild.institution = anotherInstitution
                defaultChild.gender = 'female'

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send(
                        {
                            username: 'Default username updated',
                            gender: 'female',
                            age: 13,
                            institution_id: anotherInstitution.id
                        }
                    )
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(anotherInstitution.type)
                        expect(res.body.institution.name).to.eql(anotherInstitution.name)
                        expect(res.body.institution.address).to.eql(anotherInstitution.address)
                        expect(res.body.institution.latitude).to.eql(anotherInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(anotherInstitution.longitude)
                    })
            })
        })

        describe('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherChild.institution = defaultInstitution
                    await acc.saveChild(accessTokenAdmin, anotherChild)
                } catch (err) {
                    console.log('Failure on users.children.patch test: ', err)
                }
            })
            it('children.patch002: should return status code 409 and info message about child is already registered', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ username: 'another child' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('A registration with the same unique data already exists!')
                    })
            })
        })

        /* TESTES - RESTRIÇÕES NOS CAMPOS USERNAME ... (CRIAR COM ESPAÇO ?)
        context('when update the child username with spaces before and after the username', () => {
            it('should return status code ?', () => {

            })
        })*/

        context('when a validation error occurs', () => {

            it('children.patch003: should return status code 400 and message about invalid gender', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ gender: acc.INVALID_GENDER })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                // .then(err => {
                //     expect(...)
                // })
            })

            it('children.patch004: should return status code 400 and message about negative age', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: acc.NEGATIVE_AGE })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                // .then(err => {
                //     expect(...)
                // })
            })

            it('children.patch005: should return status code 400 and message for institution not found', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })

            it('children.patch006: should return status code 400 and info message from invalid id', () => {

                return request(URI)
                    .patch(`/users/children/${acc.INVALID_ID}`)
                    .send({ age: 15 })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })

        }) // validation error occurs

        describe('when the child is not found', () => {
            it('children.patch007: should return status code 404 and info message from child not found', () => {

                return request(URI)
                    .patch(`/users/children/${acc.NON_EXISTENT_ID}`)
                    .send({ age: 10 })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.CHILD.ERROR_404_CHILD_NOT_FOUND)
                    })
            })
        })

        context('when the user does not have permission to update the child', () => {

            it('children.patch008: should return status code 403 and info message from insufficient permissions for own child user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(defaultChildToken))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch009: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch010: should return status code 403 and info message from insufficient permissions for healh professional user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch011: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch012: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.patch013: should return status code 403 and info message from insufficient permissions for another child user', () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.patch014: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 1 })
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
