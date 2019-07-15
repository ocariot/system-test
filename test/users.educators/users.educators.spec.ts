import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../../src/account-service/model/institution'
import { acc } from '../utils/account.utils'
import { AccountDb } from '../../src/account-service/database/account.db'
import { Educator } from '../../src/account-service/model/educator'
import { Strings } from '../utils/string.error.message'
import { Child } from '../../src/account-service/model/child'
import { ChildrenGroup } from '../../src/account-service/model/children.group'

describe('Routes: users.educators', () => {

    const URI: string = 'https://localhost'

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

    const anotherInstitution: Institution = new Institution()
    anotherInstitution.type = 'another type'
    anotherInstitution.name = 'another name'
    anotherInstitution.address = 'another address'
    anotherInstitution.latitude = -7.2100766
    anotherInstitution.longitude = -35.9175756

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

    const anotherChild: Child = new Child()
    anotherChild.username = 'another child'
    anotherChild.password = 'another pass'
    anotherChild.gender = 'female'
    anotherChild.age = 8

    let defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    let anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()
    anotherChildrenGroup.name = 'another children group'
    anotherChildrenGroup.school_class = '3th grade'

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

            defaultChild.institution = defaultInstitution
            const resultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultChild.id

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

    describe('POST /users/educators', () => {
        context('when posting a new educator user', () => {
            it('should return status code 201 and the saved educator', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                        defaultEducator.id = res.body.id
                    })

            })
        })

        //  TESTES - RESTRIÇÕES NOS CAMPOS USERNAME/PASSWORD ... (CRIAR COM ESPAÇO ?)
        // context('when the username is a blank space', () => {
        //     it('should return status code ? and message info about ...', () => {

        //         return request(URI)
        //             .post('/users/educators')
        //             .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        //             .set('Content-Type', 'application/json')
        //             .send(body)
        //             .expect(409)
        //     })
        // })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when a validation error occurs', () => {

            context('educator username was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        password: defaultEducator.password,
                        institution_id: defaultInstitution.id,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_USERNAME_NOT_PROVIDED)
                        })
                })
            })

            context('educator password was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        username: defaultEducator.username,
                        institution_id: defaultInstitution.id,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_PASSWORD_NOT_PROVIDED)
                        })
                })
            })

            context('institution of the educator was not provided', () => {
                it('should return status code 400 and message info about missing or invalid parameters', () => {

                    const body = {
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.EDUCATOR.ERROR_400_INSTITUTION_NOT_PROVIDED)
                        })
                })
            })

            context('institution provided does not exists', () => {
                it('should return status code 400 and message from institution not found', () => {

                    const body = {
                        username: 'another username',
                        password: defaultEducator.password,
                        institution_id: acc.NON_EXISTENT_ID
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                        })
                })
            })

            context('institution id provided was invalid', () => {
                it('should return status code 400 and message for invalid institution id', () => {
                    const body = {
                        username: 'anotherusername',
                        password: defaultEducator.password,
                        institution_id: acc.INVALID_ID
                    }

                    return request(URI)
                        .post('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                        .set('Content-Type', 'application/json')
                        .send(body)
                        .expect(400)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                        })
                })
            })
        }) // validantion error occurs

        context('when the user does not have permission to register the educator', () => {

            it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        context('when not informed the acess token', () => {
            it('should return the status code 401 and the authentication failure informational message', async () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: defaultInstitution.id
                }

                return request(URI)
                    .post('/users/educators')
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET /users/educators/:educator_id', () => {
        context('when get a unique educator in database', () => {
            it('should return status code 200 and a educator', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when get only the ID, username and institution of a unique educator in database', () => {
            it('should return status code 200 and only the ID, username and institution of the educator', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children_groups')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .get(`/users/educators/${acc.NON_EXISTENT_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                return request(URI)
                    .get(`/users/educators/${acc.INVALID_ID}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the user does not have permission to get a unique educator in database', () => {

            it('CHILD - should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('HEALTH PROFESSIONAL - should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('FAMILY - should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('APPLICATION - should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('ANOTHER EDUCATOR - should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })
        }) // user does not have permission

        context('when not informed the acess token', () => {
            it('should return the status code 401 and the authentication failure informational message', async () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer ')
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(err => {
                        expect(err.body).to.eql(Strings.AUTH.ERROR_401_UNAUTHORIZED)
                    })
            })
        })

        context('when the educator gets their personal data from database', () => {
            let educatorToken: string
            before(async () => {
                try {
                    if (defaultEducator.username && defaultEducator.password)
                        educatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
                } catch (err) {
                    console.log('Failure on Educators test: ' + err.message)
                }
            })
            it('should return status code 403 and info message from insufficient permissions', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(educatorToken))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children_groups')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution.id).to.eql(defaultInstitution.id)
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the admin get a unique educator in database', () => {
            before(async () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }
                try {
                    const result = await acc
                        .saveChildrenGroupsForEducator(accessTokenEducator, defaultEducator, body)
                    defaultChildrenGroup.id = result.id
                    defaultChildrenGroup.children = result.children

                } catch (err) {
                    console.log('Before error', err)
                }
            })
            
            it('should return status code 200 and a educator, without the children group data', () => {

                return request(URI)
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body).to.not.have.property('children_groups')
                        expect(res.body).to.have.property('institution')
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)

                    })
            })
        })
    })

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('GET All /users/educators', () => {

        before(async () => {
            try {
                anotherEducator.institution = defaultInstitution
                await acc.saveEducator(accessTokenAdmin, anotherEducator)

            } catch (err) {
                console.log('Failure on Educators test: ' + err.message)
            }
        })
        context('when get all educators in database', () => {
            it('should return status code 200 and a list of educators without children group data', () => {

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
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[1].institution).to.not.have.property('id')
                        expect(res.body[1].institution.type).to.eql(defaultInstitution.type)
                        expect(res.body[1].institution.name).to.eql(defaultInstitution.name)
                        expect(res.body[1].institution.address).to.eql(defaultInstitution.address)
                        expect(res.body[1].institution.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[1].institution.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when get all educators in ascending order by username from database', () => {
            it('should return status code 200 and a list of children', () => {

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
                        expect(res.body[1].username).to.eql(anotherEducator.username)
                        expect(res.body[1].institution).to.eql(anotherEducator.institution)
                    })
            })
        })

        context('when the user does not have permission', () => {

            context('child get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('health professional get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application get all educators in database', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .get('/users/educators')
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        }) //user does not have permission


        context('when get all educators in database after deleting all of them', () => {
            before(async () => {
                try {
                    await con.deleteAllEducators()
                } catch (err) {
                    console.log('DB ERROR', err)
                }
            })
            it('should return status code 200 and empty array ', () => {

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
    })

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    describe('PATCH /users/educators/:educator_id', () => {
        before(async () => {
            defaultEducator.institution = defaultInstitution
            const resultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultEducator.id

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, anotherInstitution)
            anotherInstitution.id = resultInstitution.id
        })
        context('when the update was successful', () => {
            it('should return status code 200 and updated educator', () => {

                defaultEducator.username = 'newcoolusername'
                defaultEducator.institution = anotherInstitution

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ username: 'newcoolusername', institution_id: anotherInstitution.id })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution.type).to.eql(anotherInstitution.type)
                        expect(res.body.institution.name).to.eql(anotherInstitution.name)
                        expect(res.body.institution.address).to.eql(anotherInstitution.address)
                        expect(res.body.institution.latitude).to.eql(anotherInstitution.latitude)
                        expect(res.body.institution.longitude).to.eql(anotherInstitution.longitude)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            before(async () => {
                try {
                    anotherEducator.institution = defaultInstitution
                    const result = await acc.saveEducator(accessTokenAdmin, anotherEducator)
                    anotherEducator.id = result.id
                } catch (err) {
                    console.log('Failure on Educators test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {

                return request(URI)
                    .patch(`/users/educators/${anotherEducator.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_409_UNIQUE_DATA_ALREADY_EXISTS)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {

                return request(URI)
                    .patch(`/users/educators/${acc.NON_EXISTENT_ID}`)
                    .send({})
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.eql(Strings.EDUCATOR.ERROR_404_EDUCATOR_NOT_FOUND)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ institution_id: acc.NON_EXISTENT_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.INSTITUTION.ERROR_400_INSTITUTION_NOT_REGISTERED)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it(' should return status code 400 and message for invalid institution id', () => {

                return request(URI)
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ institution_id: acc.INVALID_ID })
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        })

        context('when the users does not have permission', () => {

            context('child update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenChild))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('educator update educator', () => {
                let tokenDefaultEducator: string
                before(async () => {
                    try {
                        if (defaultEducator.username && defaultEducator.password) {
                            tokenDefaultEducator = await acc
                                .auth(defaultEducator.username, defaultEducator.password)
                        }
                    } catch (err) {
                        console.log('Failure on Educators test: ' + err.message)
                    }
                })
                context('educator update yourself', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/educators/${defaultEducator.id}`)
                            .send({ username: 'anothercoolusername' })
                            .set('Authorization', 'Bearer '.concat(tokenDefaultEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
                context('educator update another educator', () => {
                    it('should return status code 403 and info message from insufficient permissions', () => {

                        return request(URI)
                            .patch(`/users/educators/${anotherEducator.id}`)
                            .send({ username: 'anothercoolusername' })
                            .set('Authorization', 'Bearer '.concat(tokenDefaultEducator))
                            .set('Content-Type', 'application/json')
                            .expect(403)
                            .then(err => {
                                expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                            })
                    })
                })
            })

            context('health professional update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('family update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })

            context('application update the educator', () => {
                it('should return status code 403 and info message from insufficient permissions', () => {

                    return request(URI)
                        .patch(`/users/educators/${defaultChild.id}`)
                        .send({ username: 'anothercoolusername' })
                        .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                        .set('Content-Type', 'application/json')
                        .expect(403)
                        .then(err => {
                            expect(err.body).to.eql(Strings.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                        })
                })
            })
        })
    })
})
