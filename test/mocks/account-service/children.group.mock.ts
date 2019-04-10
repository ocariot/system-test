import { ChildMock } from './child.mock'
import { UserMock } from './user.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'

export class ChildrenGroupMock extends ChildrenGroup {
    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateChildrenGroup()))
    }

    private generateChildrenGroup(): ChildrenGroup {
        const children_group: ChildrenGroup = new ChildrenGroup()
        children_group.id = this.generateObjectId()
        children_group.name = 'children group 1'
        children_group.children = [new ChildMock(), new ChildMock()]
        children_group.school_class = 'Room 01'
        children_group.user = new UserMock()

        return children_group
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
