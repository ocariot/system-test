import request from 'supertest'
import {expect} from 'chai'
import {Institution} from '../../../src/account-service/model/institution'
import {acc} from '../../utils/account.utils'
import {accountDB} from '../../../src/account-service/database/account.db'
import {Child} from "../../../src/account-service/model/child";
import {ChildMock} from "../../mocks/account-service/child.mock";

describe('Routes: notifications.deletetoken', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessTokenChild: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const token: string = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAzNDM3MzUsInNjb3BlcyI6Indwcm8gd2xvYyB3bnV0IHdzbGUgd3NldCB3aHIgd3dlaSB3YWN0IHdzb2MiLCJzdWIiOiJBQkNERUYiLCJhdWQiOiJJSktMTU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE0MzAzNDAxMzV9.z0VHrIEzjsBnjiNMBey6wtu26yHTnSWz_qlqoEpUlpc"
    const body = { token }

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token

            await accountDB.removeCollections()

            const resultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultInstitution.id

            defaultChild.institution = defaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id

        } catch (err) {
            console.log('Failure on Before from notifications.deletetoken.user_id test: ', err)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await accountDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('PATCH //notifications/deletetoken/:user_id', async () => {

        describe('when delete a notification successfully', () => {
            it('notifications.deletetoken.delete_id001: should return status code 204 and no content', () => {

                return request(URI)
                    .patch(`/notifications/deletetoken/${defaultChild.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('code')
                        expect(res.body).to.have.property('description')
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('redirect_link')
                    })
            })
        })

        describe('when the user_id is invalid', () => {
            it('notifications.deletetoken.delete_id002: should return status code 200 and info description message is "User not found"', () => {

                const INVALID_ID = '5f343336bf8b2d0019a8f091'

                return request(URI)
                    .patch(`/notifications/deletetoken/${INVALID_ID}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('code')
                        expect(res.body).to.have.property('description')
                        expect(res.body.description).to.eql('User not found')
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('redirect_link')
                    })
            })
        })

    })
})