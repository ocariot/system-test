import request from 'supertest'
import { expect } from 'chai'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Institution } from '../../../src/account-service/model/institution'
import { Child } from '../../../src/account-service/model/child'
import { ChildMock} from '../../mocks/account-service/child.mock'
import { Educator } from '../../../src/account-service/model/educator'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'
import { Family } from '../../../src/account-service/model/family'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { Application } from '../../../src/account-service/model/application'
import { ApplicationMock } from '../../mocks/account-service/application.mock'


describe('Routes: users', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    let admin_ID: any

    let accessTokenAdmin: string
    let accessTokenDefaultChild: string
    let accessTokenDefaultEducator: string
    let accessTokenDefaultHealthProfessional: string
    let accessTokenDefaultFamily: string
    let accessTokenDefaultApplication: string

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

    const newPassword: string = 'newcoolpassword'

    before(async () => {
        try {
            await accountDB.connect()
            await accountDB.removeCollections()

            accessTokenAdmin = await acc.getAdminToken()
            admin_ID = await acc.getAdminID()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = resultInstitution
            defaultEducator.institution = resultInstitution
            defaultHealthProfessional.institution = resultInstitution
            defaultFamily.institution = resultInstitution
            defaultApplication.institution = resultInstitution

        } catch (err) {
            console.log('Failure on Before from users.put test: ', err)
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

    describe('PUT /:user_id/password', () => {

        context('when update the user password successfully', () => {

            describe('when the administrator successfully updates the user password', () => {

                before(async () => {
                    try {

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

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put001: should return status code 204 and no content for himself', async () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

                it('users.put002: should return status code 204 and no content for child user', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

                it('users.put003: should return status code 204 and no content for educator user', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

                it('users.put004: should return status code 204 and no content for health professional user', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

                it('users.put005: should return status code 204 and no content for family user', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

                it('users.put006: should return status code 204 and no content for application user', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })

            }) // update password successfully

            describe('when the educator successfully updates the user password', () => {

                before(async () => {
                    try {
                        const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
                        defaultEducator.id = resultEducator.id

                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put007: should return status code 204 and no content for himself', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            }) // Educator update password successfully

            describe('when the health professional successfully updates the user password', () => {

                before(async () => {
                    try {
                        const resultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
                        defaultHealthProfessional.id = resultHealthProfessional.id

                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put008: should return status code 204 and no content for himself', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            }) // Health professional update password successfully

            describe('when the family successfully updates the user password', () => {

                before(async () => {
                    try {
                        const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
                        defaultChild.id = resultChild.id

                        defaultFamily.children = [resultChild]
                        const resultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
                        defaultFamily.id = resultFamily.id
                        defaultFamily.children = resultFamily.children

                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put009: should return status code 204 and no content for herself', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            }) // Health professional update password successfully
        })

        describe('when a validation error occurs', () => {

            before(async () => {
                try {

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

                    accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                    accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                    accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                    accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                    accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                } catch (err) {
                    console.log('Failure in users.put test: ', err)
                }
            })

            after(async () => {
                try {
                    await accountDB.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            context('the user old password does not match', () => {

                const NON_EXISTENT_PASSWORD = 'non_existent_password'

                it('users.put010: should return status code 400 and info message from old admin password does not match', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.put011: should return status code 400 and info message from old child password does not match', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.put012: should return status code 400 and info message from old educator password does not match', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.put013: should return status code 400 and info message from old health professional password does not match', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.put014: should return status code 400 and info message from old family password does not match', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.put015: should return status code 400 and info message from old application password does not match', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

            }) // old password does not match

            context('when the old password does not provided', () => {

                it('users.put016: should return status code 400 and info message from old admin password does not provided', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put017: should return status code 400 and info message from old child password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put018: should return status code 400 and info message from old educator password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put019: should return status code 400 and info message from old health professional password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put020: should return status code 400 and info message from old family password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put021: should return status code 400 and info message from old application password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

            }) // old password does not provided

            context('the new password does not provided', () => {

                it('users.put022: should return status code 400 and info message from new admin password does not provided', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put023: should return status code 400 and info message from new child password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put024: should return status code 400 and info message from new educator password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put025: should return status code 400 and info message from new health professional password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put026: should return status code 400 and info message from new family password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.put027: should return status code 400 and info message from new application password does not provided', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

            }) // new password does not provided

            describe('when user_id is invalid', () => {
                it('users.put028: should return status code 400 and info message from invalid id', () => {

                    const INVALID_ID = '123'

                    return request(URI)
                        .put(`/users/${INVALID_ID}/password`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })

        }) // validation error occurs     

        context('when update the user password without authorization', () => {

            before(async () => {
                try {

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

                    accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                    accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                    accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                    accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                    accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                } catch (err) {
                    console.log('Failure in users.put test: ', err)
                }
            })

            after(async () => {
                try {
                    await accountDB.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.put029: should return status code 401 and info message about unauthorized for update admin user', () => {

                return request(URI)
                    .put(`/users/${admin_ID}/password`)
                    .send({ old_password: 'admin123', new_password: 'admin123' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.put030: should return status code 401 and info message about unauthorized for update child user', () => {

                return request(URI)
                    .put(`/users/${defaultChild.id}/password`)
                    .send({ old_password: defaultChild.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.put031: should return status code 401 and info message about unauthorized for update educator user', () => {

                return request(URI)
                    .put(`/users/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.put032: should return status code 401 and info message about unauthorized for update health professional user', () => {

                return request(URI)
                    .put(`/users/${defaultHealthProfessional.id}/password`)
                    .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.put033: should return status code 401 and info message about unauthorized for update family user', () => {

                return request(URI)
                    .put(`/users/${defaultFamily.id}/password`)
                    .send({ old_password: defaultFamily.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.put034: should return status code 401 and info message about unauthorized for update application user', () => {

                return request(URI)
                    .put(`/users/${defaultApplication.id}/password`)
                    .send({ old_password: defaultApplication.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

        }) // without authorization        

        describe('when the user does not have permission', () => {

            context('child update user password', () => {
                const anotherChild: Child = new ChildMock()

                before(async () => {
                    try {
                        anotherChild.institution = defaultInstitution
                        const resultChildMock = await acc.saveChild(accessTokenAdmin, anotherChild)
                        anotherChild.id = resultChildMock.id

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

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put035: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put036: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put037: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put038: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put039: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put040: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put041: should return status code 403 and info message from insufficient permissions for update another child password', () => {

                    return request(URI)
                        .put(`/users/${anotherChild.id}/password`)
                        .send({ old_password: anotherChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // child update password

            context('educator update user password', () => {
                const anotherEducator: Educator = new EducatorMock()
                before(async () => {
                    try {
                        anotherEducator.institution = defaultInstitution
                        const resultAnotherEducatorMock = await acc.saveEducator(accessTokenAdmin, anotherEducator)
                        anotherEducator.id = resultAnotherEducatorMock.id

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

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put042: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put043: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put044: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put045: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put046: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put047: should return status code 403 and info message from insufficient permissions for update another educator password', () => {

                    return request(URI)
                        .put(`/users/${anotherEducator.id}/password`)
                        .send({ old_password: anotherEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // educator update password          

            context('health professional update user password', () => {
                const anotherHealthProfessional: HealthProfessional = new HealthProfessionalMock()
                before(async () => {
                    try {
                        anotherHealthProfessional.institution = defaultInstitution
                        const resultAnotherHealthProfessionalMock = await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
                        anotherHealthProfessional.id = resultAnotherHealthProfessionalMock.id

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

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put048: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put049: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put050: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put051: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put052: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put053: should return status code 403 and info message from insufficient permissions for update another health professional password', () => {

                    return request(URI)
                        .put(`/users/${anotherHealthProfessional.id}/password`)
                        .send({ old_password: anotherHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // health professional update password                

            context('family update user password', () => {
                const anotherFamily: Family = new FamilyMock()

                before(async () => {
                    try {
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

                        anotherFamily.institution = defaultInstitution
                        anotherFamily.children = [resultChild]
                        const resultAnotherFamilyMock = await acc.saveFamily(accessTokenAdmin, anotherFamily)
                        anotherFamily.id = resultAnotherFamilyMock.id
                        anotherFamily.children = resultAnotherFamilyMock.children

                        const resultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
                        defaultApplication.id = resultApplication.id

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put054: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put055: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put056: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put057: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put058: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .put(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put059: should return status code 403 and info message from insufficient permissions for update another family password', () => {

                    return request(URI)
                        .put(`/users/${anotherFamily.id}/password`)
                        .send({ old_password: anotherFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // family update password  

            context('application update user password', () => {
                const anotherApplication: Application = new ApplicationMock()
                before(async () => {
                    try {
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

                        anotherApplication.institution = defaultInstitution
                        const resultAnotherApplicationMock = await acc.saveApplication(accessTokenAdmin, anotherApplication)
                        anotherApplication.id = resultAnotherApplicationMock.id

                        accessTokenDefaultChild = await acc.auth('default child', 'default pass')
                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.put test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.put060: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .put(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put061: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .put(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put062: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .put(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put063: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .put(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put064: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .put(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.put066: should return status code 403 and info message from insufficient permissions for update another application password', () => {

                    return request(URI)
                        .put(`/users/${anotherApplication.id}/password`)
                        .send({ old_password: anotherApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // application update password         

        }) // user does not have permission  
    })
})