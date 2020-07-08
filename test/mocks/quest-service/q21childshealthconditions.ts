import { Child } from '../../../src/account-service/model/child'
import { GenderMock } from '../account-service/child.mock'

export class Q21ChildsHealthConditionsMock {
    public id?: string
    public child_id?: string
    public date?: Date
    public ch_hypertension?: string
    public ch_diabetes?: string
    public ch_hypercholesterolemia?: string
    public ch_asthma?: string
    public ch_other1?: string
    public ch_other2?: string
    public ch_celiac?: string
    public ch_lactose?: string
    public ch_food_allergy?: string
    public ch_egg_allergy?: string
    public ch_milk_allergy?: string
    public ch_other_allergy1?: string
    public ch_other_allergy2?: string
    public weight_height_birth?: string
    public weight_birth?: number
    public height_birth?: number
    public breastfeeding_practice?: string
    public breastfeeding_practice_other?: string
    public breastfeeding_exclusive?: string
    public breastfeeding_exclusive_other?: string
    public menarche?: string
    // public menarche_time?: number
    public percentage?: string
    public state?: string

    constructor(child: Child) {
        this.Q21ChildsHealthConditionsMock(child)
    }

    private Q21ChildsHealthConditionsMock(child: Child) {

        this.id = this.generateObjectId()
        this.child_id = child.id
        this.date = new Date('2019-11-07T19:40:45.124Z')
        this.ch_hypertension = 'No'
        this.ch_diabetes = 'No'
        this.ch_hypercholesterolemia = 'No'
        this.ch_asthma = 'No'
        this.ch_other1 = 'No'
        this.ch_other2 = ''
        this.ch_celiac = 'No'
        this.ch_lactose = 'No'
        this.ch_food_allergy = 'No'
        this.ch_egg_allergy = 'No'
        this.ch_milk_allergy = 'No'
        this.ch_other_allergy1 = 'No'
        this.ch_other_allergy2 = ''
        this.weight_height_birth = 'No'
        this.weight_birth = 0
        this.height_birth = 0
        this.breastfeeding_practice = 'Dont know'
        this.breastfeeding_practice_other = ''
        this.breastfeeding_exclusive = 'Dont know'
        this.breastfeeding_exclusive_other = ''
        this.menarche = this.getMenarche(child)
        // this.menarche_time = undefined
        this.percentage = 'Percentage of realization'
        this.state = 'Complete'

        return this
    }

    private getMenarche(child: Child): any {
        return child.gender === GenderMock.FEMALE ? 'No' : undefined
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    public fromJSON(q21childshealthconditions: Q21ChildsHealthConditionsMock) {
        const JSON = {
            id: q21childshealthconditions.id,
            date: q21childshealthconditions.date?.toISOString(),
            child_id: q21childshealthconditions.child_id,
            ch_hypertension: q21childshealthconditions.ch_hypertension,
            ch_diabetes: q21childshealthconditions.ch_diabetes,
            ch_hypercholesterolemia: q21childshealthconditions.ch_hypercholesterolemia,
            ch_asthma: q21childshealthconditions.ch_asthma,
            ch_other1: q21childshealthconditions.ch_other1,
            ch_other2: q21childshealthconditions.ch_other2,
            ch_celiac: q21childshealthconditions.ch_celiac,
            ch_lactose: q21childshealthconditions.ch_lactose,
            ch_food_allergy: q21childshealthconditions.ch_food_allergy,
            ch_egg_allergy: q21childshealthconditions.ch_egg_allergy,
            ch_milk_allergy: q21childshealthconditions.ch_milk_allergy,
            ch_other_allergy1: q21childshealthconditions.ch_other_allergy1,
            ch_other_allergy2: q21childshealthconditions.ch_other_allergy2,
            weight_height_birth: q21childshealthconditions.weight_height_birth,
            weight_birth: q21childshealthconditions.weight_birth,
            height_birth: q21childshealthconditions.weight_birth,
            breastfeeding_practice: q21childshealthconditions.breastfeeding_practice,
            breastfeeding_practice_other: q21childshealthconditions.breastfeeding_practice_other,
            breastfeeding_exclusive: q21childshealthconditions.breastfeeding_exclusive,
            breastfeeding_exclusive_other: q21childshealthconditions.breastfeeding_exclusive_other,
            menarche: q21childshealthconditions.menarche ? q21childshealthconditions.menarche : '',
            menarche_time: '',
            percentage: q21childshealthconditions.percentage,
            state: q21childshealthconditions.state
        }

        return JSON
    }
}

