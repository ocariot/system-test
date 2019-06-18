import request from 'supertest'
import { expect } from 'chai'
import { Institution } from '../src/account-service/model/institution'
import { AccountUtil } from './utils/account.utils'
import { AccountDb } from '../src/account-service/database/account.db'
import { Child } from '../src/account-service/model/child'
import { Strings } from './utils/string.error.message'

describe('Routes: users.children', () => {

    const URI: string = 'https://localhost'
    const acc = new AccountUtil()

    let accessTokenAdmin: string
    let accessTokenChild: string
    let accessTokenEducator: string
    let accessTokenHealthProfessional: string
    let accessTokenFamily: string
    let accessTokenApplication: string

    let defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    let defaultChild: Child = new Child()
    defaultChild.username = 'default username'
    defaultChild.password = 'default password'
    defaultChild.gender = 'male'
    defaultChild.age = 11


    const con = new AccountDb()

    before(async () => {
        try {
            await con.connect(0, 1000)

            accessTokenAdmin = await acc.auth('admin', 'admin123')

            await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = defaultInstitution.id ? defaultInstitution.id : ''
            
            const childSend = await acc.saveChild(accessTokenAdmin, defaultInstitution.id, true)
            accessTokenChild = await acc.auth(childSend.username, childSend.password)

            const educatorSend = await acc.saveEducator(accessTokenAdmin, defaultInstitution.id, true)
            accessTokenEducator = await acc.auth(educatorSend.username, educatorSend.password)

            const healthProfessionalSend = await acc.saveHealthProfessional(accessTokenAdmin, defaultInstitution.id, true)
            accessTokenHealthProfessional = await acc.auth(healthProfessionalSend.username, healthProfessionalSend.password)

            const anotherChild = await acc.saveChild(accessTokenAdmin, defaultInstitution.id, false)

            const familySend = await acc.saveFamily(accessTokenAdmin, defaultInstitution.id, anotherChild, true)
            accessTokenFamily = await acc.auth(familySend.username, familySend.password)
            
            const applicationSend = await acc.saveApplication(accessTokenAdmin, defaultInstitution.id, true)
            accessTokenApplication = await acc.auth(applicationSend.username, applicationSend.password)

        } catch (e) {
            console.log('Before Error', e.message)
        }
    })

    after(async () => {
        try {
            await con.removeCollections()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /users/children', () => {
        context('when posting a new child user', () => {
            it('should return status code 201 and the saved child', () => {
                
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution).to.have.property('id')
                        if (res.body.institution.type)
                            expect(res.body.institution.type).to.eql(defaultInstitution.type)
                        if (res.body.institution.name)
                            expect(res.body.institution.name).to.eql(defaultInstitution.name)
                        if (res.body.institution.address)
                            expect(res.body.institution.address).to.eql(defaultInstitution.address)
                        if (res.body.institution.latitude)
                            expect(res.body.institution.latitude).to.eql(defaultInstitution.latitude)
                        if (res.body.institution.longitude)
                            expect(res.body.institution.longitude).to.eql(defaultInstitution.longitude)

                        defaultChild.id = res.body.id
                    })
            })
        })

        /* TESTES - RESTRIÇÕES NOS CAMPOS USERNAME/PASSWORD ... (CRIAR COM ESPAÇO ?)
        context('when the username is a blank space', () => {
            it('should return status code ? and message info about ...', () => {

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(409)
            })
        })*/        

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_409_DUPLICATE)
                    })
            })
        })

        context('when the child username was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_USERNAME_NOT_PROVIDED)
                    })
            })
        })  
        
        context('when the child password was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_PASSWORD_NOT_PROVIDED)
                    })
            })
        }) 
        
        context('when the institution of the child was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_INSTITUTION_NOT_PROVIDED)
                    })
            })
        })         

        context('when the child gender was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_GENDER_NOT_PROVIDED)
                    })
            })
        })

        context('when the child age was not provided', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {

                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_AGE_NOT_PROVIDED)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: acc.NON_EXISTENT_ID,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_NON_EXISTENT_INSTITUTION)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: acc.INVALID_ID,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_400_INVALID_FORMAT_ID)
                    })
            })
        }) 

        context('when the child gender provided was invalid', () => {
            it('should return status code 400 and message about invalid gender', () => {

                const body = {
                    username: 'child with gender equal numbers',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: acc.INVALID_GENDER,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    // .then(err => {
                    //     // expect(err.body).to.eql(Strings.CHILD.?)
                    // })
            })
        }) 

        context('when the child age provided was negative', () => {
            it('should return status code 400 and message about invalid age', () => {

                const body = {
                    username: 'child with negative age',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: acc.NEGATIVE_AGE
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(400)
                    // .then(err => {
                    //     // expect(err.body).to.eql(Strings.CHILD.?)
                    // })
            })
        })
        
        context('when the child posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_403_FORBIDDEN)
                    })
            })
        }) 
        
        context('when the educator posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenEducator))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_403_FORBIDDEN)
                    })
            })
        })
        
        context('when the health professional posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenHealthProfessional))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_403_FORBIDDEN)
                    })
            })
        })
        
        context('when the family posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenFamily))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_403_FORBIDDEN)
                    })
            })
        }) 
        
        context('when the application posting a new child user', () => {
            it('should return status code 403 and info message from insufficient permissions', () => {

                const body = {
                    username: 'another child',
                    password: defaultChild.password,
                    institution_id: defaultInstitution.id,
                    gender: defaultChild.gender,
                    age: defaultChild.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenApplication))
                    .set('Content-Type', 'application/json')
                    .send(body)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(Strings.CHILD.ERROR_403_FORBIDDEN)
                    })
            })
        })         
    })


    /*describe('GET /users/children/:child_id', () => {
        context('when get a unique child in database', () => {
            it('should return status code 200 and a child', () => {

                return request(URI)
                    .get(`/users/children/${child.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(child.id)
                        expect(res.body.username).to.eql(child.username)
                        expect(res.body.gender).to.eql(child.gender)
                        expect(res.body.age).to.eql(child.age)
                        expect(res.body.institution).to.have.property('id')
                        if (res.body.institution.type)
                            expect(res.body.institution.type).to.eql(institution.type)
                        if (res.body.institution.name)
                            expect(res.body.institution.name).to.eql(institution.name)
                        if (res.body.institution.address)
                            expect(res.body.institution.address).to.eql(institution.address)
                        if (res.body.institution.latitude)
                            expect(res.body.institution.latitude).to.eql(institution.latitude)
                        if (res.body.institution.longitude)
                            expect(res.body.institution.longitude).to.eql(institution.longitude)
                    })
            })
        })

        context('when to get a child deleted from the database', () => {
            let anotherChild

            before(async () => {
                try {
                    const resultChild: any = await saveChild(institution.id)
                    anotherChild = new Child().fromJSON(resultChild.body)

                    deleteUserChild(anotherChild.id)

                } catch (e) {
                    console.log('before error', e.message)
                }
            })

            it('should return status code 404 and info message from child not found', () => {

                return request(URI)
                    .get(`/users/children/${anotherChild.id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body.message).to.eql('Child not found!')
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {

                const id = '1a11a11aa111aa1111a1a1a1'

                return request(URI)
                    .get(`/users/children/${id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body.message).to.eql('Child not found!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {

                const id = '5cb4a12fa8dc060034e939f'

                return request(URI)
                    .get(`/users/children/${id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')
                    .expect(400)
            })
        })
    })*/
})
