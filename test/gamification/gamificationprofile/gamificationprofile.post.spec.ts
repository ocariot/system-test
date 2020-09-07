import request from 'supertest'
import {acc} from '../../utils/account.utils'
import {accountDB} from '../../../src/account-service/database/account.db'
import {Institution} from '../../../src/account-service/model/institution'
import {Child} from '../../../src/account-service/model/child'
import {ChildMock} from '../../mocks/account-service/child.mock'
import * as HttpStatus from 'http-status-codes'
import {Family} from "../../../src/account-service/model/family";
import {FamilyMock} from "../../mocks/account-service/family.mock";
import {gamificationDB} from "../../../src/quizzes/database/gamification";

describe('Routes: GamificationProfiles', () => {
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
            await gamificationDB.connect()

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
            console.log('Failure on Before from gamificationprofiles.post test: ', err)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await gamificationDB.removeCollections()
            await accountDB.dispose()
            await gamificationDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /gamificationprofiles', () => {

        afterEach(async () => {
            try {
                await gamificationDB.removeCollections()
            } catch (err) {
                console.log('Failure in gamificationprofiles.post test: ', err.message)
            }
        })

        context('when the user posting a GamificationProfiles successfully', () => {

            it('gamificationprofiles.post001: should return status code 200', () => {

                return request(URI)
                    .post('/gamificationprofiles')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send({})
                    .expect(HttpStatus.OK)
                    .then(result => console.log(result.body))
            })

        })
    })
})