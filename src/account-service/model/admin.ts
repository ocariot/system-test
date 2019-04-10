import { User, UserType } from './user'

/**
 * Implementation of the admin entity.
 *
 * @extends {User}
 */
export class Admin extends User {

    constructor(username?: string, password?: string) {
        super()
        super.type = UserType.ADMIN
    }
}
