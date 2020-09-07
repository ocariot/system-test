import request from 'supertest'
import {acc} from '../../utils/account.utils'
import {accountDB} from '../../../src/account-service/database/account.db'
import {foodDB} from '../../../src/quizzes/database/food.db'
import {Institution} from '../../../src/account-service/model/institution'
import {Child} from '../../../src/account-service/model/child'
import {ChildMock} from '../../mocks/account-service/child.mock'
import * as HttpStatus from 'http-status-codes'
import {Family} from "../../../src/account-service/model/family";
import {FamilyMock} from "../../mocks/account-service/family.mock";

describe('Routes: FoodHabits', () => {
    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessDefaultFamilyToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const defaultFamily: Family = new FamilyMock()

    before(async () => {
        try {
            await accountDB.connect()
            await foodDB.connect()

            accessTokenAdmin = await acc.getAdminToken()

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(defaultChild)

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

        } catch (err) {
            console.log('Failure on Before from foodhabits.post test: ', err)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await foodDB.removeCollections()
            await accountDB.dispose()
            await foodDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /foodqs', () => {

        afterEach(async () => {
            try {
                await foodDB.removeCollections()
            } catch (err) {
                console.log('Failure in foodhabits.post test: ', err.message)
            }
        })

        context('when the user posting a FoodHabits successfully', () => {

            it('foodqs.post001: should return status code 200 and the saved foodqs by the child user', () => {

                return request(URI)
                    .post('/foodqs')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send({})
                    .expect(HttpStatus.OK)
            })

        })
    })
})