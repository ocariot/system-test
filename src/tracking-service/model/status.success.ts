/**
 * Implementation of a class to represent the 'success' item of a MultiStatus
 *
 * @template T
 */
export class StatusSuccess<T> {
    public code!: number
    public item!: T

    constructor(code?: number, item?: T) {
        if (code) this.code = code
        if (item) this.item = item
    }

    public fromJSON(json: any): StatusSuccess<T> {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.code !== undefined) this.code = json.code
        if (json.item !== undefined) this.item = json.item

        return this
    }

    public toJSON(): any {
        return {
            code: this.code,
            item: this.item
        }
    }

}
