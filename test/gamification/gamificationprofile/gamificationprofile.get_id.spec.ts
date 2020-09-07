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
import {gamification} from "../../utils/gamification.utils";

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
    let gamificationProfileId: number;

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

            const resultGamificationProfile = await gamification.saveGamificationProfile(accessDefaultFamilyToken, {})
            gamificationProfileId = resultGamificationProfile.id
        } catch (err) {
            console.log('Failure on Before from gamificationprofiles.get test: ', err)
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

    describe('GET /gamificationprofiles/:gamificationprofiles.id', () => {

        afterEach(async () => {
            try {
                await gamificationDB.removeCollections()
            } catch (err) {
                console.log('Failure in gamificationprofiles.get test: ', err.message)
            }
        })

        context('when the user geting a GamificationProfiles successfully', () => {

            it('gamificationprofiles.get001: should return status code 200', () => {

                return request(URI)
                    .get(`/gamificationprofiles/${gamificationProfileId}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .expect(HttpStatus.OK)
            })
        })
    })
})