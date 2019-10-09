import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Child } from '../../../src/account-service/model/child'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'

describe('Routes: healthprofessionals', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let healthProfessionalsArr: Array<HealthProfessional> = new Array<HealthProfessional>()

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'Default healthprofessional'
    defaultHealthProfessional.password = 'Default pass'

    const anotherHealthProfessional: HealthProfessional = new HealthProfessional()
    anotherHealthProfessional.username = 'another healthprofessional'
    anotherHealthProfessional.password = 'another pass'

    const defaultChild: Child = new Child()
    defaultChild.username = 'Default child'
    defaultChild.password = 'Default pass'
    defaultChild.gender = 'male'
    defaultChild.age = 11

    let defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

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

            defaultHealthProfessional.institution = defaultInstitution
            anotherHealthProfessional.institution = defaultInstitution
            defaultChild.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultAnotherHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
            anotherHealthProfessional.id = resultAnotherHealthProfessional.id

            healthProfessionalsArr.push(resultAnotherHealthProfessional)
            healthProfessionalsArr.push(resultDefaultHealthProfessional)

        } catch (err) {
            console.log('Failure on Before from healthprofessionals.get_all test: ', err)
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

    describe('GET All /healthprofessionals', () => {

        context('when the admin get all health professionals in database successfully', () => {

            it('healthprofessionals.get_all001: should return status code 200 and a list of health professionals without children group data', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(healthProfessionalsArr[i].id)
                            expect(res.body[i].username).to.eql(healthProfessionalsArr[i].username)
                            expect(res.body[i].children_groups).to.eql(healthProfessionalsArr[i].children_groups)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children_groups.length).to.eql(0)
                        }
                    })
            })

            it('healthprofessionals.get_all002: should return status code 200 and a list of health professionals when they are first logged in to the system for admin user', async () => {
                await acc.auth(defaultHealthProfessional.username!, defaultHealthProfessional.password!)
                await acc.auth(anotherHealthProfessional.username!, anotherHealthProfessional.password!)

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(healthProfessionalsArr[i].id)
                            expect(res.body[i].username).to.eql(healthProfessionalsArr[i].username)
                            expect(res.body[i].children_groups).to.eql(healthProfessionalsArr[i].children_groups)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children_groups.length).to.eql(0)
                            if (healthProfessionalsArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(healthProfessionalsArr[i].last_login)
                        }
                    })
            })

            it('healthprofessionals.get_all003: should return status code 200 and a list of health professionals in ascending order by username', () => {
                const sort = 'username' // parameter for sort the result of the query by order ascending
                const healthSortedByUserNameArr = healthProfessionalsArr.slice() // copy of the array of health professionals that will be ordered

                // Sorted healthProfessionals in ascending order by username ...
                healthSortedByUserNameArr.sort((a, b) => {
                    a.username!.toLocaleLowerCase
                    b.username!.toLocaleLowerCase
                    return a.username! < b.username! ? 1 : 0
                })

                return request(URI)
                    .get(`/healthprofessionals?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].username).to.eql(healthSortedByUserNameArr[i].username)
                            expect(res.body[i].id).to.eql(healthSortedByUserNameArr[i].id)
                            expect(res.body[i].children_groups).to.eql(healthSortedByUserNameArr[i].children_groups)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children_groups.length).to.eql(0)
                            if (healthSortedByUserNameArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(healthSortedByUserNameArr[i].last_login)
                        }
                    })
            })

            it('healthprofessionals.get_all004: should return status code 200 and a list with only two most recent health professionals registered in database', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/healthprofessionals?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(healthProfessionalsArr[i].id)
                            expect(res.body[i].username).to.eql(healthProfessionalsArr[i].username)
                            expect(res.body[i].children_groups).to.eql(healthProfessionalsArr[i].children_groups)
                            expect(res.body[i].institution_id).to.eql(defaultInstitution.id)
                            expect(res.body[i].children_groups.length).to.eql(0)
                            if (healthProfessionalsArr[i].last_login)
                                expect(res.body[i].last_login).to.eql(healthProfessionalsArr[i].last_login)
                        }
                    })
            })

            describe('when get all health professionals in database after deleting all of them', () => {
                before(async () => {
                    try {
                        await accountDB.deleteAllHealthProfessionals()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })
                it('healthprofessionals.get_all005: should return status code 200 and empty array ', () => {

                    return request(URI)
                        .get('/healthprofessionals')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.length).to.eql(0)
                        })
                })
            })

        }) // get all health professionals in database successfully

        context('when the user does not have permission to get all health professionals in database', () => {

            it('healthprofessionals.get_all006: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all007: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all008: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all009: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all010: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) //user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.get_all011: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/healthprofessionals')
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
