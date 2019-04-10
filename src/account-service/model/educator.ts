import { User, UserType } from './user'
import { ChildrenGroup } from './children.group'

/**
 * Implementation of the educator entity.
 *
 * @extends {User}
 */
export class Educator extends User {
    public children_groups?: Array<ChildrenGroup> // List of children group.

    constructor() {
        super()
        super.type = UserType.EDUCATOR
    }
}
