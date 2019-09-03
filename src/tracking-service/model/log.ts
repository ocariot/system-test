import { Entity } from './entity'

/**
 * Entity implementation of the individual log of the PhysicalActivity.
 */
export class Log extends Entity {
    public date!: string // Date of the log according to the format yyyy-MM-dd.
    public value!: number // Total time in milliseconds spent in the day.
    public type!: string // Log type
    public child_id!: string // Child ID

    public fromJSON(json: any): Log {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.date !== undefined) this.date = json.date
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        /**
         * Converts the log date to a valid format if necessary
         */
        if (this.date) {
            const dateSplit = this.date.split('-')

            let month = dateSplit[1]

            let day = dateSplit[2]

            // Pass the month to the valid format
            if (month.length === 1) month = month.padStart(2, '0')

            // Pass the day to the valid format
            if (day.length === 1) day = day.padStart(2, '0')

            // Creates the log date with the same or new elements (if the month or day is in '1' format instead of '01')
            this.date = `${dateSplit[0]}-${month}-${day}`
        }

        return {
            date: this.date,
            value: this.value,
        }
    }
}

export enum LogType {
    STEPS = 'steps',
    CALORIES = 'calories'
}
