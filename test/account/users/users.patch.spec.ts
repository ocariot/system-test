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
            console.log('Failure on Before from users.patch test: ', err)
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

    describe('PATCH /:user_id/password', () => {

        context('when the administrator successfully updates the user password', () => {
            
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
                    console.log('Failure in users.patch test: ', err)
                }
            })
            after(async () => {
                try {
                    await accountDB.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.patch001: should return status code 204 and no content for himself', async () => {

                return request(URI)
                    .patch(`/${admin_ID}/password`)
                    .send({ old_password: 'admin123', new_password: 'admin123' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.patch002: should return status code 204 and no content for child user', () => {

                return request(URI)
                    .patch(`/${defaultChild.id}/password`)
                    .send({ old_password: defaultChild.password, new_password: newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.patch003: should return status code 204 and no content for educator user', () => {

                return request(URI)
                    .patch(`/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.patch004: should return status code 204 and no content for health professional user', () => {

                return request(URI)
                    .patch(`/${defaultHealthProfessional.id}/password`)
                    .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.patch005: should return status code 204 and no content for family user', () => {

                return request(URI)
                    .patch(`/${defaultFamily.id}/password`)
                    .send({ old_password: defaultFamily.password, new_password: newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.patch006: should return status code 204 and no content for application user', () => {

                return request(URI)
                    .patch(`/${defaultApplication.id}/password`)
                    .send({ old_password: defaultApplication.password, new_password: newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

        }) // update password successfully

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
                    console.log('Failure in users.patch test: ', err)
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

                it('users.patch007: should return status code 400 and info message from old admin password does not match', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch008: should return status code 400 and info message from old child password does not match', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch009: should return status code 400 and info message from old educator password does not match', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch010: should return status code 400 and info message from old health professional password does not match', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch011: should return status code 400 and info message from old family password does not match', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch012: should return status code 400 and info message from old application password does not match', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

            }) // old password does not match

            context('when the old password does not provided', () => {

                it('users.patch013: should return status code 400 and info message from old admin password does not provided', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch014: should return status code 400 and info message from old child password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch015: should return status code 400 and info message from old educator password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch016: should return status code 400 and info message from old health professional password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch017: should return status code 400 and info message from old family password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch018: should return status code 400 and info message from old application password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
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

                it('users.patch019: should return status code 400 and info message from new admin password does not provided', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch020: should return status code 400 and info message from new child password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch021: should return status code 400 and info message from new educator password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch022: should return status code 400 and info message from new health professional password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch023: should return status code 400 and info message from new family password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch024: should return status code 400 and info message from new application password does not provided', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
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
                it('users.patch025: should return status code 400 and info message from invalid id', () => {

                    return request(URI)
                        .patch(`/${acc.INVALID_ID}/password`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
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
                    console.log('Failure in users.patch test: ', err)
                }
            })

            after(async () => {
                try {
                    await accountDB.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.patch026: should return status code 401 and info message about unauthorized for update admin user', () => {

                return request(URI)
                    .patch(`/${admin_ID}/password`)
                    .send({ old_password: 'admin123', new_password: 'admin123' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch027: should return status code 401 and info message about unauthorized for update child user', () => {

                return request(URI)
                    .patch(`/${defaultChild.id}/password`)
                    .send({ old_password: defaultChild.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch028: should return status code 401 and info message about unauthorized for update educator user', () => {

                return request(URI)
                    .patch(`/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch029: should return status code 401 and info message about unauthorized for update health professional user', () => {

                return request(URI)
                    .patch(`/${defaultHealthProfessional.id}/password`)
                    .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch030: should return status code 401 and info message about unauthorized for update family user', () => {

                return request(URI)
                    .patch(`/${defaultFamily.id}/password`)
                    .send({ old_password: defaultFamily.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch031: should return status code 401 and info message about unauthorized for update application user', () => {

                return request(URI)
                    .patch(`/${defaultApplication.id}/password`)
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
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch032: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch033: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch034: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch035: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch036: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch037: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch038: should return status code 403 and info message from insufficient permissions for update another child password', () => {

                    return request(URI)
                        .patch(`/${anotherChild.id}/password`)
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
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch039: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch040: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch041: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch042: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch043: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch044: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch045: should return status code 403 and info message from insufficient permissions for update another educator password', () => {

                    return request(URI)
                        .patch(`/${anotherEducator.id}/password`)
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
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch046: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch047: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch048: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch049: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch050: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch051: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch052: should return status code 403 and info message from insufficient permissions for update another health professional password', () => {

                    return request(URI)
                        .patch(`/${anotherHealthProfessional.id}/password`)
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
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch053: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch054: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch055: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch056: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch057: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch058: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch059: should return status code 403 and info message from insufficient permissions for update another family password', () => {

                    return request(URI)
                        .patch(`/${anotherFamily.id}/password`)
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
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch060: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch061: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/${defaultChild.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch062: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/${defaultEducator.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch063: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch064: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/${defaultFamily.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch065: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch066: should return status code 403 and info message from insufficient permissions for update another application password', () => {

                    return request(URI)
                        .patch(`/${anotherApplication.id}/password`)
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