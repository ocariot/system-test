import { Entity } from './entity'

export class NotificationUser extends Entity {
    public token?: string
    public tokens: Array<string>
    public lang?: string
    public type?: string

    constructor(){
        super()
        this.tokens = new Array<string>()
    }

    public asJSONResponse(withNewToken: boolean = true): any {
        return {
            id: this.id,
            tokens: withNewToken ? new Array<string>(this.token!).concat(this.tokens) : this.tokens,
            lang: this.lang,
            type: this.type,
        }
    }

    public asJSONRequestBody(): any {
        return {
            token: this.token,
            lang: this.lang,
            type: this.type,
        }
    }

}