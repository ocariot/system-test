import { Measurement, MeasurementType } from "./measurement"
import { JsonUtils } from '../utils/json.utils'

export class BodyFat extends Measurement {
    constructor() {
        super()
        this.type = MeasurementType.BODY_FAT
        this.unit = '%'
    }

    public fromJSON(json: any): BodyFat {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.timestamp !== undefined && !(json.timestamp instanceof Date)) {
            this.timestamp = this.convertDatetimeString(json.timestamp)
        } else if (json.timestamp !== undefined && json.timestamp instanceof Date) {
            this.timestamp = json.timestamp
        }
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}