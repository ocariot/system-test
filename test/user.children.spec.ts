import request from 'supertest'
import { expect } from 'chai'
import { Child } from '../src/account-service/model/child'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
import { ChildMock } from './mocks/account-service/child.mock'

const URI = 'https://localhost'

let institution: Institution
let accessTokenAdmin: string

describe('Routes: users.children', () => {

    const child = new ChildMock()
    child.password = 'child123'

    before(async () => {
        try {
            
            const resultAuth: any = await auth('admin', 'admin123')
            accessTokenAdmin = resultAuth.body.access_token

            const resultInstitution: any = await saveInstitution()
            institution = new Institution().fromJSON(resultInstitution.body)
            
        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('POST /users/children', () => {
        context('when posting a new child user', () => {
            it('should return status code 201 and the saved child', () => {
                
                const body = {
                    username: child.username,
                    password: child.password,
                    institution_id: institution.id,
                    gender: child.gender,
                    age: child.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(child.username)
                        expect(res.body.gender).to.eql(child.gender)
                        expect(res.body.age).to.eql(child.age)
                        expect(res.body.institution).to.have.property('id')
                        if(res.body.institution.type)
                            expect(res.body.institution.type).to.eql(institution.type)    
                        if(res.body.institution.name)
                            expect(res.body.institution.name).to.eql(institution.name)
                        if(res.body.institution.address)
                            expect(res.body.institution.address).to.eql(institution.address)
                        if(res.body.institution.latitude)
                            expect(res.body.institution.latitude).to.eql(institution.latitude)
                        if(res.body.institution.longitude)
                            expect(res.body.institution.longitude).to.eql(institution.longitude)
                        child.id = res.body.id
                })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                
                const body = {
                    username: child.username,
                    password: child.password,
                    institution_id: institution.id,
                    gender: child.gender,
                    age: child.age
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(409)
            })
        })
        
        context('when a validation error occurs because the username is not passed', () => {
            it('should return the status code 400 and the message information about username parameter is missing or invalid', () => {
                const body = {
                    password: child.password,
                    institution_id: institution.id,
                    gender: child.gender,
                    age: child.age                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: username is required!')
                    })
            })
        })

        context('when a validation error occurs because the password is not passed', () => {
            it('should return the status code 400 and the message information about password parameter is missing or invalid', () => {
                const body = {
                    username: child.username,
                    institution_id: institution.id,
                    gender: child.gender,
                    age: child.age                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: password is required!')
                    })
            })
        })

        context('when a validation error occurs because the institution is not passed', () => {
            it('should return the status code 400 and the message information about institution parameter is missing or invalid', () => {
                const body = {
                    username: child.username,
                    password: child.password,
                    gender: child.gender,
                    age: child.age                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: institution is required!')
                    })
            })
        })
        
        context('when a validation error occurs because the gender is not passed', () => {
            it('should return the status code 400 and the message information about gender parameter is missing or invalid', () => {
                const body = {
                    username: child.username,
                    password: child.password,
                    institution_id: institution.id,
                    age: child.age                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: gender is required!')
                    })
            })
        })        

        context('when a validation error occurs because the age is not passed', () => {
            it('should return the status code 400 and the message information about age parameter is missing or invalid', () => {
                const body = {
                    username: child.username,
                    password: child.password,
                    institution_id: institution.id,
                    gender: child.gender
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: age is required!')
                    })
            })
        }) 

        //Quando o banco estiver sendo limpo, deve retornar 400, por equanto está retornando 409, pois
        //uma criança com username ' ' já foi criada antes, no teste de descoberta da falha.
        context('when you pass a space as a username', () => {
            
            let anotherInstitution: Institution

            before(async () => {
                try{
                    const resultInstitution: any = await saveInstitution()
                    anotherInstitution = new Institution().fromJSON(resultInstitution.body)
                } catch(e) {
                    console.log('before error', e.message)
                }
            })   

            it('should return status code 400 and message for the child invalid username', () => {

                const anotherChild = new ChildMock()
                const body = {
                    username: '',
                    password: 'mysecret123',
                    institution_id: anotherInstitution.id,
                    gender: anotherChild.gender,
                    age: anotherChild.age                    
                }
                
                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        }) 

        context('when you pass spaces before the username', () => {
            it('should return status code 400 and message for the child invalid username', () => {
                
                const anotherChild = new ChildMock()

                const body = {
                    username: ' '.concat(anotherChild.username ? anotherChild.username : ''),
                    password: 'mysecret123',
                    institution_id: institution.id,
                    gender: anotherChild.gender,
                    age: anotherChild.age                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        })
        
        context('when past a negative age for children', () => {
            it('should return status code 400 and message for the child invalid age', () => {
                
                const anotherChild = new ChildMock()

                const body = {
                    username: anotherChild.username,
                    password: 'mysecret123',
                    institution_id: institution.id,
                    gender: anotherChild.gender,
                    age: -12                    
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        })  
        
        context('when an invalid gender is passed', () => {
            it('should return status code 400 and message for the child invalid gender', () => {
                
                const anotherChild = new ChildMock()

                const body = {
                    username: anotherChild.username,
                    password: 'mysecret123',
                    institution_id: institution.id,
                    gender: '0000',
                    age: anotherChild.age                    
                }
                
                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        })

        context('when you pass a space as a password', () => {
            it('should return status code 400 and message for the child invalid password', () => {
                
                const anotherChild = new ChildMock()

                const body = {
                    username: anotherChild.username,
                    password: ' ',
                    institution_id: institution.id,
                    gender: anotherChild.gender,
                    age: anotherChild.age                    
                }
                
                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        }) 
        
        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {

                const anotherChild = new ChildMock()
                anotherChild.password = 'mysecret123'

                const body = {
                    username: anotherChild.username,
                    password: child.password,
                    institution_id: '123',
                    gender: child.gender,
                    age: child.age,
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                
                const anotherChild = new ChildMock()
                anotherChild.password = 'mysecret123'

                const body = {
                    username: anotherChild.username,
                    password: anotherChild.password,
                    institution_id: '5c86a3a7476af700358fa75b',
                    gender: anotherChild.gender,
                    age: anotherChild.age,
                }

                return request(URI)
                    .post('/users/children')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')                    
                    .send(body)
                    .expect(400)
            })
        })   
    })
    

    describe('GET /users/children/:child_id', () => {
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
                        if(res.body.institution.type)
                            expect(res.body.institution.type).to.eql(institution.type)    
                        if(res.body.institution.name)
                            expect(res.body.institution.name).to.eql(institution.name)
                        if(res.body.institution.address)
                            expect(res.body.institution.address).to.eql(institution.address)
                        if(res.body.institution.latitude)
                            expect(res.body.institution.latitude).to.eql(institution.latitude)
                        if(res.body.institution.longitude)
                            expect(res.body.institution.longitude).to.eql(institution.longitude)                        
                    })                
            })
        })
        
        context('when to get a child deleted from the database', () => {
            let anotherChild

            before(async () => {
                try{
                    const resultChild: any = await saveChild(institution.id)
                    anotherChild = new Child().fromJSON(resultChild.body)

                    deleteUserChild(anotherChild.id)
                    
                } catch(e) {
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
        /*
        // Deve ser aceito quando o banco estiver sendo limpo!!!
        context('when the child_id is empty', () => {
            it('should return status code 400 and message info about invalid id', () => {

                const id = ''

                return request(URI)
                    .get(`/users/children/${id}`)
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .set('Content-Type', 'application/json')  
                    .expect(400)
            })
        })*/                       
    })
})    

async function auth(username?: string, password?: string): Promise<any> {
    return request(URI)
        .post('/auth')
        .set('Content-Type', 'application/json')
        .send({ 'username': username, 'password': password })
}

async function saveInstitution(): Promise<Institution> {
    return request(URI)
        .post('/institutions')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(new InstitutionMock().toJSON())
}

async function saveChild(institutionId?: string): Promise<Child> {
    const childSend = new ChildMock()
    if (childSend.institution) childSend.institution.id = institutionId

    return request(URI)
        .post('/users/children')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(childSend.toJSON())
}

async function deleteUserChild(childId?: string): Promise<Child> {
    return request(URI)
        .delete(`/users/${childId}`)
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .expect(204)
}



