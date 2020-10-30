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

describe('Routes: users', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

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

    const defaultChild: Child = new ChildMock()

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

    before(async () => {
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
            console.log('Failure on Before from users.delete test: ', err)
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

    describe('DELETE /:user_id', () => {

        describe('when the user does not exist', () => {
            it('users.delete001: should return status code 204 and no content, because user does not exists', () => {
            const NON_EXISTENT_ID = '111111111111111111111111' // non existent id of the user

            return request(URI)
                .delete(`/users/${NON_EXISTENT_ID}`)
                .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                .set('Content-Type', 'application/json')
                .expect(204)
                .then(res => {
                    expect(res.body).to.eql({})
                })
        })
        })

        describe('when the user_id is invalid', () => {
            it('users.delete002: should return status code 400 and message info about invalid id', () => {
                const INVALID_ID = '123' // invalid id of the user

                return request(URI)
                    .delete(`/users/${INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.USER.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        describe('when the user does not have permission', () => {
            let admin_ID
            before(async () => {
                try {
                    admin_ID = await acc.getAdminID()
                } catch (err) {
                    console.log('Failure in users.delete test', err)
                }
            })

            context('child deleting the user', () => {

                it('users.delete003: should return status code 403 and info message from insufficient permissions when delete herself', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete004: should return status code 403 and info message from insufficient permissions when delete admin', async () => {

                    return request(URI)
                        .delete(`/users/${admin_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete005: should return status code 403 and info message from insufficient permissions when delete educator', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete006: should return status code 403 and info message from insufficient permissions when delete health professional', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete007: should return status code 403 and info message from insufficient permissions when delete family', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete008: should return status code 403 and info message from insufficient permissions when delete application', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete009: should return status code 403 and info message from insufficient permissions when delete another child', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherChildToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // child delete the user

            context('educator deleting the user', () => {

                it('users.delete010: should return status code 403 and info message from insufficient permissions when delete child', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete011: should return status code 403 and info message from insufficient permissions when delete admin', () => {

                    return request(URI)
                        .delete(`/users/${admin_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete012: should return status code 403 and info message from insufficient permissions when delete himself', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete013: should return status code 403 and info message from insufficient permissions when delete health professional', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete014: should return status code 403 and info message from insufficient permissions when delete family', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete015: should return status code 403 and info message from insufficient permissions when delete application', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete016: should return status code 403 and info message from insufficient permissions when delete another educator', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherEducatorToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // educator delete the user          

            context('health professional deleting the user', () => {

                it('users.delete017: should return status code 403 and info message from insufficient permissions when delete child', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete018: should return status code 403 and info message from insufficient permissions when delete admin', () => {

                    return request(URI)
                        .delete(`/users/${admin_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete019: should return status code 403 and info message from insufficient permissions when delete educator', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete020: should return status code 403 and info message from insufficient permissions when delete himself', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete021: should return status code 403 and info message from insufficient permissions when delete family', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete022: should return status code 403 and info message from insufficient permissions when delete application', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete023: should return status code 403 and info message from insufficient permissions when delete another health professional', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherHealthProfessionalToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // health professional delete the user                

            context('family deleting the user', () => {

                it('users.delete024: should return status code 403 and info message from insufficient permissions when delete child', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete025: should return status code 403 and info message from insufficient permissions when delete admin', () => {

                    return request(URI)
                        .delete(`/users/${admin_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete026: should return status code 403 and info message from insufficient permissions when delete educator', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete027: should return status code 403 and info message from insufficient permissions when delete health professional', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete028: should return status code 403 and info message from insufficient permissions when delete herself', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete029: should return status code 403 and info message from insufficient permissions when delete application', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete030: should return status code 403 and info message from insufficient permissions when delete another family', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherFamilyToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // family delete the user  

            context('application deleting the user', () => {

                it('users.delete031: should return status code 403 and info message from insufficient permissions when delete child', () => {

                    return request(URI)
                        .delete(`/users/${defaultChild.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete032: should return status code 403 and info message from insufficient permissions when delete admin', () => {

                    return request(URI)
                        .delete(`/users/${admin_ID}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete033: should return status code 403 and info message from insufficient permissions when delete educator', () => {

                    return request(URI)
                        .delete(`/users/${defaultEducator.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete034: should return status code 403 and info message from insufficient permissions when delete health professional', () => {

                    return request(URI)
                        .delete(`/users/${defaultHealthProfessional.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete035: should return status code 403 and info message from insufficient permissions when delete family', () => {

                    return request(URI)
                        .delete(`/users/${defaultFamily.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete036: should return status code 403 and info message from insufficient permissions when delete herself', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })

                it('users.delete037: should return status code 403 and info message from insufficient permissions when delete another application', () => {

                    return request(URI)
                        .delete(`/users/${defaultApplication.id}`)
                        .set('Authorization', 'Bearer '.concat(anotherApplicationToken))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            }) // application delete the user        
        }) // user does not have permission

        context('when delete the user without authorization', () => {

            it('users.delete038: should return status code 401 and info message about unauthorized when delete admin', async () => {

                const admin_ID = await acc.getAdminID()

                return request(URI)
                    .delete(`/users/${admin_ID}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.delete039: should return status code 401 and info message about unauthorized when delete child', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.delete040: should return status code 401 and info message about unauthorized when delete educator', () => {

                return request(URI)
                    .delete(`/users/${defaultEducator.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.delete041: should return status code 401 and info message about unauthorized when delete health professional', () => {

                return request(URI)
                    .delete(`/users/${defaultHealthProfessional.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.delete042: should return status code 401 and info message about unauthorized when delete family', () => {

                return request(URI)
                    .delete(`/users/${defaultFamily.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })

            it('users.delete043: should return status code 401 and info message about unauthorized when delete application', () => {

                return request(URI)
                    .delete(`/users/${defaultApplication.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        }) // delete user without authorization

        context('when the user was successful deleted', () => {

            it('users.delete044: should return status code 204 and no content for child user', () => {

                return request(URI)
                    .delete(`/users/${defaultChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('users.delete045: should return status code 204 and no content for educator user', () => {

                return request(URI)
                    .delete(`/users/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('users.delete046: should return status code 204 and no content for health professional user', () => {

                return request(URI)
                    .delete(`/users/${defaultHealthProfessional.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('users.delete047: should return status code 204 and no content for family user', () => {

                return request(URI)
                    .delete(`/users/${defaultFamily.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })

            it('users.delete048: should return status code 204 and no content for application user', () => {

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