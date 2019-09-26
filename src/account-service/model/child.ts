import { User, UserType } from './user'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 */
export class Child extends User {
    public gender?: string // Gender of the child. Can be male or female.
    public age?: number  // Age of the child.
    public last_sync?: Date // Last synchronization time according to the UTC.

    constructor() {
        super()
        super.type = UserType.CHILD
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

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{ gender: this.gender, age: this.age, last_sync: this.last_sync }
        }
    }
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}
