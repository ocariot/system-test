import { User, UserType } from './user'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 */
export class Child extends User {
    public gender?: string // Gender of the child. Can be male or female.
    public age?: number  // Age of the child.

    constructor() {
        super()
        super.type = UserType.CHILD
    }

}
