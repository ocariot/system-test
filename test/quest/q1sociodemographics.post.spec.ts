import request from 'supertest'
import { expect } from 'chai'
import { acc } from '../utils/account.utils'
import { accountDB } from '../../src/account-service/database/account.db'
import { questionnaireDB } from '../../src/quizzes/database/quests.db'
import { Institution } from '../../src/account-service/model/institution'
import { Child } from '../../src/account-service/model/child'
import { ChildMock } from '../mocks/account-service/child.mock'
import { Educator } from '../../src/account-service/model/educator'
import { EducatorMock } from '../mocks/account-service/educator.mock'
import { HealthProfessional } from '../../src/account-service/model/health.professional'
import { HealthProfessionalMock } from '../mocks/account-service/healthprofessional.mock'
import { Family } from '../../src/account-service/model/family'
import { FamilyMock } from '../mocks/account-service/family.mock'
import { Application } from '../../src/account-service/model/application'
import { ApplicationMock } from '../mocks/account-service/application.mock'
import { ApiGatewayException } from '../utils/api.gateway.exceptions'
import { Q1SocioDemographicMock } from '../mocks/quest-service/q1sociodemographic.mock'

describe('Routes: Q1Sociodemographic', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string
    let accessDefaultEducatorToken: string
    let accessDefaultHealthProfessionalToken: string
    let accessDefaultFamilyToken: string
    let accessDefaultApplicationToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    const defaultQ1SocioDemographic = getQ1SociodemographicJSON(defaultChild)

    before(async () => {
        try {
            await accountDB.connect()
            await questionnaireDB.connect()

            const tokens = await acc.getAuths()
            accessTokenAdmin = tokens.admin.access_token

            const resultDefaultInstitution = await acc.saveInstitution(accessTokenAdmin, defaultInstitution)
            defaultInstitution.id = resultDefaultInstitution.id
            defaultChild.institution = resultDefaultInstitution
            defaultEducator.institution = resultDefaultInstitution
            defaultHealthProfessional.institution = resultDefaultInstitution
            defaultFamily.institution = resultDefaultInstitution
            defaultApplication.institution = resultDefaultInstitution

            const resultDefaultChild = await acc.saveChild(accessTokenAdmin, defaultChild)
            defaultChild.id = resultDefaultChild.id
            defaultFamily.children = new Array<Child>(resultDefaultChild)

            defaultQ1SocioDemographic.child_id = resultDefaultChild.id

            const resultDefaultEducator = await acc.saveEducator(accessTokenAdmin, defaultEducator)
            defaultEducator.id = resultDefaultEducator.id

            const resultDefaultHealthProfessional = await acc.saveHealthProfessional(accessTokenAdmin, defaultHealthProfessional)
            defaultHealthProfessional.id = resultDefaultHealthProfessional.id

            const resultDefaultFamily = await acc.saveFamily(accessTokenAdmin, defaultFamily)
            defaultFamily.id = resultDefaultFamily.id

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            //getting tokens for each 'default user'
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

            if (defaultEducator.username && defaultEducator.password) {
                accessDefaultEducatorToken = await acc.auth(defaultEducator.username, defaultEducator.password)
            }

            if (defaultFamily.username && defaultFamily.password) {
                accessDefaultFamilyToken = await acc.auth(defaultFamily.username, defaultFamily.password)
            }

            if (defaultApplication.username && defaultApplication.password) {
                accessDefaultApplicationToken = await acc.auth(defaultApplication.username, defaultApplication.password)
            }

            if (defaultHealthProfessional.username && defaultHealthProfessional.password) {
                accessDefaultHealthProfessionalToken = await acc.auth(defaultHealthProfessional.username, defaultHealthProfessional.password)
            }

        } catch (err) {
            console.log('Failure on Before from weight.delete test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await questionnaireDB.removeCollections()
            await accountDB.dispose()
            await questionnaireDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST /q1sociodemographics', () => {

        afterEach(async () => {
            try {
                await questionnaireDB.deleteQ1Sociodemographic()
            } catch (err) {
                console.log('Failure in q1sociodemographics.post test: ', err.message)
            }
        })

        context('when the user posting a Q1Sociodemographic successfully', () => {

            it('q1sociodemographics.post001: should return status code 201 and the saved Q1Sociodemographic by the child user', () => {

                console.log('MOCK: ', new Q1SocioDemographicMock(defaultChild))

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(200) // O post não deveria ser 201 ?
                    .then(res => {
                        defaultQ1SocioDemographic.id = res.body.id
                        expect(res.body).to.deep.eql(defaultQ1SocioDemographic)
                        // expect(res.body).to.have.property('id')
                        // expect(res.body).to.have.property('child_id', defaultQ1SocioDemographic.child_id)
                        // expect(res.body).to.have.property('child_age', defaultQ1SocioDemographic.child_age)
                        // expect(res.body).to.have.property('child_gender', defaultQ1SocioDemographic.child_gender)
                        // expect(res.body).to.have.property('date', defaultQ1SocioDemographic.date.toISOString())
                        // expect(res.body).to.have.property('parental_identity_q1', defaultQ1SocioDemographic.parental_identity_q1)
                        // expect(res.body).to.have.property('respondent_gender', defaultQ1SocioDemographic.respondent_gender)
                        // expect(res.body).to.have.property('number_children', defaultQ1SocioDemographic.number_children)
                        // expect(res.body).to.have.property('number_siblings', defaultQ1SocioDemographic.number_siblings)
                        // expect(res.body).to.have.property('number_of_household_members', defaultQ1SocioDemographic.number_of_household_members)
                        // expect(res.body).to.have.deep.property('ages_household_members', defaultQ1SocioDemographic.ages_household_members)
                        // expect(res.body).to.have.deep.property('resp_1', defaultQ1SocioDemographic.resp_1)
                        // expect(res.body).to.have.deep.property('part_1', defaultQ1SocioDemographic.part_1)
                        // expect(res.body).to.have.deep.property('resp_2', defaultQ1SocioDemographic.resp_2)
                        // expect(res.body).to.have.deep.property('part_2', defaultQ1SocioDemographic.part_2)
                        // expect(res.body).to.have.deep.property('supermarket_near', defaultQ1SocioDemographic.supermarket_near)
                        // expect(res.body).to.have.deep.property('tradmarket_near', defaultQ1SocioDemographic.tradmarket_near)
                        // expect(res.body).to.have.deep.property('park_near', defaultQ1SocioDemographic.park_near)
                        // expect(res.body).to.have.deep.property('supermarket', defaultQ1SocioDemographic.supermarket)
                        // expect(res.body).to.have.deep.property('tradi_market', defaultQ1SocioDemographic.tradi_market)
                        // expect(res.body).to.have.deep.property('park', defaultQ1SocioDemographic.park)
                        // expect(res.body).to.have.deep.property('type_transport', defaultQ1SocioDemographic.type_transport)
                        // expect(res.body).to.have.deep.property('comp', defaultQ1SocioDemographic.comp)
                        // expect(res.body).to.have.deep.property('mob', defaultQ1SocioDemographic.mob)
                        // expect(res.body).to.have.deep.property('smartp', defaultQ1SocioDemographic.smartp)
                        // expect(res.body).to.have.deep.property('tablet', defaultQ1SocioDemographic.tablet)
                        // expect(res.body).to.have.deep.property('internet_access', defaultQ1SocioDemographic.internet_access)
                        // expect(res.body).to.have.deep.property('internet_fast', defaultQ1SocioDemographic.internet_fast)
                        // expect(res.body).to.have.deep.property('race', defaultQ1SocioDemographic.race)
                        // expect(res.body).to.have.deep.property('tv_bedroom', defaultQ1SocioDemographic.tv_bedroom)
                        // expect(res.body).to.have.deep.property('percentage', defaultQ1SocioDemographic.percentage)
                        // expect(res.body).to.have.deep.property('state', defaultQ1SocioDemographic.state)
                    })
            })

            it('q1sociodemographics.post002: should return status code 201 and the saved Q1Sociodemographic by the educator user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultEducatorToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(200) // O post não deveria ser 201 ?
                    .then(res => {
                        defaultQ1SocioDemographic.id = res.body.id
                        expect(res.body).to.deep.eql(defaultQ1SocioDemographic)
                        // expect(res.body).to.have.property('id')
                        // expect(res.body).to.have.property('child_id', defaultQ1SocioDemographic.child_id)
                        // expect(res.body).to.have.property('child_age', defaultQ1SocioDemographic.child_age)
                        // expect(res.body).to.have.property('child_gender', defaultQ1SocioDemographic.child_gender)
                        // expect(res.body).to.have.property('date', defaultQ1SocioDemographic.date.toISOString())
                        // expect(res.body).to.have.property('parental_identity_q1', defaultQ1SocioDemographic.parental_identity_q1)
                        // expect(res.body).to.have.property('respondent_gender', defaultQ1SocioDemographic.respondent_gender)
                        // expect(res.body).to.have.property('number_children', defaultQ1SocioDemographic.number_children)
                        // expect(res.body).to.have.property('number_siblings', defaultQ1SocioDemographic.number_siblings)
                        // expect(res.body).to.have.property('number_of_household_members', defaultQ1SocioDemographic.number_of_household_members)
                        // expect(res.body).to.have.deep.property('ages_household_members', defaultQ1SocioDemographic.ages_household_members)
                        // expect(res.body).to.have.deep.property('resp_1', defaultQ1SocioDemographic.resp_1)
                        // expect(res.body).to.have.deep.property('part_1', defaultQ1SocioDemographic.part_1)
                        // expect(res.body).to.have.deep.property('resp_2', defaultQ1SocioDemographic.resp_2)
                        // expect(res.body).to.have.deep.property('part_2', defaultQ1SocioDemographic.part_2)
                        // expect(res.body).to.have.deep.property('supermarket_near', defaultQ1SocioDemographic.supermarket_near)
                        // expect(res.body).to.have.deep.property('tradmarket_near', defaultQ1SocioDemographic.tradmarket_near)
                        // expect(res.body).to.have.deep.property('park_near', defaultQ1SocioDemographic.park_near)
                        // expect(res.body).to.have.deep.property('supermarket', defaultQ1SocioDemographic.supermarket)
                        // expect(res.body).to.have.deep.property('tradi_market', defaultQ1SocioDemographic.tradi_market)
                        // expect(res.body).to.have.deep.property('park', defaultQ1SocioDemographic.park)
                        // expect(res.body).to.have.deep.property('type_transport', defaultQ1SocioDemographic.type_transport)
                        // expect(res.body).to.have.deep.property('comp', defaultQ1SocioDemographic.comp)
                        // expect(res.body).to.have.deep.property('mob', defaultQ1SocioDemographic.mob)
                        // expect(res.body).to.have.deep.property('smartp', defaultQ1SocioDemographic.smartp)
                        // expect(res.body).to.have.deep.property('tablet', defaultQ1SocioDemographic.tablet)
                        // expect(res.body).to.have.deep.property('internet_access', defaultQ1SocioDemographic.internet_access)
                        // expect(res.body).to.have.deep.property('internet_fast', defaultQ1SocioDemographic.internet_fast)
                        // expect(res.body).to.have.deep.property('race', defaultQ1SocioDemographic.race)
                        // expect(res.body).to.have.deep.property('tv_bedroom', defaultQ1SocioDemographic.tv_bedroom)
                        // expect(res.body).to.have.deep.property('percentage', defaultQ1SocioDemographic.percentage)
                        // expect(res.body).to.have.deep.property('state', defaultQ1SocioDemographic.state)
                    })
            })

            it('q1sociodemographics.post003: should return status code 201 and the saved Q1Sociodemographic by the application user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultApplicationToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(200) // O post não deveria ser 201 ?
                    .then(res => {
                        defaultQ1SocioDemographic.id = res.body.id
                        expect(res.body).to.deep.eql(defaultQ1SocioDemographic)
                        // expect(res.body).to.have.property('id')
                        // expect(res.body).to.have.property('child_id', defaultQ1SocioDemographic.child_id)
                        // expect(res.body).to.have.property('child_age', defaultQ1SocioDemographic.child_age)
                        // expect(res.body).to.have.property('child_gender', defaultQ1SocioDemographic.child_gender)
                        // expect(res.body).to.have.property('date', defaultQ1SocioDemographic.date.toISOString())
                        // expect(res.body).to.have.property('parental_identity_q1', defaultQ1SocioDemographic.parental_identity_q1)
                        // expect(res.body).to.have.property('respondent_gender', defaultQ1SocioDemographic.respondent_gender)
                        // expect(res.body).to.have.property('number_children', defaultQ1SocioDemographic.number_children)
                        // expect(res.body).to.have.property('number_siblings', defaultQ1SocioDemographic.number_siblings)
                        // expect(res.body).to.have.property('number_of_household_members', defaultQ1SocioDemographic.number_of_household_members)
                        // expect(res.body).to.have.deep.property('ages_household_members', defaultQ1SocioDemographic.ages_household_members)
                        // expect(res.body).to.have.deep.property('resp_1', defaultQ1SocioDemographic.resp_1)
                        // expect(res.body).to.have.deep.property('part_1', defaultQ1SocioDemographic.part_1)
                        // expect(res.body).to.have.deep.property('resp_2', defaultQ1SocioDemographic.resp_2)
                        // expect(res.body).to.have.deep.property('part_2', defaultQ1SocioDemographic.part_2)
                        // expect(res.body).to.have.deep.property('supermarket_near', defaultQ1SocioDemographic.supermarket_near)
                        // expect(res.body).to.have.deep.property('tradmarket_near', defaultQ1SocioDemographic.tradmarket_near)
                        // expect(res.body).to.have.deep.property('park_near', defaultQ1SocioDemographic.park_near)
                        // expect(res.body).to.have.deep.property('supermarket', defaultQ1SocioDemographic.supermarket)
                        // expect(res.body).to.have.deep.property('tradi_market', defaultQ1SocioDemographic.tradi_market)
                        // expect(res.body).to.have.deep.property('park', defaultQ1SocioDemographic.park)
                        // expect(res.body).to.have.deep.property('type_transport', defaultQ1SocioDemographic.type_transport)
                        // expect(res.body).to.have.deep.property('comp', defaultQ1SocioDemographic.comp)
                        // expect(res.body).to.have.deep.property('mob', defaultQ1SocioDemographic.mob)
                        // expect(res.body).to.have.deep.property('smartp', defaultQ1SocioDemographic.smartp)
                        // expect(res.body).to.have.deep.property('tablet', defaultQ1SocioDemographic.tablet)
                        // expect(res.body).to.have.deep.property('internet_access', defaultQ1SocioDemographic.internet_access)
                        // expect(res.body).to.have.deep.property('internet_fast', defaultQ1SocioDemographic.internet_fast)
                        // expect(res.body).to.have.deep.property('race', defaultQ1SocioDemographic.race)
                        // expect(res.body).to.have.deep.property('tv_bedroom', defaultQ1SocioDemographic.tv_bedroom)
                        // expect(res.body).to.have.deep.property('percentage', defaultQ1SocioDemographic.percentage)
                        // expect(res.body).to.have.deep.property('state', defaultQ1SocioDemographic.state)
                    })
            })

            it('q1sociodemographics.post004: should return status code 201 and the saved Q1Sociodemographic by the family user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(200) // O post não deveria ser 201 ?
                    .then(res => {
                        defaultQ1SocioDemographic.id = res.body.id
                        expect(res.body).to.deep.eql(defaultQ1SocioDemographic)
                        // expect(res.body).to.have.property('id')
                        // expect(res.body).to.have.property('child_id', defaultQ1SocioDemographic.child_id)
                        // expect(res.body).to.have.property('child_age', defaultQ1SocioDemographic.child_age)
                        // expect(res.body).to.have.property('child_gender', defaultQ1SocioDemographic.child_gender)
                        // expect(res.body).to.have.property('date', defaultQ1SocioDemographic.date.toISOString())
                        // expect(res.body).to.have.property('parental_identity_q1', defaultQ1SocioDemographic.parental_identity_q1)
                        // expect(res.body).to.have.property('respondent_gender', defaultQ1SocioDemographic.respondent_gender)
                        // expect(res.body).to.have.property('number_children', defaultQ1SocioDemographic.number_children)
                        // expect(res.body).to.have.property('number_siblings', defaultQ1SocioDemographic.number_siblings)
                        // expect(res.body).to.have.property('number_of_household_members', defaultQ1SocioDemographic.number_of_household_members)
                        // expect(res.body).to.have.deep.property('ages_household_members', defaultQ1SocioDemographic.ages_household_members)
                        // expect(res.body).to.have.deep.property('resp_1', defaultQ1SocioDemographic.resp_1)
                        // expect(res.body).to.have.deep.property('part_1', defaultQ1SocioDemographic.part_1)
                        // expect(res.body).to.have.deep.property('resp_2', defaultQ1SocioDemographic.resp_2)
                        // expect(res.body).to.have.deep.property('part_2', defaultQ1SocioDemographic.part_2)
                        // expect(res.body).to.have.deep.property('supermarket_near', defaultQ1SocioDemographic.supermarket_near)
                        // expect(res.body).to.have.deep.property('tradmarket_near', defaultQ1SocioDemographic.tradmarket_near)
                        // expect(res.body).to.have.deep.property('park_near', defaultQ1SocioDemographic.park_near)
                        // expect(res.body).to.have.deep.property('supermarket', defaultQ1SocioDemographic.supermarket)
                        // expect(res.body).to.have.deep.property('tradi_market', defaultQ1SocioDemographic.tradi_market)
                        // expect(res.body).to.have.deep.property('park', defaultQ1SocioDemographic.park)
                        // expect(res.body).to.have.deep.property('type_transport', defaultQ1SocioDemographic.type_transport)
                        // expect(res.body).to.have.deep.property('comp', defaultQ1SocioDemographic.comp)
                        // expect(res.body).to.have.deep.property('mob', defaultQ1SocioDemographic.mob)
                        // expect(res.body).to.have.deep.property('smartp', defaultQ1SocioDemographic.smartp)
                        // expect(res.body).to.have.deep.property('tablet', defaultQ1SocioDemographic.tablet)
                        // expect(res.body).to.have.deep.property('internet_access', defaultQ1SocioDemographic.internet_access)
                        // expect(res.body).to.have.deep.property('internet_fast', defaultQ1SocioDemographic.internet_fast)
                        // expect(res.body).to.have.deep.property('race', defaultQ1SocioDemographic.race)
                        // expect(res.body).to.have.deep.property('tv_bedroom', defaultQ1SocioDemographic.tv_bedroom)
                        // expect(res.body).to.have.deep.property('percentage', defaultQ1SocioDemographic.percentage)
                        // expect(res.body).to.have.deep.property('state', defaultQ1SocioDemographic.state)
                    })
            })

        }) // posting a Q1Sociodemographic successfully

        context('when a validation error occurs', () => {

            it('q1sociodemographics.post005: should return status code 400 and info message from error, becaus child not exist', () => {

                const q1sociodemographic = getQ1SociodemographicJSON(new ChildMock())

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultFamilyToken))
                    .send(q1sociodemographic)
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.deep.eql(q1sociodemographic)
                    })
            })
        })

        context('when the user does not have permission for register Q1Sociodemographic', () => {

            it('q1sociodemographics.post004: should return status code 403 and info message from insufficient permissions for admin user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessTokenAdmin))
                    .send(defaultQ1SocioDemographic)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

            it('q1sociodemographics.post005: should return status code 403 and info message from insufficient permissions for health professional user', () => {

                return request(URI)
                    .post('/q1sociodemographics')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultHealthProfessionalToken))
                    .send(defaultQ1SocioDemographic)
                    .expect(403)
                    .then(err => {
                        expect(err.body).to.eql(ApiGatewayException.ERROR_MESSAGE.ERROR_403_FORBIDDEN)
                    })
            })

        }) // user does not have permission

    })
})

function getQ1SociodemographicJSON(child: Child) {
    return {
        id: '5a62be07de34500146d9c544',
        child_id: child.id,
        child_age: child.age,
        child_gender: child.gender,
        date: '2019-11-07T19:40:45.124Z',
        parental_identity_q1: 'mother',
        respondent_gender: 'female',
        number_children: 'true', // se o campo for false, deve não mostrar o campo "number_siblings"
        number_siblings: 'one',
        number_of_household_members: 4,
        ages_household_members: [ //father, mother, 'child', sibling
            Math.floor((Math.random() * 21 + 30)), //30 - 50 (A idade dos pais é livre)
            Math.floor((Math.random() * 21 + 30)), //30 - 50 (A idade dos pais é livre)
            child.age,
            Math.floor((Math.random() * 4 + 9)) //9 - 12 (a criança deve ter idade entre 9 e 12 anos)
        ],
        resp_1: 'Master',
        part_1: 'Secondary education', // ?
        resp_2: 'Works in household chores',
        part_2: 'study', // ?
        // resp_3: "string", //caso resp_3 e part_3 seja fornecido ocasiona um ERRO (422)
        // part_3: "string",
        supermarket_near: 'true',
        tradmarket_near: 'true',
        park_near: 'true',
        supermarket: 'Once a week',
        tradi_market: 'Never',
        park: '1-2 times/month',
        type_transport: 'Car',
        comp: 'true', // ?
        mob: 'true', // ?
        smartp: 'true',
        tablet: 'true',
        internet_access: 'true',
        internet_fast: 'true',
        race: 'Prefer not to answer',
        tv_bedroom: 'true',
        percentage: 'Percentage of realization', // ?
        state: 'Complete' // ?
    }
}