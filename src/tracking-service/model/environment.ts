import { Entity } from './entity'
import { Location } from './location'
import { Measurement } from './measurement'

/**
 * Entity implementation for environment measurements.
 *
 * @extends {Entity}
 */
export class Environment extends Entity {
    public institution_id?: string // Id of institution associated with a environment.
    public location?: Location // Sensor Location
    public measurements?: Array<Measurement> // Associated Measurements
    public climatized?: boolean // Boolean variable to identify if a environment is climatized.
    public timestamp!: Date // Timestamp according to the UTC.

    public convertDatetimeString(value: string): Date {
        return new Date(value)
    }

    public fromJSON(json: any): Environment {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.institution_id !== undefined) this.institution_id = json.institution_id
        if (json.location !== undefined) this.location = new Location().fromJSON(json.location)
        if (json.measurements !== undefined && json.measurements instanceof Array) {
            this.measurements = json.measurements.map(item => new Measurement().fromJSON(item))
        }
        this.climatized = json.climatized
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            institution_id: this.institution_id,
            location: this.location ? this.location.toJSON() : this.location,
            measurements: this.measurements ? this.measurements.map(item => item.toJSON()) : this.measurements,
            climatized: this.climatized,
            timestamp: this.timestamp
        }
    }
}
