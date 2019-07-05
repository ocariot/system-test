import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../src/account-service/model/institution'
import { AccountUtil } from './utils/account.utils'
import { AccountDb } from '../src/account-service/database/account.db'
import { Child } from '../src/account-service/model/child'
import { Strings } from './utils/string.error.message'
import { Educator } from '../src/account-service/model/educator'
import { HealthProfessional } from '../src/account-service/model/health.professional'
import { Family } from '../src/account-service/model/family'
import { Application } from '../src/account-service/model/application'

describe('Routes: users', () => {

    const URI: string = 'https://localhost'
    const acc = new AccountUtil()

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

    before(async () => {
        try {
            await con.connect(0, 1000)
            await con.removeCollections()

            accessTokenAdmin = await acc.auth(
                process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
                process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')

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

        } catch (e) {
            console.log('Before Error', e)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('PATCH /users/:user_id/password', () => {

        context('when the administrator successfully updates the user password', () => {

            it('CHILD - should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultChild.id}/password`)
                    .send({ old_password: defaultChild.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        defaultChild.password = 'mynewsecretkey'
                        expect(res.body).to.eql({})
                    })
            })

            it('EDUCATOR - should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultEducator.id}/password`)
                    .send({ old_password: defaultEducator.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        defaultEducator.password = 'mynewsecretkey'
                        expect(res.body).to.eql({})
                    })
            })

            it('HEALTH PROFESSIONAL - should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultHealthProfessional.id}/password`)
                    .send({ old_password: defaultHealthProfessional.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        defaultHealthProfessional.password = 'mynewsecretkey'
                        expect(res.body).to.eql({})
                    })
            })

            it('FAMILY - should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultFamily.id}/password`)
                    .send({ old_password: defaultFamily.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        defaultFamily.password = 'mynewsecretkey'
                        expect(res.body).to.eql({})
                    })
            })

            it('APPLICATION - should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/users/${defaultApplication.id}/password`)
                    .send({ old_password: defaultApplication.password, new_password: 'mynewsecretkey' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        defaultApplication.password = 'mynewsecretkey'
                        expect(res.body).to.eql({})
                    })
            })
        }) // update password successfully

        describe('when a validation error occurs', () => {

            context('the user old password does not match', () => {

                it('CHILD - should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('EDUCATOR - should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('FAMILY - should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })

                it('APPLICATION - should return status code 400 and info message from old password does not match', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: acc.NON_EXISTENT_PASSWORD, new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_PASSWORD_NOT_MATCH)
                        })
                })
            }) // old password does not match

            context('when the old password does not provided', () => {

                it('CHILD - should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('EDUCATOR - should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('FAMILY - should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

                it('APPLICATION - should return status code 400 and info message from old password does not provided', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ new_password: 'mynewsecretkey' })
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.USER.ERROR_400_OLD_PASSWORD_NOT_PROVIDED)
                        })
                })

            }) // old password does not provided


            context('the new password does not provided', () => {

                it('CHILD - should return status code 400 and info message from new password does not provided', () => {

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

                it('EDUCATOR - should return status code 400 and info message from new password does not provided', () => {

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

                it('HEALTH PROFESSIONAL - should return status code 400 and info message from new password does not provided', () => {

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

                it('FAMILY - should return status code 400 and info message from new password does not provided', () => {

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

                it('APPLICATION - should return status code 400 and info message from new password does not provided', () => {

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

            context('when the user_id is invalid', () => {

                it('should return status code 400 and info message from invalid id', () => {

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
            }) // user_id is invalid


            context('when update the user password without authorization', () => {

                it('ADMIN - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${acc.ADMIN_ID}/password`)
                        .send({ old_password: 'admin123', new_password: 'admin123' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

                it('CHILD - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultChild.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

                it('EDUCATOR - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultEducator.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultHealthProfessional.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

                it('FAMILY - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultFamily.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })

                it('APPLICATION - should return status code 401 and info message about unauthorized', () => {

                    return request(URI)
                        .patch(`/users/${defaultApplication.id}/password`)
                        .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .then(err => {
                            expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                        })
                })
            }) // without authorization

            describe('when the user does not have permission', () => {

                context('when the child update user password', () => {

                    it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${acc.ADMIN_ID}/password`)
                            .send({ old_password: 'admin123', new_password: 'admin123' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultHealthProfessional.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultFamily.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultApplication.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenChild))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ANOTHER CHILD - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(anotherChildToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                }) // child update password

                context('when the educator update user password', () => {

                    it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${acc.ADMIN_ID}/password`)
                            .send({ old_password: 'admin123', new_password: 'admin123' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HIMSELF - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultHealthProfessional.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultFamily.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultApplication.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ANOTHER EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                }) // educator update password          

                context('when the health professional update user password', () => {

                    it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${acc.ADMIN_ID}/password`)
                            .send({ old_password: 'admin123', new_password: 'admin123' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HIMSELF - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultHealthProfessional.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultFamily.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultApplication.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ANOTHER HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                }) // health professional update password                

                context('when the family update user password', () => {

                    it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${acc.ADMIN_ID}/password`)
                            .send({ old_password: 'admin123', new_password: 'admin123' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultHealthProfessional.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultFamily.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultApplication.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ANOTHER FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(anotherFamilyToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                }) // family update password  

                context('when the application update user password', () => {

                    it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultChild.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${acc.ADMIN_ID}/password`)
                            .send({ old_password: 'admin123', new_password: 'admin123' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultHealthProfessional.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultFamily.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultApplication.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })

                    it('ANOTHER APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/${defaultEducator.id}/password`)
                            .send({ old_password: 'mynewsecretkey', new_password: 'mynewsecretkey' })
                            .set('Authorization', 'Bearer '.concat(anotherApplicationToken))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                }) // application update password                  
            }) // user does not have permission             
        }) // validation error occurs        
    })

    describe('DELETE /users/:user_id', () => {

        context('when the user is not found', () => {
            it('should return status code 204 and no content, even user does not exists', () => {

                return request(URI)
                    .delete(`/users/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        }) // user not found

        context('when the user_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .delete(`/users/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        }) // user_id is invalid        

        describe('when the user does not have permission', () => {

            context('when the child delete the user', () => {

                it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${acc.ADMIN_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ANOTHER CHILD - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // child delete the user

            context('when the educator delete the user', () => {

                it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${acc.ADMIN_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HIMSELF - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ANOTHER EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // educator delete the user          

            context('when the health professional delete the user', () => {

                it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${acc.ADMIN_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HIMSELF - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ANOTHER HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // health professional delete the user                

            context('when the family delete the user', () => {

                it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${acc.ADMIN_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ANOTHER FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherFamilyToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // family delete the user  

            context('when the application delete the user', () => {

                it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ADMIN - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${acc.ADMIN_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('HERSELF - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('ANOTHER APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherApplicationToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // application delete the user        
        }) // user does not have permission

        context('when delete the user without authorization', () => {

            it('ADMIN - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${acc.ADMIN_ID}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('CHILD - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('EDUCATOR - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${defaultEducator.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('HEALTH PROFESSIONAL - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${defaultHealthProfessional.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('FAMILY - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${defaultFamily.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('APPLICATION - should return status code 401 and info message about unauthorized', () => {

                return request(URI)
                    .delete(`/users/${defaultApplication.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        }) // delete user without authorization

        context('when the user was successful deleted', () => {

            it('should return status code 204 and no content for child user', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for educator user', () => {

                return request(URI)
                    .delete(`/users/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for health professional user', () => {

                return request(URI)
                    .delete(`/users/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for family user', () => {

                return request(URI)
                    .delete(`/users/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for application user', () => {

                return request(URI)
                    .delete(`/users/${defaultApplication.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })
        }) // user successfully deleted
    })
})