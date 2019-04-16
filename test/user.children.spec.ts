import request from 'supertest'
//import { expect } from 'chai'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
import { Child } from '../src/account-service/model/child'
import { Application } from '../src/account-service/model/application'
import { Family } from '../src/account-service/model/family'
import { HealthProfessional } from '../src/account-service/model/health.professional'
import { Educator } from '../src/account-service/model/educator'
import { ChildMock } from './mocks/account-service/child.mock'
import { ApplicationMock } from './mocks/account-service/application.mock'
import { FamilyMock } from './mocks/account-service/family.mock'
import { EducatorMock } from './mocks/account-service/educator.mock'

const URI = 'https://localhost'

let application: Application
let child: Child
let educator: Educator
let family: Family
let institution: Institution
let healthProfessional: HealthProfessional
let accessTokenAdmin: string

describe('Routes: users.children.physicalactivities', () => {

    before(async () => {
        try {
            
            const resultAuth: any = await auth('admin', 'admin123')
            accessTokenAdmin = resultAuth.body.access_token

            const resultInstitution: any = await saveInstitution()
            institution = new Institution().fromJSON(resultInstitution.body)

            const resultApplication: any = await saveApplication(institution.id)
            application = new Application().fromJSON(resultApplication.body)

            const resultChild: any = await saveChild(institution.id)
            child = new Child().fromJSON(resultChild.body)

            const resultEducator: any = await saveEducator(institution.id)
            educator = new Educator().fromJSON(resultEducator.body)

            const resultHealthProfessional: any = await saveHealthProfessional(institution.id)
            healthProfessional = new HealthProfessional().fromJSON(resultHealthProfessional.body)

            const resultFamily: any = await saveFamily(institution.id)
            family = new Family().fromJSON(resultFamily.body)
            
        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('PATCH /users/:user_id/password', () => {
        context('when the password update was successful', () => {
            it('should return status code 204 and no content', () => {
                console.log(family)
                console.log(application)
                console.log(child)
                console.log(educator)
                console.log(healthProfessional)
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

async function saveChild(institutionId?: string): Promise<Child> {
    const childSend = new ChildMock()
    if (childSend.institution) childSend.institution.id = institutionId

    return request(URI)
        .post('/users/children')
        .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
        .set('Content-Type', 'application/json')
        .send(childSend.toJSON())
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

