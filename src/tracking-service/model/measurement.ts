/**
 * Implementation of the measurement entity.
 */
export class Measurement {
    public type!: string // Type of measurement.
    public value!: number // Value of measurement.
    public unit!: string // Unit of measurement.

    public fromJSON(json: any): Measurement {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit

        return this
    }

    public toJSON(): any {
        return {
            type: this.type,
            value: this.value,
            unit: this.unit
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum MeasurementType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity'
}
