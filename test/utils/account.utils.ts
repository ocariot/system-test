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

class AccountUtil {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081'
    public readonly NON_EXISTENT_ID: String = '111111111111111111111111'
    public readonly INVALID_ID: String = '123'
    public readonly INVALID_GENDER: Number = 1234
    public readonly NEGATIVE_AGE: Number = -11
    public readonly NON_EXISTENT_PASSWORD: string = 'non_existent_password'
    public readonly ADMIN_ID: string = '5d07dc2cdd61ed00356c5c3b'

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
            .post('/users/children')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(child.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public updateChild(accessToken: string, child: Child, body: any): Promise<any> {

        return request(this.URI)
            .patch(`/users/children/${child.id}`)
            .send(body)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveEducator(accessToken: string, educator: Educator): Promise<any> {

        return request(this.URI)
            .post('/users/educators')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(educator.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveFamily(accessToken: string, family: Family): Promise<any> {

        return request(this.URI)
            .post('/users/families')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(family.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveHealthProfessional(accessToken: string, healthprofessional: HealthProfessional): Promise<any> {

        return request(this.URI)
            .post('/users/healthprofessionals')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(healthprofessional.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveApplication(accessToken: string, application: Application): Promise<any> {

        return request(this.URI)
            .post('/users/applications')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(application.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveChildrenGroupsForEducator(accessToken: string, educator: Educator, children_group: ChildrenGroup): Promise<any> {

        return request(this.URI)
            .post(`/users/educators/${educator.id}/children/groups`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(children_group)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteChildrenGroupFromEducator(accessToken, educator: Educator, children_group: any): Promise<any> {

        return request(this.URI)
            .delete(`/users/educators/${educator.id}/children/groups/${children_group.id}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteUser(accessToken: string, user: any): Promise<any> {
        return request(this.URI)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public changeUserPass(userId: string, accessToken?: string): Promise<any> {
        return request(this.URI)
            .patch(`/users/${userId}/password`)
            .set('Authorization', 'Bearer '.concat(accessToken ? accessToken : ""))
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

            const child = new Child()
            child.username = 'Child01'
            child.age = 9
            child.institution = institution
            child.gender = 'male'
            child.password = 'child123'
            result.child = await this.saveChild(token_admin, child)

            const educator = new Educator()
            educator.username = 'Educator01'
            educator.password = 'educator123'
            educator.institution = institution
            result.educator = await this.saveEducator(token_admin, educator)

            const healthprofessional = new HealthProfessional()
            healthprofessional.username = 'HealthProfessional01'
            healthprofessional.password = 'healthprofessional123'
            healthprofessional.institution = institution
            result.health_professional = await this.saveHealthProfessional(
                token_admin, healthprofessional)

            const application = new Application()
            application.username = 'App01'
            application.password = 'app123'
            application.application_name = 'ApplicationName'
            application.institution = institution
            result.application = await this.saveApplication(token_admin, application)

            const children: Array<Child> = new Array()
            children.push(result.child)

            const family = new Family()
            family.username = 'Family01'
            family.password = 'family123'
            family.children = children
            family.institution = institution

            result.family = await this.saveFamily(token_admin, family)

            result.child.access_token = await this.auth(result.child.username, child.password)

            result.educator.access_token = await this.auth(result.educator.username, educator.password)

            result.health_professional.access_token = await this.auth(
                result.health_professional.username, healthprofessional.password)

            result.application.access_token = await this.auth(
                result.application.username, application.password)

            result.family.access_token = await this.auth(result.family.username, family.password)

            return Promise.resolve(result)
        } catch (err) {
            console.log('getAuths() - ERROR', err)
            return Promise.reject(err)
        }
    }
}

export const acc = new AccountUtil()