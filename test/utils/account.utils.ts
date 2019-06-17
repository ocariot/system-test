import request from 'supertest'
import { Institution } from '../../src/account-service/model/institution'
import { ChildMock } from '../mocks/account-service/child.mock'
import { EducatorMock } from '../mocks/account-service/educator.mock';
import { InstitutionMock } from '../mocks/account-service/institution.mock';
import { HealthProfessionalMock } from '../mocks/account-service/ family.repository.mock';
import { FamilyMock } from '../mocks/account-service/family.mock';
import { Child } from 'account-service/model/child';
import { ApplicationMock } from '../mocks/account-service/application.mock';

export class AccountUtil {

    private URI: String = 'https://localhost'
    public readonly NON_EXISTENT_ID: String = '111111111111111111111111'
    public readonly INVALID_ID: String = '123'

    public async auth(username: string, password: string): Promise<any> {

        return request(this.URI)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send({ 'username': username, 'password': password })
            .then(res => {
                return Promise.resolve(res.body.access_token)
            })
            .catch(err => {
                return Promise.reject(err)
            })
    }

    public saveInstitution(accessToken: string): Promise<Institution> {

        const institutionSend: Institution = new InstitutionMock()

        return request(this.URI)
            .post('/institutions')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(institutionSend)
            .then(res => {
                institutionSend.id = res.body.id
                return Promise.resolve(res.body)
            })
            .catch(err => {
                return Promise.reject(err)
            })
    }

    public saveTheInstitution(accessToken: string, institution: any): Promise<boolean> {
        
        return request(this.URI)
            .post('/institutions')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(institution)
            .then(res => {
                institution.id = res.body.id
                return Promise.resolve(true)
            })
            .catch(err => {
                return Promise.reject(false)
            })        
    }

    public saveChild(accessToken: string, institutionId: string, getPersonalData: boolean): Promise<any> {
        
        const childSend = new ChildMock()

        if(childSend.institution) childSend.institution.id = institutionId

        return request(this.URI)
            .post('/users/children')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(childSend.toJSON())
            .then(res => {
                if(getPersonalData) return Promise.resolve(childSend)
                return Promise.resolve(res.body)
                
            })
            .catch(err => {
                return Promise.reject(err)
            })
    }
  
    public saveEducator(accessToken: string, institutionId: string, getPersonalData: boolean): Promise<any> {
        
        const  educatorSend = new EducatorMock()

        if(educatorSend.institution) educatorSend.institution.id = institutionId

        return request(this.URI)
            .post('/users/educators')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(educatorSend.toJSON())
            .then(res => {
                if(getPersonalData) return Promise.resolve(educatorSend)
                return Promise.resolve(res.body)
            })
            .catch(err => {
                return Promise.reject(err)
            })                     
    }

    public saveHealthProfessional(accessToken: string, institutionId: string, getPersonalData: boolean): Promise<any> {
        
        const HealthProfessioanSend = new HealthProfessionalMock()

        if(HealthProfessioanSend.institution) HealthProfessioanSend.institution.id = institutionId

        return request(this.URI)
            .post('/users/healthprofessionals')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(HealthProfessioanSend.toJSON())
            .then(res => {
                if(getPersonalData) return Promise.resolve(HealthProfessioanSend)
                return Promise.resolve(res.body)
                
            })
            .catch(err => {
                return Promise.reject(err)
            })                     
    }
    
    public saveFamily(accessToken: string, institutionId: string, child: Child, getPersonalData: boolean): Promise<any> {
        
        const familySend = new FamilyMock()

        if(familySend.institution) familySend.institution.id = institutionId
        if(familySend.children) familySend.children.push(child)

        return request(this.URI)
            .post('/users/families')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(familySend.toJSON())
            .then(res => {
                if(getPersonalData) return Promise.resolve(familySend)
                return Promise.resolve(res.body)
                
            })
            .catch(err => {
                return Promise.reject(err)
            })                     
    }

    public saveApplication(accessToken: string, institutionId: string, getPersonalData: boolean): Promise<any> {
        
        const  appSend = new ApplicationMock()

        if(appSend.institution) appSend.institution.id = institutionId

        return request(this.URI)
            .post('/users/applications')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(appSend.toJSON())
            .then(res => {
                if(getPersonalData) return Promise.resolve(appSend)
                return Promise.resolve(res.body)
                
            })
            .catch(err => {
                return Promise.reject(err)
            })                     
    }    

    public deleteUser(userId: string, accessToken: string): Promise<any> {
        return request(this.URI)
            .delete(`/users/${userId}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
    }  
    
    public changeUserPass(userId: string, accessToken?: string): Promise<any> {
        return request(this.URI)
            .patch(`/users/${userId}/password`)
            .set('Authorization', 'Bearer '.concat(accessToken? accessToken : ""))
            .set('Content-Type', 'application/json')            
    }
}