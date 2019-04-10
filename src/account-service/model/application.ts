import { User, UserType } from './user'

/**
 * Implementation of the application entity.
 *
 * @extends {User}
 */
export class Application extends User {
    public application_name?: string // Name of application.

    constructor() {
        super()
        super.type = UserType.APPLICATION
    }


    public fromJSON(json: any): Application {
        if (!json) return this
        super.fromJSON(json)


        if (json.application_name !== undefined) this.application_name = json.application_name

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{ application_name: this.application_name }
        }
    }
}
