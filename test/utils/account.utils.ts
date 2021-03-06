import request from 'supertest'
import { Institution } from '../../src/account-service/model/institution'
import { InstitutionMock } from '../mocks/account-service/institution.mock'
import { Child } from '../../src/account-service/model/child'
import { Family } from '../../src/account-service/model/family'
import { Educator } from '../../src/account-service/model/educator'
import { HealthProfessional } from '../../src/account-service/model/health.professional'
import { Application } from '../../src/account-service/model/application'
import jwtDecode from 'jwt-decode'
import { ChildrenGroup } from 'account-service/model/children.group';
import { ChildMock } from '../mocks/account-service/child.mock'
import { EducatorMock } from '../mocks/account-service/educator.mock'
import { HealthProfessionalMock } from '../mocks/account-service/healthprofessional.mock'
import { ApplicationMock } from '../mocks/account-service/application.mock'
import { FamilyMock } from '../mocks/account-service/family.mock'

class AccountUtil {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    // Retirar
    public readonly NON_EXISTENT_ID: string = '111111111111111111111111'
    public readonly INVALID_ID: string = '123'

    public async auth(username: string, password: string): Promise<any> {

        return request(this.URI)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send({ 'username': username, 'password': password })
            .then(res => {
                return Promise.resolve(res.body.access_token)
            })
            .catch(err => {
                console.log('ERRRO: ', err)
                return Promise.reject(err)
            })
    }

    public getAdminToken() {
        return this.auth(
            process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
            process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')
    }

    public async getAdminID() {
        const token = await this.getAdminToken()
        return jwtDecode(token).sub
    }

    public saveInstitution(accessToken: string, institution: Institution): Promise<any> {

        return request(this.URI)
            .post('/institutions')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(institution.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveChild(accessToken: string, child: Child): Promise<any> {

        return request(this.URI)
            .post('/children')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(child.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public updateChild(accessToken: string, child: Child, body: any): Promise<any> {

        return request(this.URI)
            .patch(`/children/${child.id}`)
            .send(body)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveEducator(accessToken: string, educator: Educator): Promise<any> {

        return request(this.URI)
            .post('/educators')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(educator.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveFamily(accessToken: string, family: Family): Promise<any> {

        return request(this.URI)
            .post('/families')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(family.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public associateChildWithFamily(accessToken: string, family_ID?: string, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/families/${family_ID}/children/${child_ID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public dissociateChildWithFamily(accessToken: string, family_ID?: string, child_ID?: string): Promise<any> {

        return request(this.URI)
            .delete(`/families/${family_ID}/children/${child_ID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveHealthProfessional(accessToken: string, healthprofessional: HealthProfessional): Promise<any> {

        return request(this.URI)
            .post('/healthprofessionals')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(healthprofessional.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveApplication(accessToken: string, application: Application): Promise<any> {

        return request(this.URI)
            .post('/applications')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(application.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveChildrenGroupsForEducator(accessToken: string, educator: Educator, children_group: ChildrenGroup): Promise<any> {

        return request(this.URI)
            .post(`/educators/${educator.id}/children/groups`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(children_group)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveChildrenGroupsForHealthProfessional(accessToken: string, healthprofessional: HealthProfessional, children_group: ChildrenGroup): Promise<any> {

        return request(this.URI)
            .post(`/healthprofessionals/${healthprofessional.id}/children/groups`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(children_group)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteChildrenGroupFromEducator(accessToken: string, educator: Educator, children_group: ChildrenGroup): Promise<any> {

        return request(this.URI)
            .delete(`/educators/${educator.id}/children/groups/${children_group.id}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteChildrenGroupFromHealthProfessional(accessToken: string, healthprofessional: HealthProfessional, children_group: ChildrenGroup): Promise<any> {

        return request(this.URI)
            .delete(`/healthprofessionals/${healthprofessional.id}/children/groups/${children_group.id}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteUser(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .delete(`/users/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public changeUserPass(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .put(`/users/${userID}/password`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public getChildById(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .get(`/children/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public getApplicationById(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .get(`/applications/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public getEducatorById(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .get(`/educators/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public getFamilyById(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .get(`/families/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public getHealthProfessionalById(accessToken: string, userID?: string): Promise<any> {
        return request(this.URI)
            .get(`/healthprofessionals/${userID}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public async getAuths(): Promise<any> {
        const result: any = {
            institution: {},
            admin: {},
            child: {},
            family: {},
            educator: {},
            health_professional: {},
            application: {}
        }
        try {
            const token_admin: string = await this.auth(
                process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : 'admin',
                process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : 'admin123')

            result.admin.access_token = token_admin
            result.institution = await this.saveInstitution(token_admin, new InstitutionMock())
            const institution = new Institution().fromJSON(result.institution)

            const child = new ChildMock()
            child.institution = institution
            result.child = await this.saveChild(token_admin, child)

            const educator = new EducatorMock()
            educator.institution = institution
            result.educator = await this.saveEducator(token_admin, educator)

            const healthprofessional = new HealthProfessionalMock()
            healthprofessional.institution = institution
            result.health_professional = await this.saveHealthProfessional(token_admin, healthprofessional)

            const application = new ApplicationMock()
            application.institution = institution
            result.application = await this.saveApplication(token_admin, application)

            const children: Array<Child> = new Array()
            children.push(result.child)

            const family = new FamilyMock()
            family.institution = institution
            family.children = children

            result.family = await this.saveFamily(token_admin, family)

            result.child.access_token = await this.auth(result.child.username, child.password!)

            result.educator.access_token = await this.auth(result.educator.username, educator.password!)

            result.health_professional.access_token = await this.auth(
                result.health_professional.username, healthprofessional.password!)

            result.application.access_token = await this.auth(
                result.application.username, application.password!)

            result.family.access_token = await this.auth(result.family.username, family.password!)

            return Promise.resolve(result)
        } catch (err) {
            console.log('getAuths() - ERROR', err.message)
            return Promise.reject(err)
        }
    }
}

export const acc = new AccountUtil()