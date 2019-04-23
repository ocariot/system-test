import request from 'supertest'
import { expect } from 'chai'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
import { Child } from '../src/account-service/model/child'
//import { Educator } from '../src/account-service/model/educator'
import { ChildMock } from './mocks/account-service/child.mock'
//import { EducatorMock } from './mocks/account-service/educator.mock'
import { ActivityTypeMock, PhysicalActivityMock } from './mocks/tracking-service/physical.activity.mock'
import { PhysicalActivity } from '../src/tracking-service/model/physical.activity';
//import { Activity } from '../src/tracking-service/model/activity';

const URI = 'https://localhost'

let child: Child //deletada no teste para listar atividades da criança deletada
//let educator: Educator
let physicalActivity: PhysicalActivity
//let otherActivity: PhysicalActivity
let institution: Institution
let accessTokenAdmin: string
let accessTokenChild: string
//let acessTokenEducator: string

describe('Routes: users.children.physicalactivities', () => {

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

            //const resultEducator: any = await saveEducator(institution.id)
            //educator = new Educator().fromJSON(resultEducator.body)

            //const resultEducatorAuth: any = await auth(educator.username, 'educator123')
            //acessTokenEducator = resultEducatorAuth.body.access_token   
            
            physicalActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)
            physicalActivity.child_id = child.id ? child.id : ''            

        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('POST /users/children/:child_id/physicalactivities', () => {
        context('when posting a new PhysicalActivity with success', () => {
            it('should return status code 201 and the saved PhysicalActivity', () => {

                return request(URI)
                    .post(`/users/children/${child.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(physicalActivity.toJSON())
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(physicalActivity.name)
                        expect(res.body.start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(physicalActivity.duration)
                        expect(res.body.calories).to.eql(physicalActivity.calories)
                        if (physicalActivity.steps) expect(res.body.steps).to.eql(physicalActivity.steps)
                        if (physicalActivity.levels) expect(res.body).to.have.property('levels')
                        expect(res.body.child_id).to.eql(physicalActivity.child_id)
                        physicalActivity.id = res.body.id
                    })
            })
        })

        context('when posting a new Physical Activity for a child passing an id non existent', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                const id = 'aaaaaaaaaaaaaaaaaaaaaaaa'
                const body = {
                    name: physicalActivity.name,
                    start_time: physicalActivity.start_time,
                    end_time: physicalActivity.end_time,
                    duration: physicalActivity.duration,
                    calories: physicalActivity.calories,
                    steps: physicalActivity.steps ? physicalActivity.steps : undefined,
                    levels: physicalActivity.levels ? physicalActivity.levels : undefined                    
                }

                return request(URI)
                    .post(`/users/children/${id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .send(body)
                    .expect(404)
            })
        })
    })

    describe('GET /users/children/:child_id/physicalactivities', () => {
        context('when get all physical activity of a specific child of the database successfully', () => {                        
            it('should return status code 200 and a list of all physical activity of that specific child', () => {
                
                return request(URI)
                    .get(`/users/children/${child.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        expect(res.body[0].id).to.eql(physicalActivity.id)
                        expect(res.body[0].name).to.eql(physicalActivity.name)
                        expect(res.body[0].start_time).to.eql(physicalActivity.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(physicalActivity.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(physicalActivity.duration)
                        expect(res.body[0].calories).to.eql(physicalActivity.calories)
                        if (res.body[0].steps) {
                            expect(res.body[0].steps).to.eql(physicalActivity.steps)
                        }
                        if (physicalActivity.levels) {
                            expect(res.body[0]).to.have.property('levels')
                        }
                        expect(res.body[0].child_id).to.eql(physicalActivity.child_id)
                        
                    })                 
            })
        })

        context('when get all physical activity of a specific child deleted of the database', () => {
            
            before(async () => {
                try {
                    deleteUserChild(child.id)
                } catch (e) {
                    console.log('before error', e.message)
                }
            })
                        
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                return request(URI)
                    .get(`/users/children/${child.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(404)                    
            })
        })

        context('when to obtain all the physical activity of a child passing a non existent id', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {
                
                const id = 'aaaaaaaaaaaaaaaaaaaaaaaa'
                
                return request(URI)
                    .get(`/users/children/${id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(404)                    
            })
        })
        
        /*context('when to obtain all the physical activity of a child who belonged to a deleted institution', () => {
            let anotherChild:Child
            let anotherInstitution: Institution
            let anotherActivity: PhysicalActivity
            before(async () => {
                try{
                    const resultInstitution: any = await saveInstitution()
                    anotherInstitution = new Institution().fromJSON(resultInstitution.body)
        
                    const resultChild: any = await saveChild(anotherInstitution.id)
                    anotherChild = new Child().fromJSON(resultChild.body)
        
                    const resultChildAuth: any = await auth(anotherChild.username, 'child123')
                    accessTokenChild = resultChildAuth.body.access_token
                    
                    const resultPhysicalActivite: any = await savePhysicalActivitie()
                    anotherActivity = new PhysicalActivity().fromJSON(resultPhysicalActivite)
                    anotherActivity.child_id = anotherChild.id ? anotherChild.id : ''

                } catch(e){
                    
                }
            })

            it('should return status code 404 and an info message describing that child was not found', () => {
                
                console.log('AF = ', anotherActivity) 

                return request(URI)
                    .get(`/users/children/${anotherChild.id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .expect(200)                    
            })
        })*/        
    })     

    describe('PATCH /users/children/:child_id/physicalactivities/:physicalactivity_id', () => {

        /*context('when this physical activity exists in the database and is updated successfully', () => {
            it('should return status code 200 and the updated physical activity', () => {                  

                otherActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)

                const body = {
                    name: otherActivity.name,
                    start_time: otherActivity.start_time,
                    end_time: otherActivity.end_time,
                    duration: otherActivity.duration,
                    calories: otherActivity.calories,
                    steps: otherActivity.steps ? otherActivity.steps: undefined,
                    levels: otherActivity.levels ? otherActivity.levels: undefined,
                    child_id: child.id
                }    

                return request(URI)
                    .patch(`/users/children/${child.id}/physicalactivities/${physicalActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(acessTokenEducator))                
                    .expect(404)
        })*/

        /*context('when this physical activity to belong of a specific child deleted of the database', () => {
            it('should return status code 404 and an info message describing that child was not found', () => {                  

                otherActivity = new PhysicalActivityMock(ActivityTypeMock.WALK)

                const body = {
                    name: otherActivity.name,
                    start_time: otherActivity.start_time,
                    end_time: otherActivity.end_time,
                    duration: otherActivity.duration,
                    calories: otherActivity.calories,
                    steps: otherActivity.steps ? otherActivity.steps: undefined,
                    levels: otherActivity.levels ? otherActivity.levels: undefined,
                    child_id: child.id
                }    

                return request(URI)
                    .patch(`/users/children/${child.id}/physicalactivities/${physicalActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(acessTokenEducator))                
                    .expect(404)
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
        .delete(`/users/${child.id}`)
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
}
/*
async function saveEducator(institutionId?: string): Promise<Educator> {
    const educatorSend = new EducatorMock()
    if(educatorSend.institution) educatorSend.institution.id = institutionId

    return request(URI)
        .post('/users/educators')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(educatorSend.toJSON())
}

async function savePhysicalActivitie(childId?: string){

    return request(URI)
        .post(`/users/children/${childId}/physicalactivities`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer '.concat(accessTokenChild))
        .send(new PhysicalActivityMock().toJSON())
}
*/