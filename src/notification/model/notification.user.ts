import { Entity } from './entity'

export class NotificationUser extends Entity {
    public token?: string
    public lang?: string
    public type?: string

    constructor(){
        super()
    }

    public asJSONResponse(): any {
        return {
            id: this.id,
            tokens: new Array<string>(this.token!),
            lang: this.lang,
            type: this.type,
        }
    }

}