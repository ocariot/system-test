import { Entity } from './entity'
import { Child } from './child'
import { User } from './user'

/**
 * Implementation of the children group entity.
 *
 * @extends {Entity}
 */
export class ChildrenGroup extends Entity {
    public name?: string // Name of the children group.
    public children?: Array<Child> // Children belonging to the group.
    public school_class?: string // Class of the children from group.
    public user?: User // The user to whom the children group belongs: The possible users are Educator or Health Professional


    public fromJSON(json: any): ChildrenGroup {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.name !== undefined) this.name = json.name
        if (json.school_class !== undefined) this.school_class = json.school_class
        if (json.children !== undefined && json.children instanceof Array) {
            this.children = json.children.map(child => new Child().fromJSON(child))
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            name: this.name,
            children: this.children ?
                this.children.map(child => {
                    child.toJSON()
                    child.type = undefined
                    return child
                }) :
                this.children,
            school_class: this.school_class
        }
    }
}
