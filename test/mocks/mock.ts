//  Import Models
import { Application } from '../../src/account-service/model/application'
import { Child } from '../../src/account-service/model/child'
import { Educator } from '../../src/account-service/model/educator'
import { Family } from '../../src/account-service/model/family'
import { Institution } from '../../src/account-service/model/institution'
import { HealthProfessional } from '../../src/account-service/model/health.professional'
import { ChildrenGroup } from 'account-service/model/children.group'

//  Import Mocks
import { ApplicationMock } from './account-service/application.mock'
import { ChildMock } from './account-service/child.mock'
import { EducatorMock } from './account-service/educator.mock'
import { FamilyMock } from './account-service/family.mock'
import { InstitutionMock } from './account-service/institution.mock'
import { HealthProfessionalMock } from './account-service/healthprofessional.mock'
import { ChildrenGroupMock } from './account-service/children.group.mock'

import { acc } from '../utils/account.utils'

class Tokens {
    public application!: string
    public child!: string
    public healthProfessional!: string
    public educator!: string
    public family!: string
}

class AccountMocks {
    public application: Application
    public child: Child
    public educator: Educator
    public family: Family
    public healthProfessional: HealthProfessional
    public institution: Institution
    public childrenGroup: ChildrenGroup

    constructor() {
        this.application = new ApplicationMock()
        this.child = new ChildMock()
        this.educator = new EducatorMock()
        this.family = new FamilyMock()
        this.healthProfessional = new HealthProfessionalMock()
        this.institution = new InstitutionMock()
        this.childrenGroup = new ChildrenGroupMock()
    }
}

class Mock {
    //  Tokens
    public adminToken!: string
    public tokensDefault: Tokens
    public tokensAnother: Tokens

    //  Account mocks
    public accountDefault: AccountMocks
    public accountAnother: AccountMocks

    constructor() {
        this.accountDefault = new AccountMocks()
        this.accountAnother = new AccountMocks()
        this.tokensDefault = new Tokens()
        this.tokensAnother = new Tokens()

        this.associateMocks()
    }

    private associateMocks() {
        const accDefault: AccountMocks = this.accountDefault
        const accAnother: AccountMocks = this.accountAnother
        const defaultInstitution = this.accountDefault.institution

        accDefault.application.institution = defaultInstitution
        accDefault.child.institution = defaultInstitution
        accDefault.educator.institution = defaultInstitution
        accDefault.family.institution = defaultInstitution
        accDefault.healthProfessional.institution = defaultInstitution

        accAnother.application.institution = defaultInstitution
        accAnother.child.institution = defaultInstitution
        accAnother.educator.institution = defaultInstitution
        accAnother.family.institution = defaultInstitution
        accAnother.healthProfessional.institution = defaultInstitution

        accDefault.family.children = new Array<Child>(accDefault.child, accAnother.child)
        accAnother.family.children = new Array<Child>(accAnother.child)

        accDefault.childrenGroup.children = new Array<Child>(accDefault.child, accAnother.child)
        accAnother.childrenGroup.children = new Array<Child>(accAnother.child)
    }

    private async generateUserToken(user: any): Promise<string> {
        let token!: string

        if (user.username && user.password) {
            token = await acc.auth(user.username, user.password)
        }

        return token
    }

    private async generateUserTokens(accountMock: AccountMocks, tokens: Tokens) {
        tokens.application = await this.generateUserToken(accountMock.application)
        tokens.child = await this.generateUserToken(accountMock.child)
        tokens.educator = await this.generateUserToken(accountMock.educator)
        tokens.family = await this.generateUserToken(accountMock.family)
        tokens.healthProfessional = await this.generateUserToken(accountMock.healthProfessional)
    }

    public async saveUsers() {
        const accDefault = this.accountDefault
        const accAnother = this.accountAnother
        const tokDefault = this.tokensDefault
        const tokAnother = this.tokensAnother
        let result: any

        try {
            result = await acc.saveInstitution(this.adminToken, accDefault.institution)
            accDefault.institution.id = result.id

            result = await acc.saveInstitution(this.adminToken, accAnother.institution)
            accAnother.institution.id = result.id

            result = await acc.saveChild(this.adminToken, accDefault.child)
            accDefault.child.id = result.id

            result = await acc.saveChild(this.adminToken, accAnother.child)
            accAnother.child.id = result.id

            result = await acc.saveApplication(this.adminToken, accDefault.application)
            accDefault.application.id = result.id

            result = await acc.saveApplication(this.adminToken, accAnother.application)
            accAnother.application.id = result.id

            result = await acc.saveEducator(this.adminToken, accDefault.educator)
            accDefault.educator.id = result.id

            result = await acc.saveEducator(this.adminToken, accAnother.educator)
            accAnother.educator.id = result.id

            result = await acc.saveFamily(this.adminToken, accDefault.family)
            accDefault.family.id = result.id

            result = await acc.saveFamily(this.adminToken, accAnother.family)
            accAnother.family.id = result.id

            result = await acc.saveHealthProfessional(this.adminToken, accDefault.healthProfessional)
            accDefault.healthProfessional.id = result.id

            result = await acc.saveHealthProfessional(this.adminToken, accAnother.healthProfessional)
            accAnother.healthProfessional.id = result.id

            //Getting tokens for each user
            await this.generateUserTokens(accDefault, tokDefault)
            await this.generateUserTokens(accAnother, tokAnother)

            // Associating childrenGroup with educator and health professional
            await acc.saveChildrenGroupsForEducator(tokDefault.educator, accDefault.educator, accDefault.childrenGroup)
            await acc.saveChildrenGroupsForEducator(tokAnother.educator, accAnother.educator, accAnother.childrenGroup)
            await acc.saveChildrenGroupsForHealthProfessional(tokDefault.healthProfessional, accDefault.healthProfessional, accDefault.childrenGroup!)
            await acc.saveChildrenGroupsForHealthProfessional(tokAnother.healthProfessional, accAnother.healthProfessional, accAnother.childrenGroup!)
        } catch (e) {
            console.log('error saving users: ', e.message)
        }

    }

}

export { Mock }