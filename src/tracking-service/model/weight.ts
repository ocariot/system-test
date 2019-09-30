import { Measurement, MeasurementType } from "./measurement"
import { BodyFat } from './body.fat'
import { JsonUtils } from '../utils/json.utils'

export class Weight extends Measurement {
    public body_fat?: BodyFat // Object of body_fat measurement associated with the weight measurement.

    constructor() {
        super()
        this.type = MeasurementType.WEIGHT
    }

    public fromJSON(json: any): Weight {
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
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id
        if (json.body_fat !== undefined) {
            this.body_fat = new BodyFat().fromJSON(json)
            this.body_fat.value = json.body_fat
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id,
            body_fat: this.body_fat ? this.body_fat.value : undefined
        }
    }
}