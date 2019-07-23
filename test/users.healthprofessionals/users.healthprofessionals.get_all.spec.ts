import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'
import { HealthProfessional } from '../../src/account-service/model/health.professional'

describe('Routes: users.healthprofessionals', () => {

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

        } catch (e) {
            console.log('Before Error', e)
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

    describe('GET All /users/healthprofessionals', () => {

        context('when the admin get all health professionals in database successfully', () => {

            it('healthprofessionals.get_all001: should return status code 200 and a list of health professionals without children group data', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.not.have.property('children_groups')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[0].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[0].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[0].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].institution.longitude).to.eql(defaultInstitution.longitude)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].institution).to.not.have.property('id')
                        expect(res.body[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            it('healthprofessionals.get_all002: should return status code 200 and a list of health professionals in ascending order by username', () => {

                const sort = 'username'

                return request(URI)
                    .get(`/users/healthprofessionals?sort=${sort}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[0].username).to.eql(anotherHealthProfessional.username)
                        expect(res.body[0].institution).to.eql(anotherHealthProfessional.institution)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].username).to.eql(defaultHealthProfessional.username)
                        expect(res.body[1].institution).to.eql(defaultHealthProfessional.institution)
                    })
            })

            it('healthprofessionals.get_all003: should return status code 200 and a list with only two most recent health professionals registered in database', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/users/healthprofessionals?page=${page}&limit=${limit}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[0].username).to.eql(anotherHealthProfessional.username)
                        expect(res.body[0].institution).to.eql(anotherHealthProfessional.institution)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].username).to.eql(defaultHealthProfessional.username)
                        expect(res.body[1].institution).to.eql(defaultHealthProfessional.institution)
                    })
            })

            describe('when get all health professionals in database after deleting all of them', () => {
                before(async () => {
                    try {
                        await con.deleteAllHealthProfessionals()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })
                it('healthprofessionals.get_all004: should return status code 200 and empty array ', () => {

                    return request(URI)
                        .get('/users/healthprofessionals')
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

            it('healthprofessionals.get_all005: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all006: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all007: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all008: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('healthprofessionals.get_all009: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/users/healthprofessionals')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) //user does not have permission

        describe('when not informed the acess token', () => {
            it('healthprofessionals.get_all010: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/users/healthprofessionals')
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
