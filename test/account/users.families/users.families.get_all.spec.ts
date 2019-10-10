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

    let familiesArr: Array<Family> = new Array<Family>()

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new Child
    defaultChild.username = 'default child'
    defaultChild.password = 'default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'Default family'
    defaultFamily.password = 'Default pass'

    const anotherFamily: Family = new Family()
    anotherFamily.username = 'another family'
    anotherFamily.password = 'another pass'

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

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution

            defaultFamily.institution = defaultInstitution

            anotherFamily.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            defaultFamily.children = new Array<Child>(defaultChild)
            anotherFamily.children = new Array<Child>(defaultChild)

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultAnotherFamily = await acc.saveFamily(accessTokenAdmin, anotherFamily)
            anotherFamily.id = resultAnotherFamily.id

            familiesArr.push(resultAnotherFamily)
            familiesArr.push(resultDefaultFamily)

        } catch (err) {
            console.log('Failure on Before from families.get_all test: ', err)
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

    describe('GET ALL/families/', () => {

        context('when get all families successfully', () => {

            it('families.get_all001: should return status code 200 and a list of families', () => {

                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(familiesArr[i].id)
                            expect(res.body[i].username).to.eql(familiesArr[i].username)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children).to.eql(familiesArr[i].children)
                            expect(res.body[i].children.length).to.eql(1)
                        }
                    })
            })

            it('families.get_all002: should return status code 200 and a list of families when they are first logged in to the system for admin user', async () => {
                await acc.auth(defaultFamily.username!, defaultFamily.password!)
                await acc.auth(anotherFamily.username!, anotherFamily.password!)

                return request(URI)
                    .get('/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(familiesArr[i].id)
                            expect(res.body[i].username).to.eql(familiesArr[i].username)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children).to.eql(familiesArr[i].children)
                            expect(res.body[i].children.length).to.eql(1)
                            if (familiesArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(familiesArr[i].last_login)
                        }
                    })
            })

            it('families.get_all003: should return status code 200 and a list of families in descending order by username', () => {
                const sort = 'username' // parameter for sort the result of the query by order descending
                const familiesSortedByUserNameArr = familiesArr.slice() // copy of the array of families that will be ordered

                // Sorted familiesArr in descending order by username ...
                familiesSortedByUserNameArr.sort((a, b) => {
                    return a.username!.toLowerCase()! > b.username!.toLowerCase() ? -1 : 1
                })

                return request(URI)
                    .get(`/families?sort=-${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {

                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(familiesSortedByUserNameArr[i].username)
                            expect(res.body[i].id).to.eql(familiesSortedByUserNameArr[i].id)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children).to.eql(familiesSortedByUserNameArr[i].children)
                            expect(res.body[i].children.length).to.eql(1)
                            if (familiesSortedByUserNameArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(familiesSortedByUserNameArr[i].last_login)
                        }
                    })
            })

            it('families.get_all004: should return status code 200 and a list with only the most recent family registered', () => {

                const page = 1
                const limit = 1

                return request(URI)
                    .get(`/families?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(familiesArr[i].id)
                            expect(res.body[i].username).to.eql(familiesArr[i].username)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children).to.eql(familiesArr[i].children)
                            expect(res.body[i].children.length).to.eql(1)
                            if (familiesArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(familiesArr[i].last_login)
                        }
                    })
            })

        }) // all families successfully


        context('when the user does not have permission to get all families', () => {

            it('families.get_all005: should return status code 403 and info message from insufficient permissions for child user', () => {
                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_all006: should return status code 403 and info message from insufficient permissions for educator user', () => {
                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_all007: should return status code 403 and info message from insufficient permissions for health professional user', () => {
                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_all008: should return status code 403 and info message from insufficient permissions for family user', () => {
                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('families.get_all009: should return status code 403 and info message from insufficient permissions for application user', () => {
                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission 

        describe('when not informed the acess token', () => {
            it('families.get_all010: should return the status code 401 and the authentication failure informational message', () => {

                return request(URI)
                    .get('/families')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        describe('when get all families after deleting all of them', () => {
            before(async () => {
                try {
                    await accountDB.deleteAllFamilies()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('families.get_all011: should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/families')
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
