import { Entity } from "./entity"
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the measurement entity.
 */
export class Measurement extends Entity {
    public type?: string // Type of measurement.
    public timestamp?: Date // Timestamp according to the UTC.
    public value?: number // Value of measurement.
    public unit?: string // Unit of measurement.
    public child_id?: string // Id of child associated with the measurement.

    public convertDatetimeString(value: string): Date {
        return new Date(value)
    }

    public fromJSON(json: any): Measurement {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.timestamp !== undefined && !(json.timestamp instanceof Date)) {
            this.timestamp = this.convertDatetimeString(json.timestamp)
        } else if (json.timestamp !== undefined && json.timestamp instanceof Date) {
            this.timestamp = json.timestamp
        }
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            type: this.type,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum MeasurementType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    PM1 = 'pm1',
    PM2_5 = 'pm2.5',
    PM10 = 'pm10',
    BODY_FAT = 'body_fat',
    WEIGHT = 'weight'
}
