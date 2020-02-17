import { User, UserType } from './user'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 */
export class Child extends User {
    public gender?: string // Gender of the child. Can be male or female.
    public age?: string  // Age of the child.
    public age_calc_date?: string // Date the age was registered.
    public last_sync?: Date // Last synchronization time according to the UTC.
    public fitbit_status?: string // Fitbit status value.
    public cve_status?: string // CVE status value.

    constructor() {
        super()
        super.type = UserType.CHILD
        this.fitbit_status = 'none'
        this.cve_status = 'none'        
    }

    public fromJSON(json: any): Child {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.gender !== undefined) this.gender = json.gender
        if (json.age !== undefined) this.age = json.age
        if (json.last_sync !== undefined && json.last_sync instanceof Date) {
            this.last_sync = json.last_sync
        }
        if (json.age_calc_date !== undefined) this.age_calc_date = json.age_calc_date

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                gender: this.gender,
                age: this.age,
                age_calc_date: this.age_calc_date,
                last_sync: this.last_sync,
                fitbit_status: this.fitbit_status,
                cve_status: this.cve_status
            }
        }
    }
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

export enum FitbitStatus {
    VALID_TOKEN = 'valid_token',
    EXPIRED_TOKEN = 'expired_token',
    INVALID_TOKEN = 'invalid_token',
    INVALID_GRANT = 'invalid_grant',
    INVALID_CLIENT = 'invalid_client',
    SYSTEM = 'rate_limit',
    NONE = 'none'
}