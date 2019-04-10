/**
 * Implementation of a class to represent the 'error' item of a MultiStatus
 *
 * @template T
 */
export class StatusError<T> {
    public code!: number
    public message!: string
    public description!: string
    public item!: T

    constructor(code?: number, message?: string, description?: string, item?: T) {
        if (code) this.code = code
        if (message) this.message = message
        if (description) this.description = description
        if (item) this.item = item
    }

    public fromJSON(json: any): StatusError<T> {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.code !== undefined) this.code = json.code
        if (json.message !== undefined) this.message = json.message
        if (json.description !== undefined) this.description = json.description
        if (json.item !== undefined) this.item = json.item

        return this
    }

    public toJSON(): any {
        return {
            code: this.code,
            message: this.message,
            description: this.description,
            item: this.item
        }
    }

}
