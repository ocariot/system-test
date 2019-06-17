/*

import request from 'supertest'
import { expect } from 'chai'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
import { Child } from '../src/account-service/model/child'
import { Educator } from '../src/account-service/model/educator'
import { ChildMock } from './mocks/account-service/child.mock'
import { SleepMock } from './mocks/tracking-service/sleep.mock';
import { EducatorMock } from './mocks/account-service/educator.mock'
import { Sleep } from '../src/tracking-service/model/sleep';

const URI = 'https://localhost'
let child: Child
let educator: Educator
let sleep: Sleep
let otherSleep: Sleep
let institution: Institution
let accessTokenAdmin: string
let accessTokenChild: string
let acessTokenEducator: string

describe('Routes: users.children.sleep', () => {

    before(async () => {
        try {
            const resultAuth: any = await auth('admin', 'admin123')
            accessTokenAdmin = resultAuth.body.access_token

            const resultInstitution: any = await saveInstitution()
            institution = new Institution().fromJSON(resultInstitution.body)

            const resultChild: any = await saveChild(institution.id)
            child = new Child().fromJSON(resultChild.body)

            const resultChildAuth: any = await auth(child.username, 'child123')
            accessTokenChild = resultChildAuth.body.access_token

            const resultEducator: any = await saveEducator(institution.id)
            educator = new Educator().fromJSON(resultEducator.body)

            const resultEducatorAuth: any = await auth(educator.username, 'educator123')
            acessTokenEducator = resultEducatorAuth.body.access_token
            
            sleep = new SleepMock()
            sleep.child_id = child.id ? child.id : '' 

            otherSleep = new SleepMock()

        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('POST /users/children/:child_id/sleep', () => {
        context('when posting a new Sleep with success', () => {
            it('should return status code 201 and the saved Sleep', () => {

                return request(URI)
                    .post(`/users/children/${child.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(sleep.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(sleep.duration)
                        expect(res.body).to.have.property('pattern')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(sleep.child_id)
                        sleep.id = res.body.id
                    })
            })
        })

        context('when posting a new Sleep for a child passing an id non existent', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                const id = 'aaaaaaaaaaaaaaaaaaaaaaaa'             

                return request(URI)
                    .post(`/users/children/${id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(otherSleep.toJSON())
                    .expect(404)
            })
        })        
    })

    describe('GET /users/children/:child_id/sleep', () => {

        context('when get all sleep of a specific child of the database successfully', () => {
            it('should return status code 200 and a list of all sleep of that specific child', () => {
                
                return request(URI)
                    .get(`/users/children/${child.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(sleep.toJSON())
                    .expect(200)
                    .then(res => {
                        sleep.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        expect(res.body[0].id).to.eql(sleep.id)
                        expect(res.body[0].start_time).to.eql(sleep.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(sleep.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(sleep.duration)
                        expect(res.body[0]).to.have.property('pattern')
                        expect(res.body[0].child_id).to.eql(sleep.child_id)

                    })                    
            })
        })        

        context('when get all sleep of a specific child deleted of the database', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                before(async () => {
                    try {
                        deleteUserChild(child.id)
                    } catch (e) {
                        console.log('before error', e.message)
                    }
                })

                return request(URI)
                    .get(`/users/children/${child.id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(sleep.toJSON())
                    .expect(404)                    
            })
        })

        context('when to obtain all the Sleep of a child passing a non existent id', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                const id = 'aaaaaaaaaaaaaaaaaaaaaaaa'
                return request(URI)
                    .get(`/users/children/${id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(sleep.toJSON())
                    .expect(404)                    
            })
        })
    })
   // refazer 
    describe('PATCH /users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when this sleep to belong of a specific child deleted of the database', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {                  

                const body = {
                    name: otherSleep.start_time,
                    start_time: otherSleep.end_time,
                    duration: otherSleep.duration,
                    pattern: otherSleep.pattern,
                    child_id: child.id
                }    

                return request(URI)
                    .patch(`/users/children/${child.id}/sleep/${sleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(acessTokenEducator))                
                    .expect(404)
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

async function saveChild(institutionId?: string): Promise<Child> {
    const childSend = new ChildMock()
    if (childSend.institution) childSend.institution.id = institutionId

    return request(URI)
        .post('/users/children')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(childSend.toJSON())
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

async function deleteUserChild(childId?: string): Promise<Child> {
    return request(URI)
        .delete(`/users/${child.id}`)
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
}

*/