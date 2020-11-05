import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Child } from '../../../src/account-service/model/child'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { ChildMock } from '../../mocks/account-service/child.mock'

describe('Routes: children', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let childArr: Array<Child> = new Array<Child>()

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const anotherChild: Child = new ChildMock()

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

            const resultAnotherChild = await acc.saveChild(accessTokenAdmin, anotherChild)
            anotherChild.id = resultAnotherChild.id

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            childArr.push(resultChild)
            childArr.push(resultAnotherChild)

        } catch (err) {
            console.log('Failure on Before from children.get_all test: ', err)
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

    describe('GET All /children', () => {

        context('when get all children in database successfully', () => {

            it('children.get_all001: should return status code 200 and a list of children and information when the child has not yet logged in to the system for admin user', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childArr[i].id)
                            expect(res.body[i].username).to.eql(childArr[i].username)
                            expect(res.body[i].gender).to.eql(childArr[i].gender)
                            expect(res.body[i].age).to.eql(childArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                        }
                    })
            })

            it('children.get_all002: should return status code 200 and a child list with child information for the educator user', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childArr[i].id)
                            expect(res.body[i].username).to.eql(childArr[i].username)
                            expect(res.body[i].gender).to.eql(childArr[i].gender)
                            expect(res.body[i].age).to.eql(childArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })

            it('children.get_all003: should return status code 200 and a child list with child information for the health professional user', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childArr[i].id)
                            expect(res.body[i].username).to.eql(childArr[i].username)
                            expect(res.body[i].gender).to.eql(childArr[i].gender)
                            expect(res.body[i].age).to.eql(childArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })

            it('children.get_all004: should return status code 200 and a list of children in ascending order by username', () => {
                const sort = 'username' // parameter for sort the result of the query by order ascending
                const childrenSortedByUserNameArr = childArr.slice() // copy of the array of children that will be ordered

                // Sorted childArr in ascending order by username ...
                childrenSortedByUserNameArr.sort((a, b) => {
                    return a.username!.toLowerCase()! < b.username!.toLowerCase() ? -1 : 1
                })

                return request(URI)
                    .get(`/children?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(childrenSortedByUserNameArr[i].username)
                            expect(res.body[i].id).to.eql(childrenSortedByUserNameArr[i].id)
                            expect(res.body[i].gender).to.eql(childrenSortedByUserNameArr[i].gender)
                            expect(res.body[i].age).to.eql(childrenSortedByUserNameArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })

            it('children.get_all005: should return status code 200 and a list of children in ascending order by age', () => {
                const sort = 'age' // parameter for sort the result of the query by order ascending
                const childSortedAgeArr = [...childArr] // copy of the array of children that will be ordered

                // Sorted childArr in ascending order by age ...
                childSortedAgeArr.sort((a, b) => { 
                    if (a.age! < b.age!) return -1
                    else if (a.age! > b.age!) return 1
                    else return a.id! < b.id! ? -1 : 1
                })

                return request(URI)
                    .get(`/children?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childSortedAgeArr[i].id)
                            expect(res.body[i].username).to.eql(childSortedAgeArr[i].username)
                            expect(res.body[i].gender).to.eql(childSortedAgeArr[i].gender)
                            expect(res.body[i].age).to.eql(childSortedAgeArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })

            it('children.get_all006: should return status code 200 and a list with only two most recent children registered in database', async () => {
                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/children?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childArr[i].id)
                            expect(res.body[i].username).to.eql(childArr[i].username)
                            expect(res.body[i].gender).to.eql(childArr[i].gender)
                            expect(res.body[i].age).to.eql(childArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })

        }) // get all children in database successfull

        describe('When the child already first logged in to the system', () => {

            before(async () => {
                try {
                    await acc.auth(defaultChild.username!, defaultChild.password!)
                    await acc.auth(anotherChild.username!, anotherChild.password!)

                    const resultGetChild = await acc.getChildById(accessTokenAdmin, defaultChild.id)
                    defaultChild.last_login = resultGetChild.last_login

                    const resultGetAnotherChild = await acc.getChildById(accessTokenAdmin, anotherChild.id)
                    anotherChild.last_login = resultGetAnotherChild.last_login

                } catch (err) {
                    console.log('Failure on Before from field  verification: ', err)
                }
            })

            it('children.get_all007: should return status code 200 and a list of children and information when the child has already first logged in to the system for admin user', async () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(childArr[i].id)
                            expect(res.body[i].username).to.eql(childArr[i].username)
                            expect(res.body[i].gender).to.eql(childArr[i].gender)
                            expect(res.body[i].age).to.eql(childArr[i].age)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            if (childArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(childArr[i].last_login)
                        }
                    })
            })
        })

        describe('when the user does not have permission to get all children in database', () => {

            it('children.get_all008: should return status code 403 and info message from insufficient permissions for user child', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all009: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('children.get_all010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        describe('when not informed the acess token', () => {
            it('children.get_all011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/children')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
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
            it('children.get_all012: should return status code 200 and empty list ', () => {

                return request(URI)
                    .get('/children')
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
