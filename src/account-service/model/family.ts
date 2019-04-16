import { Child } from './child'
import { User, UserType } from './user'

/**
 * Implementation of the family entity.
 *
 * @extends {User}
 */
export class Family extends User {
    public children?: Array<Child> // List of children associated with a family.

    constructor() {
        super()
        super.type = UserType.FAMILY
    }

    public fromJSON(json: any): Family {
        if (!json) return this
        super.fromJSON(json)

        if (json.children !== undefined && json.children instanceof Array) {
            this.children = json.children.map(child => new Child().fromJSON(child))
        }

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                children: this.children ?
                    this.children.map(child => child.id) :
                    this.children
            }
        }
    }
}
