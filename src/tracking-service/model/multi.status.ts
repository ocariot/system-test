import { StatusSuccess } from './status.success'
import { StatusError } from './status.error'

/**
 * Implementation of a class to represent the MultiStatus model of response
 *
 * @template T
 */
export class MultiStatus<T> {
    public success!: Array<StatusSuccess<T>>
    public error!: Array<StatusError<T>>

    public fromJSON(json: any): MultiStatus<T> {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.success !== undefined && json.success instanceof Array)  {
            this.success = json.success.map(item => new StatusSuccess<T>().fromJSON(item))
        }
        if (json.error !== undefined && json.error instanceof Array) {
            this.error = json.error.map(item => new StatusError<T>().fromJSON(item))
        }

        return this
    }

    public toJSON(): any {
        return {
            success: this.success ? this.success.map(item => item.toJSON()) : this.success,
            error: this.error ? this.error.map(item => item.toJSON()) : this.error
        }
    }

}
