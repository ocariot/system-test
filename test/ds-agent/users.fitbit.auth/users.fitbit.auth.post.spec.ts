import request from 'supertest'
import {acc} from '../../utils/account.utils'
import {accountDB} from '../../../src/account-service/database/account.db'
import {dsAgentDB} from '../../../src/quizzes/database/ds-agent.db'
import {dsAgentUtils} from '../../utils/ds.agent.utils'
import {Institution} from '../../../src/account-service/model/institution'
import {Child} from '../../../src/account-service/model/child'
import {ChildMock} from '../../mocks/account-service/child.mock'
import {Educator} from '../../../src/account-service/model/educator'
import {EducatorMock} from '../../mocks/account-service/educator.mock'
import {HealthProfessional} from '../../../src/account-service/model/health.professional'
import {HealthProfessionalMock} from '../../mocks/account-service/healthprofessional.mock'
import {Family} from '../../../src/account-service/model/family'
import {FamilyMock} from '../../mocks/account-service/family.mock'
import {Application} from '../../../src/account-service/model/application'
import {ApplicationMock} from '../../mocks/account-service/application.mock'
import {ChildrenGroup} from '../../../src/account-service/model/children.group'

describe('Routes: users.fitbit.auth', () => {

    const URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    let accessTokenAdmin: string
    let accessDefaultChildToken: string

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'default type'
    defaultInstitution.name = 'default name'
    defaultInstitution.address = 'default address'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.name = 'Default children group'
    defaultChildrenGroup.school_class = '4th grade'

    const defaultChild: Child = new ChildMock()
    const defaultEducator: Educator = new EducatorMock()
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    const defaultFamily: Family = new FamilyMock()
    const defaultApplication: Application = new ApplicationMock()

    before(async () => {
        try {
            await accountDB.connect()
            await dsAgentDB.connect()

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

            const resultDefaultApplication = await acc.saveApplication(accessTokenAdmin, defaultApplication)
            defaultApplication.id = resultDefaultApplication.id

            //getting tokens for each 'default user'
            if (defaultChild.username && defaultChild.password) {
                accessDefaultChildToken = await acc.auth(defaultChild.username, defaultChild.password)
            }

        } catch (err) {
            console.log('Failure on Before from physical.activities.post test: ', err.message)
        }
    })
    after(async () => {
        try {
            await accountDB.removeCollections()
            await dsAgentDB.removeCollections()
            await accountDB.dispose()
            await dsAgentDB.dispose()
        } catch (err) {
            console.log('DB ERROR', err)
        }
    })

    describe('POST ​/v1​/users​/:child_id/fitbit​/auth', () => {

        context('when submit user data from the Fitbit account for use in data synchronization.', () => {

            it('users.fitbit.auth.post001: should return status code 204 when operation performed successfully.', () => {

                return request(URI)
                    .post(`/users/${defaultChild.id}/fitbit/auth`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .send(dsAgentUtils.tokenInformation)
                    .expect(204)
            })

        })

        context('when revokes the user-associated Fitbit access token..', () => {

            it('users.fitbit.auth.revoke.post001: should return status code 201 when operation performed successfully. There is no data to be returned.', () => {

                return request(URI)
                    .post(`/users/${defaultChild.id}/fitbit/auth/revoke`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer '.concat(accessDefaultChildToken))
                    .expect(204)
            })

        })

    })


})

