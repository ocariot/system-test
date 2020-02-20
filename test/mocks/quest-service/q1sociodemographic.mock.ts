import { Child } from '../../../src/account-service/model/child'

export class Q1SocioDemographicMock {
    public id?: string
    public child_id?: string
    public child_age?: number
    public child_gender?: string
    public date?: Date
    public parental_identity_q1?: string
    public respondent_gender?: string
    public number_children?: string
    public number_siblings?: string
    public number_of_household_members?: number
    public ages_household_members?: Array<number>
    public resp_1?: string
    public part_1?: string
    public resp_2?: string
    public part_2?: string
    public resp_3?: string
    public part_3?: string
    public supermarket_near?: string
    public tradmarket_near?: string
    public park_near?: string
    public supermarket?: string
    public tradi_market?: string
    public park?: string
    public type_transport?: string
    public comp?: string
    public mob?: string
    public smartp?: string
    public tablet?: string
    public internet_access?: string
    public internet_fast?: string
    public race?: string
    public tv_bedroom?: string
    public percentage?: string
    public state?: string

    constructor(child: Child) {
        this.generateQ1SocioDemographic(child)
    }

    private generateQ1SocioDemographic(child: Child) {

        this.id = '5a62be07de34500146d9c544'
        this.child_id = child.id
        this.child_age = Number(child.age)
        this.child_gender = child.gender
        this.date = new Date('2019-11-07T19:40:45.124Z')
        this.parental_identity_q1 = 'mother'
        this.respondent_gender = 'female'
        this.number_children = 'true' // se o campo for false, deve não mostrar o campo "number_siblings"
        this.number_siblings = 'one'
        this.number_of_household_members = 4
        this.ages_household_members = [
            Math.floor((Math.random() * 21 + 30)), //30 - 50
            Math.floor((Math.random() * 21 + 30)), //30 - 50
            Number(child.age!),
            Math.floor((Math.random() * 4 + 9)) //9 - 12 (a criança deve ter idade entre 9 e 12 anos)
        ]
        this.resp_1 = 'Master'
        this.part_1 = 'Secondary education' // ?
        this.resp_2 = 'Works in household chores'
        this.part_2 = 'study' // ?
        this.resp_3 = '10'
        this.part_3 = '10' // ?
        this.supermarket_near = 'true'
        this.tradmarket_near = 'true'
        this.park_near = 'true'
        this.supermarket = 'Once a week'
        this.tradi_market = 'Never'
        this.park = '1-2 times/month'
        this.type_transport = 'Car'
        this.comp = 'true' // ?
        this.mob = 'true' // ?
        this.smartp = 'true'
        this.tablet = 'true'
        this.internet_access = 'true'
        this.internet_fast = 'true'
        this.race = 'Prefer not to answer'
        this.tv_bedroom = 'true'
        this.percentage = 'Percentage of realization' // ?
        this.state = 'Complete' // ?

        return this
    }

    public fromJSON(q1sociodemographic : Q1SocioDemographicMock){
        const JSON = {
            id: q1sociodemographic.id,
            child_id: q1sociodemographic.child_id,
            child_age: q1sociodemographic.child_age,
            child_gender: q1sociodemographic.child_gender,
            date: q1sociodemographic.date!.toISOString(),
            parental_identity_q1: q1sociodemographic.parental_identity_q1,
            respondent_gender: q1sociodemographic.respondent_gender,
            number_children: q1sociodemographic.number_children,
            number_siblings: q1sociodemographic.number_siblings,
            number_of_household_members: q1sociodemographic.number_of_household_members,
            ages_household_members: q1sociodemographic.ages_household_members,
            resp_1: q1sociodemographic.resp_1,
            part_1: q1sociodemographic.part_1,
            resp_2: q1sociodemographic.resp_2,
            part_2: q1sociodemographic.part_2,
            resp_3: q1sociodemographic.resp_3,
            part_3: q1sociodemographic.part_3,
            supermarket_near: q1sociodemographic.supermarket_near,
            tradmarket_near: q1sociodemographic.tradmarket_near,
            park_near: q1sociodemographic.park_near,
            supermarket: q1sociodemographic.supermarket,
            tradi_market: q1sociodemographic.tradi_market,
            park: q1sociodemographic.park,
            type_transport: q1sociodemographic.type_transport,
            comp: q1sociodemographic.comp,
            mob: q1sociodemographic.mob,
            smartp: q1sociodemographic.smartp,
            tablet: q1sociodemographic.tablet,
            internet_access: q1sociodemographic.internet_access,
            internet_fast: q1sociodemographic.internet_fast,
            race: q1sociodemographic.race,
            tv_bedroom: q1sociodemographic.tv_bedroom,
            percentage: q1sociodemographic.percentage,
            state: q1sociodemographic.state
        }

        return JSON
    }
}

