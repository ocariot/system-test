import request from 'supertest'
import { expect } from 'chai'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
//import { Child } from '../src/account-service/model/child'
//import { Application } from '../src/account-service/model/application'
//import { Family } from '../src/account-service/model/family'
//import { HealthProfessional } from '../src/account-service/model/health.professional'
//import { Educator } from '../src/account-service/model/educator'
import { ChildMock } from './mocks/account-service/child.mock'
//import { ApplicationMock } from './mocks/account-service/application.mock'
//import { FamilyMock } from './mocks/account-service/family.mock'
//import { EducatorMock } from './mocks/account-service/educator.mock'

const URI = 'https://localhost'

//let application: Application
//let child: Child
//let educator: Educator
//let family: Family
let institution: Institution
//let anotherInstitution: Institution
//let anotherInstitution: Institution
//let healthProfessional: HealthProfessional
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

            //const resultApplication: any = await saveApplication(institution.id)
            //application = new Application().fromJSON(resultApplication.body)

            //const resultEducator: any = await saveEducator(institution.id)
            //educator = new Educator().fromJSON(resultEducator.body)

            //const resultHealthProfessional: any = await saveHealthProfessional(institution.id)
            //healthProfessional = new HealthProfessional().fromJSON(resultHealthProfessional.body)

            //const resultFamily: any = await saveFamily(institution.id)
            //family = new Family().fromJSON(resultFamily.body)
            
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
                    username: ' ',
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
/*
        context('when you pass a space as a username', () => {

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
                    username: ' ',
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
*/
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
/*
async function saveApplication(institutionId?: string): Promise<Child> {
    const applicationSend = new ApplicationMock()
    if (applicationSend.institution) applicationSend.institution.id = institutionId

    return request(URI)
        .post('/users/applications')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(applicationSend.toJSON())
}

async function saveFamily(institutionId?: string): Promise<Child> {
    const familySend = new FamilyMock()
    if(familySend.institution) familySend.institution.id = institutionId
    familySend.children = new Array<Child>(child)

    return request(URI)
        .post('/users/families')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(familySend.toJSON())
}

async function saveHealthProfessional(institutionId?: string): Promise<Child> {
    const healthProfessionalSend = new ChildMock()
    if (healthProfessionalSend.institution) healthProfessionalSend.institution.id = institutionId

    return request(URI)
        .post('/users/healthprofessionals')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(healthProfessionalSend.toJSON())
}

async function saveEducator(institutionId?: string): Promise<Educator> {
    const educatorSend = new EducatorMock()
    if(educatorSend.institution) educatorSend.institution.id = institutionId

    return request(URI)
        .post('/users/educators')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(educatorSend.toJSON())
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
*/


