import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../../src/account-service/model/institution'
import { acc } from '../../utils/account.utils'
import { accountDB } from '../../../src/account-service/database/account.db'
import { Child } from '../../../src/account-service/model/child'
import { ApiGatewayException } from '../../utils/api.gateway.exceptions'
import { Educator } from '../../../src/account-service/model/educator'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { Family } from '../../../src/account-service/model/family'
import { Application } from '../../../src/account-service/model/application'
import { ChildMock } from '../../mocks/account-service/child.mock'
import { FamilyMock } from '../../mocks/account-service/family.mock'
import { EducatorMock } from '../../mocks/account-service/educator.mock'
import { HealthProfessionalMock } from '../../mocks/account-service/healthprofessional.mock'

describe('Routes: users', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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

    before(async () =>  {
        try {
            await accountDB.connect()
            await accountDB.removeCollections()

            accessTokenAdmin = await acc.getAdminToken()

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

            accessTokenDefaultChild = await acc.auth('default child', 'default pass')
            accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')
            accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')
            accessTokenDefaultApplication = await acc.auth('default application', 'default pass')
            accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

        } catch (err) {
            console.log('Failure on Before from users.post test: ', err)
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

    describe('POST /:user_id/reset-password', () => {

        const newPassword = 'newCoolPassword123'

        describe('when the administrator reset user password successfully', () => {

            after(async () => {
                try {
                    await accountDB.deleteUsers()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })

            it('users.post001: should return status code 204 and no content for himself', async () => {
                const ADMIN_ID = await acc.getAdminID()

                return request(URI)
                    .post(`/users/${ADMIN_ID}/reset-password`)
                    .send({ new_password:  'admin123' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.post002: should return status code 204 and no content for child', async () => {

                return request(URI)
                    .post(`/users/${defaultChild.id}/reset-password`)
                    .send({ new_password:  newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.post003: should return status code 204 and no content for educator', async () => {

                return request(URI)
                    .post(`/users/${defaultEducator.id}/reset-password`)
                    .send({ new_password:  newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.post004: should return status code 204 and no content for health professional', async () => {

                return request(URI)
                    .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                    .send({ new_password:  newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.post005: should return status code 204 and no content for family', async () => {

                return request(URI)
                    .post(`/users/${defaultFamily.id}/reset-password`)
                    .send({ new_password:  newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('users.post006: should return status code 204 and no content for application', async () => {

                return request(URI)
                    .post(`/users/${defaultApplication.id}/reset-password`)
                    .send({ new_password:  newPassword })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        describe('when the user does not have permission', () => {

            context('child reset user password', () => {
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

                    } catch (err) {
                        console.log('Failure in users.post test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('should return status code 403 and info message from insufficient permissions for reset admin password', async () => {

                    const ADMIN_ID = await acc.getAdminID()
                    return request(URI)
                        .post(`/users/${ADMIN_ID}/reset-password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset own password', async () => {

                    return request(URI)
                        .post(`/users/${defaultChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset educator password', async () => {

                    return request(URI)
                        .post(`/users/${defaultEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset health professional password', async () => {

                    return request(URI)
                        .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset family password', async () => {

                    return request(URI)
                        .post(`/users/${defaultFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset application password', async () => {

                    return request(URI)
                        .post(`/users/${defaultApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset another child password', async () => {

                    return request(URI)
                        .post(`/users/${anotherChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator reset user password', () => {
                const anotherEducator: Educator = new EducatorMock()

                before(async () => {
                    try {
                        anotherEducator.institution = defaultInstitution
                        const resultEducatorMock = await acc.saveEducator(accessTokenAdmin, anotherEducator)
                        anotherEducator.id = resultEducatorMock.id

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

                        accessTokenDefaultEducator = await acc.auth('default educator', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.post test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('should return status code 403 and info message from insufficient permissions for reset admin password', async () => {

                    const ADMIN_ID = await acc.getAdminID()
                    return request(URI)
                        .post(`/users/${ADMIN_ID}/reset-password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset child password', async () => {

                    return request(URI)
                        .post(`/users/${defaultChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset own password', async () => {

                    return request(URI)
                        .post(`/users/${defaultEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset health professional password', async () => {

                    return request(URI)
                        .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset family password', async () => {

                    return request(URI)
                        .post(`/users/${defaultFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset application password', async () => {

                    return request(URI)
                        .post(`/users/${defaultApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset another educator password', async () => {

                    return request(URI)
                        .post(`/users/${anotherEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('health professional reset user password', () => {
                const anotherHealthProfessional: HealthProfessional = new HealthProfessionalMock()

                before(async () => {
                    try {
                        anotherHealthProfessional.institution = defaultInstitution
                        const resultProfessionalMock = await acc.saveHealthProfessional(accessTokenAdmin, anotherHealthProfessional)
                        anotherHealthProfessional.id = resultProfessionalMock.id

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

                        accessTokenDefaultHealthProfessional = await acc.auth('default health professional', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.post test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('should return status code 403 and info message from insufficient permissions for reset admin password', async () => {

                    const ADMIN_ID = await acc.getAdminID()
                    return request(URI)
                        .post(`/users/${ADMIN_ID}/reset-password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset child password', async () => {

                    return request(URI)
                        .post(`/users/${defaultChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset educator password', async () => {

                    return request(URI)
                        .post(`/users/${defaultEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset own password', async () => {

                    return request(URI)
                        .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset family password', async () => {

                    return request(URI)
                        .post(`/users/${defaultFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset application password', async () => {

                    return request(URI)
                        .post(`/users/${defaultApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset another health professional password', async () => {

                    return request(URI)
                        .post(`/users/${anotherHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family reset user password', () => {
                const anotherFamily: Family = new FamilyMock()

                before(async () => {
                    try {
                        const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
                        defaultChild.id = resultChild.id

                        anotherFamily.institution = defaultInstitution
                        anotherFamily.children = [resultChild]
                        const resultAnotherFamilyMock = await acc.saveFamily(accessTokenAdmin, anotherFamily)
                        anotherFamily.id = resultAnotherFamilyMock.id
                        anotherFamily.children = resultAnotherFamilyMock.children

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

                        accessTokenDefaultFamily = await acc.auth('default family', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.post test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('should return status code 403 and info message from insufficient permissions for reset admin password', async () => {

                    const ADMIN_ID = await acc.getAdminID()
                    return request(URI)
                        .post(`/users/${ADMIN_ID}/reset-password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset child password', async () => {

                    return request(URI)
                        .post(`/users/${defaultChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset educator password', async () => {

                    return request(URI)
                        .post(`/users/${defaultEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset health professional password', async () => {

                    return request(URI)
                        .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset own password', async () => {

                    return request(URI)
                        .post(`/users/${defaultFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset application password', async () => {

                    return request(URI)
                        .post(`/users/${defaultApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset another family password', async () => {

                    return request(URI)
                        .post(`/users/${anotherFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application reset user password', () => {
                const anotherApplication: Application = new Application()

                before(async () => {
                    try {
                        anotherApplication.institution = defaultInstitution
                        const resultApplicationMock = await acc.saveApplication(accessTokenAdmin, anotherApplication)
                        anotherApplication.id = resultApplicationMock.id

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

                        accessTokenDefaultApplication = await acc.auth('default application', 'default pass')

                    } catch (err) {
                        console.log('Failure in users.post test: ', err)
                    }
                })
                after(async () => {
                    try {
                        await accountDB.deleteUsers()
                    } catch (err) {
                        console.log('DB ERROR', err)
                    }
                })

                it('should return status code 403 and info message from insufficient permissions for reset admin password', async () => {

                    const ADMIN_ID = await acc.getAdminID()
                    return request(URI)
                        .post(`/users/${ADMIN_ID}/reset-password`)
                        .send({ new_password: 'admin123' })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset child password', async () => {

                    return request(URI)
                        .post(`/users/${defaultChild.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset educator password', async () => {

                    return request(URI)
                        .post(`/users/${defaultEducator.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset health professional password', async () => {

                    return request(URI)
                        .post(`/users/${defaultHealthProfessional.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset family password', async () => {

                    return request(URI)
                        .post(`/users/${defaultFamily.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset own password', async () => {

                    return request(URI)
                        .post(`/users/${defaultApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('should return status code 403 and info message from insufficient permissions for reset another application password', async () => {

                    return request(URI)
                        .post(`/users/${anotherApplication.id}/reset-password`)
                        .send({ new_password: newPassword })
                        .set('Authorization', 'Bearer '.concat(accessTokenDefaultApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })
    })
})