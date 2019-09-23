import { ChildMock } from './child.mock'
import { UserMock } from './user.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'

export class ChildrenGroupMock extends ChildrenGroup {
    constructor() {
        super()
        this.generateChildrenGroup()
    }

    private generateChildrenGroup(): void {
        super.id = this.generateObjectId()
        super.name = 'children group '.concat(this.generateObjectId())
        super.children = [new ChildMock(), new ChildMock()]
        super.school_class = 'Room 01'
        super.user = new UserMock()
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
