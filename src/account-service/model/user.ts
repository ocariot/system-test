import { Entity } from './entity'
import { Institution } from './institution'

/**
 * Implementation of the user entity.
 *
 * @extends {Entity}
 */
export class User extends Entity {
    public username?: string // Username for user authentication.
    public password?: string // Password for user authentication.
    public type?: string // Type of user. Can be Child, Educator, Health Professional or Family.
    public institution?: Institution // Institution to which the user belongs.
    public scopes?: Array<string> // Scope that signal the types of access the user has.

    public fromJSON(json: any): User {
        if (!json) return this

        if (json.id !== undefined) super.id = json.id
        if (json.username !== undefined) this.username = json.username
        if (json.password !== undefined) this.password = json.password
        if (json.institution !== undefined) {
            this.institution = new Institution().fromJSON(json.institution)
        } else if (json.institution_id !== undefined) {
            this.institution = new Institution().fromJSON(json)
        }
        if (json.scope !== undefined) this.scopes = json.scope

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            username: this.username,
            type: this.type,
            institution: this.institution ? this.institution.toJSON() : this.institution
        }
    }
}

/**
 * Names of user types supported.
 */
export enum UserType {
    ADMIN = 'admin',
    CHILD = 'child',
    EDUCATOR = 'educator',
    HEALTH_PROFESSIONAL = 'healthprofessional',
    FAMILY = 'family',
    APPLICATION = 'application'
}
