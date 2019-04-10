import request from 'supertest'
import { expect } from 'chai'
import { InstitutionMock } from './mocks/account-service/institution.mock'
import { Institution } from '../src/account-service/model/institution'
import { Child } from '../src/account-service/model/child'
import { ChildMock } from './mocks/account-service/child.mock'
import { ActivityTypeMock, PhysicalActivityMock } from './mocks/tracking-service/physical.activity.mock'

const URI = 'https://localhost'

let child: Child
let institution: Institution
let accessTokenAdmin: string
let accessTokenChild: string

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
        } catch (e) {
            console.log('before error', e.message)
        }
    })

    describe('POST /users/children/:child_id/physicalactivities', () => {
        context('when posting a new PhysicalActivity with success', () => {
            it('should return status code 201 and the saved PhysicalActivity', () => {
                const physicalActivity = new PhysicalActivityMock(ActivityTypeMock.RUN)
                physicalActivity.child_id = child.id ? child.id : ''

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
                    })
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

