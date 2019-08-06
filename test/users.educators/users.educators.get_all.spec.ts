import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { Educator } from '../../src/account-service/model/educator'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'

describe('Routes: users.educators', () => {

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

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'Default educator'
    defaultEducator.password = 'Default pass'

    const anotherEducator: Educator = new Educator()
    anotherEducator.username = 'another educator'
    anotherEducator.password = 'another pass'

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
            await accountDB.connect(0, 1000)

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

            defaultEducator.institution = defaultInstitution
            anotherEducator.institution = defaultInstitution
            defaultChild.institution = defaultInstitution

            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultAnotherEducator = await acc.saveEducator(accessTokenAdmin, anotherEducator)
            anotherEducator.id = resultAnotherEducator.id

        } catch (err) {
            console.log('Failure on Before from users.educators.get_all test: ', err)
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

    describe('GET All /users/educators', () => {

        context('when the admin get all educators in database successfully', () => {

            it('educators.get_all001: should return status code 200 and a list of educators without children group data', () => {

                return request(URI)
                    .get('/users/educators')
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

            it('educators.get_all002: should return status code 200 and a list of educators in ascending order by username', () => {

                const sort = 'username'

                return request(URI)
                    .get(`/users/educators?sort=${sort}`)
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
                        expect(res.body[0].username).to.eql(anotherEducator.username)
                        expect(res.body[0].institution).to.eql(anotherEducator.institution)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].username).to.eql(defaultEducator.username)
                        expect(res.body[1].institution).to.eql(defaultEducator.institution)
                    })
            })

            it('educators.get_all003: should return status code 200 and a list with only two most recent educators registered in database', () => {

                const page = 1
                const limit = 2

                return request(URI)
                    .get(`/users/educators?page=${page}&limit=${limit}`)
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
                        expect(res.body[0].username).to.eql(anotherEducator.username)
                        expect(res.body[0].institution).to.eql(anotherEducator.institution)
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('children_groups')
                        expect(res.body[1].username).to.eql(defaultEducator.username)
                        expect(res.body[1].institution).to.eql(defaultEducator.institution)
                    })
            })

            describe('when get all educators in database after deleting all of them', () => {
                before(async () => {
                    try {
                        await accountDB.deleteAllEducators()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })
                it('educators.get_all004: should return status code 200 and empty array ', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body.length).to.eql(0)
                        })
                })
            })

        }) // get all educators in database successfully

        context('when the user does not have permission to get all educators in database', () => {

            it('educators.get_all005: should return status code 403 and info message from insufficient permissions for child user', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_all006: should return status code 403 and info message from insufficient permissions for educator user', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_all007: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_all008: should return status code 403 and info message from insufficient permissions for family user', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('educators.get_all009: should return status code 403 and info message from insufficient permissions for application user', () => {

                return request(URI)
                    .get('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) //user does not have permission

        describe('when not informed the acess token', () => {
            it('educators.get_all010: should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get('/users/educators')
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
