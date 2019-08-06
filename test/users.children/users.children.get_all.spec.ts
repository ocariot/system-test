import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { Child } from '../../src/account-service/model/child'
import { Strings } from '../utils/string.error.message'

describe('Routes: users.children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

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

            const result = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = result.id

            anotherChild.institution = defaultInstitution
            defaultChild.institution = defaultInstitution

            await acc.saveChild(accessTokenAdmin, anotherChild)
            await acc.saveChild(accessTokenAdmin, defaultChild)

        } catch (err) {
            console.log('Failure on Before from users.children.get_all test: ', err)
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

    describe('GET All /users/children', () => {

        context('when get all children in database successfully', () => {

            it('children.get_all001: should return status code 200 and a list of children', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1].institution).to.have.property('id')
                        expect(res.body[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1]).to.have.property('gender')
                    })
            })

            it('children.get_all002: should return status code 200 and a list with only ID and username of children', () => {

                const field = 'username'

                return request(URI)
                    .get(`/users/children?fields=${field}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.not.have.property('institution')
                        expect(res.body[0]).to.not.have.property('gender')
                        expect(res.body[0]).to.not.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.not.have.property('institution')
                        expect(res.body[1]).to.not.have.property('gender')
                        expect(res.body[1]).to.not.have.property('age')
                    })
            })

            it('children.get_all003: should return status code 200 and a list with only ID, institution and username of children', () => {

                const fieldOne = 'username'
                const fieldTwo = 'institution'

                return request(URI)
                    .get(`/users/children?fields=${fieldOne}%2C${fieldTwo}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.not.have.property('gender')
                        expect(res.body[0]).to.not.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.not.have.property('gender')
                        expect(res.body[1]).to.not.have.property('age')
                    })
            })

            it('children.get_all004: should return status code 200 and a list of children in ascending order by username', () => {

                const sort = 'username'

                return request(URI)
                    .get(`/users/children?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0].username).to.eql(anotherChild.username)
                        expect(res.body[0].institution).to.eql(anotherChild.institution)
                        expect(res.body[0].gender).to.eql(anotherChild.gender)
                        expect(res.body[0].age).to.eql(anotherChild.age)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1].username).to.eql(defaultChild.username)
                        expect(res.body[1].institution).to.eql(defaultChild.institution)
                        expect(res.body[1].gender).to.eql(defaultChild.gender)
                        expect(res.body[1].age).to.eql(defaultChild.age)
                    })
            })

            it('children.get_all005: should return status code 200 and a list of children in descending order by age', () => {

                const sort = 'age'

                return request(URI)
                    .get(`/users/children?sort=-${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].institution).to.eql(defaultChild.institution)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1].username).to.eql(anotherChild.username)
                        expect(res.body[1].institution).to.eql(anotherChild.institution)
                        expect(res.body[1].gender).to.eql(anotherChild.gender)
                        expect(res.body[1].age).to.eql(anotherChild.age)
                    })
            })

            it('children.get_all006: should return status code 200 and a list with only two most recent children registered in database', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/users/children?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('age')
                    })
            })

        }) // get all children in database successfull

        describe('when the user does not have permission to get all children in database', () => {

            it('children.get_all007: should return status code 403 and info message from insufficient permissions for user child', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all008: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all009: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all010: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all011: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.get_all012: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get all children in database after deleting all of them', () => {
            before(async () => {
                try {
                    await accountDB.deleteAllChildren()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('children.get_all013: should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
})
