import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Child } from '../../src/account-service/model/child'
import { Strings } from '../utils/string.error.message'
import { Educator } from '../../src/account-service/model/educator'
import { HealthProfessional } from '../../src/account-service/model/health.professional'
import { Family } from '../../src/account-service/model/family'
import { Application } from '../../src/account-service/model/application'

describe('Routes: users', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'
    let admin_ID: any

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let anotherChildToken: string
    let anotherEducatorToken: string
    let anotherHealthProfessionalToken: string
    let anotherFamilyToken: string
    let anotherApplicationToken: string

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

    const con = new AccountDb()

    const newPassword: string = 'newcoolpassword'

    before(async () => {
        try {
            await con.connect(0, 1000)
            await con.removeCollections()

            accessTokenAdmin = await acc.getAdminToken()
            admin_ID = await acc.getAdminID()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = resultInstitution
            defaultEducator.institution = resultInstitution
            defaultHealthProfessional.institution = resultInstitution
            defaultFamily.institution = resultInstitution
            defaultApplication.institution = resultInstitution

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

            accessTokenChild = await acc.auth('default child', 'default pass')
            accessTokenEducator = await acc.auth('default educator', 'default pass')
            accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
            accessTokenApplication = await acc.auth('default application', 'default pass')
            accessTokenFamily = await acc.auth('default family', 'default pass')

            const tokens = await acc.getAuths()

            anotherChildToken = tokens.child.access_token
            anotherEducatorToken = tokens.educator.access_token
            anotherHealthProfessionalToken = tokens.health_professional.access_token
            anotherFamilyToken = tokens.family.access_token
            anotherApplicationToken = tokens.application.access_token

        } catch (err) {
            console.log('Before Error', err)
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

    describe('PATCH /users/:user_id/password', () => {

        context('when the administrator successfully updates the user password', () => {

            after(async () => {
                try {
                    await con.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.patch001: should return status code 204 and no content for himself', async () => {

                return request(URI)
                    .patch(`/users/${admin_ID}/password`)
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
                    .patch(`/users/${defaultChild.id}/password`)
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
                    .patch(`/users/${defaultEducator.id}/password`)
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
                    .patch(`/users/${defaultHealthProfessional.id}/password`)
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
                    .patch(`/users/${defaultFamily.id}/password`)
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
                    .patch(`/users/${defaultApplication.id}/password`)
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

                    accessTokenChild = await acc.auth('default child', 'default pass')
                    accessTokenEducator = await acc.auth('default educator', 'default pass')
                    accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                    accessTokenApplication = await acc.auth('default application', 'default pass')
                    accessTokenFamily = await acc.auth('default family', 'default pass')

                } catch (err) {
                    console.log('Failure in users.patch test: ', err)
                }
            })

            after(async () => {
                try {
                    await con.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            context('the user old password does not match', () => {

                it('users.patch007: should return status code 400 and info message from old admin password does not match', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch008: should return status code 400 and info message from old child password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch009: should return status code 400 and info message from old educator password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch010: should return status code 400 and info message from old health professional password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch011: should return status code 400 and info message from old family password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('users.patch012: should return status code 400 and info message from old application password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

            }) // old password does not match

            context('when the old password does not provided', () => {

                it('users.patch013: should return status code 400 and info message from old admin password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch014: should return status code 400 and info message from old child password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch015: should return status code 400 and info message from old educator password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch016: should return status code 400 and info message from old health professional password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch017: should return status code 400 and info message from old family password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch018: should return status code 400 and info message from old application password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

            }) // old password does not provided


            context('the new password does not provided', () => {

                it('users.patch019: should return status code 400 and info message from new admin password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch020: should return status code 400 and info message from new child password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch021: should return status code 400 and info message from new educator password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch022: should return status code 400 and info message from new health professional password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch023: should return status code 400 and info message from new family password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('users.patch024: should return status code 400 and info message from new application password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultChild.password })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_NEW_PASSWORD_NOT_PROVIDED)
                        })
                })

            }) // new password does not provided

            describe('when user_id is invalid', () => {
                it('users.patch025: should return status code 400 and info message from invalid id', () => {

                    return request(URI)
                        .patch(`/users/${acc.INVALID_ID}/password`)
                        .send({})
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
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

                    accessTokenChild = await acc.auth('default child', 'default pass')
                    accessTokenEducator = await acc.auth('default educator', 'default pass')
                    accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                    accessTokenApplication = await acc.auth('default application', 'default pass')
                    accessTokenFamily = await acc.auth('default family', 'default pass')

                } catch (err) {
                    console.log('Failure in users.patch test: ', err)
                }
            })

            after(async () => {
                try {
                    await con.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.patch026: should return status code 401 and info message about unauthorized for admin user', () => {

                return request(URI)
                    .patch(`/users/${admin_ID}/password`)
                    .send({ old_password: 'admin123', new_password: 'admin123' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch027: should return status code 401 and info message about unauthorized for child user', () => {

                return request(URI)
                    .patch(`/users/${defaultChild.id}/password`)
                    .send({ old_password: defaultChild.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch028: should return status code 401 and info message about unauthorized for educator user', () => {

                return request(URI)
                    .patch(`/users/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch029: should return status code 401 and info message about unauthorized for health professional user', () => {

                return request(URI)
                    .patch(`/users/${defaultHealthProfessional.id}/password`)
                    .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch030: should return status code 401 and info message about unauthorized for family user', () => {

                return request(URI)
                    .patch(`/users/${defaultFamily.id}/password`)
                    .send({ old_password: defaultFamily.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.patch031: should return status code 401 and info message about unauthorized for application user', () => {

                return request(URI)
                    .patch(`/users/${defaultApplication.id}/password`)
                    .send({ old_password: defaultApplication.password, new_password: newPassword })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

        }) // without authorization        

        describe('when the user does not have permission', () => {
            
            context('child update user password', () => {
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
    
                        accessTokenChild = await acc.auth('default child', 'default pass')
                        accessTokenEducator = await acc.auth('default educator', 'default pass')
                        accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenApplication = await acc.auth('default application', 'default pass')
                        accessTokenFamily = await acc.auth('default family', 'default pass')
    
                    } catch (err) {
                        console.log('Failure in users.patch test: ', err)
                    }
                })    
                after(async () => {
                    try {
                        await con.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch032: should return status code 403 and info message from insufficient permissions for update admin password', () => {
                    
                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch033: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch034: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch035: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch036: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch037: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch038: should return status code 403 and info message from insufficient permissions for update another child password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultChild.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(anotherChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // child update password

            context('educator update user password', () => {
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
    
                        accessTokenChild = await acc.auth('default child', 'default pass')
                        accessTokenEducator = await acc.auth('default educator', 'default pass')
                        accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenApplication = await acc.auth('default application', 'default pass')
                        accessTokenFamily = await acc.auth('default family', 'default pass')
    
                    } catch (err) {
                        console.log('Failure in users.patch test: ', err)
                    }
                })    
                after(async () => {
                    try {
                        await con.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })
            
                it('users.patch039: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch040: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch041: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch042: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch043: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch044: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch045: should return status code 403 and info message from insufficient permissions for update another educator password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultEducator.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // educator update password          

            context('health professional update user password', () => {
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
    
                        accessTokenChild = await acc.auth('default child', 'default pass')
                        accessTokenEducator = await acc.auth('default educator', 'default pass')
                        accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenApplication = await acc.auth('default application', 'default pass')
                        accessTokenFamily = await acc.auth('default family', 'default pass')
    
                    } catch (err) {
                        console.log('Failure in users.patch test: ', err)
                    }
                })    
                after(async () => {
                    try {
                        await con.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch046: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch047: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch048: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch049: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch050: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch051: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch052: should return status code 403 and info message from insufficient permissions for update another health professional password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultHealthProfessional.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // health professional update password                

            context('family update user password', () => {
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
    
                        accessTokenChild = await acc.auth('default child', 'default pass')
                        accessTokenEducator = await acc.auth('default educator', 'default pass')
                        accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenApplication = await acc.auth('default application', 'default pass')
                        accessTokenFamily = await acc.auth('default family', 'default pass')
    
                    } catch (err) {
                        console.log('Failure in users.patch test: ', err)
                    }
                })    
                after(async () => {
                    try {
                        await con.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch053: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch054: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch055: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch056: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch057: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch058: should return status code 403 and info message from insufficient permissions for update application password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch059: should return status code 403 and info message from insufficient permissions for update another family password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultFamily.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(anotherFamilyToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // family update password  

            context('application update user password', () => {
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
    
                        accessTokenChild = await acc.auth('default child', 'default pass')
                        accessTokenEducator = await acc.auth('default educator', 'default pass')
                        accessTokenHealthProfessional = await acc.auth('default health professional', 'default pass')
                        accessTokenApplication = await acc.auth('default application', 'default pass')
                        accessTokenFamily = await acc.auth('default family', 'default pass')
    
                    } catch (err) {
                        console.log('Failure in users.patch test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await con.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('users.patch060: should return status code 403 and info message from insufficient permissions for update admin password', () => {

                    return request(URI)
                        .patch(`/users/${admin_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch061: should return status code 403 and info message from insufficient permissions for update child password', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch062: should return status code 403 and info message from insufficient permissions for update educator password', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch063: should return status code 403 and info message from insufficient permissions for update health professional password', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch064: should return status code 403 and info message from insufficient permissions for update family password', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch065: should return status code 403 and info message from insufficient permissions for update your own password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.patch066: should return status code 403 and info message from insufficient permissions for update another application password', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: defaultApplication.password, new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(anotherApplicationToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

            }) // application update password         

        }) // user does not have permission  
    })
})