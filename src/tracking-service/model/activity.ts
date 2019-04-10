import { Entity } from './entity'

/**
 * Implementation of the physicalactivity entity.
 *
 * @extends {Entity}
 */
export class Activity extends Entity {
    public start_time?: Date // PhysicalActivity start time according to the UTC.
    public end_time?: Date // PhysicalActivity end time according to the UTC.
    public duration?: number // Total time in milliseconds spent in the activity.
    public child_id!: string // Child ID belonging to activity.

    public convertDatetimeString(value: string): Date {
        return new Date(value)
    }

    public fromJSON(json: any): Activity {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.start_time !== undefined) this.start_time = this.convertDatetimeString(json.start_time)
        if (json.end_time !== undefined) this.end_time = this.convertDatetimeString(json.end_time)
        if (json.duration !== undefined) this.duration = json.duration
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            start_time: this.start_time ? this.start_time.toISOString() : this.start_time,
            end_time: this.end_time ? this.end_time.toISOString() : this.end_time,
            duration: this.duration,
            child_id: this.child_id
        }
    }
}
