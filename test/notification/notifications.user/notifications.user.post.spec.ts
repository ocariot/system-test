import request from 'supertest'
import {expect} from 'chai'
import {Institution} from '../../../src/account-service/model/institution'
import {acc} from '../../utils/account.utils'
import {accountDB} from '../../../src/account-service/database/account.db'
import {Child} from "../../../src/account-service/model/child";
import {ChildMock} from "../../mocks/account-service/child.mock";

describe('Routes: notifications.user', () => {

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
    const body = {
        token,
        lang: "pt",
        type: "family"
    }

    before(async () => {
        try {
            await accountDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token
            accessTokenChild = tokens.child.access_token

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

    describe('POST //notifications/user/:user_id', async () => {

        describe('when create a notification successfully', () => {
            it('notifications.user.post_id001: should return status code 200 and no content', () => {
                console.log(`${URI}/notifications/user/${defaultChild.id}`)
                return request(URI)
                    .post(`/notifications/user/${defaultChild.id}`)
                    .send(body)
                    .set('Authorization', 'Bearer '.concat(accessTokenChild))
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('lang')
                        expect(res.body).to.have.property('lastLogin')
                        expect(res.body).to.have.property('tokens')
                        expect(res.body).to.have.property('type')
                    })
            })
        })
    })
})