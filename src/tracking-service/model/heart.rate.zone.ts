import { JsonUtils } from '../utils/json.utils'

export class HeartRateZone {
    public min?: number // Minimum value of the heart rate zone.
    public max?: number // Maximum value of the heart rate zone.
    public duration?: number  // Duration in the heart rate zone (given in milliseconds).

    public fromJSON(json: any): HeartRateZone {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.min !== undefined) this.min = json.min
        if (json.max !== undefined) this.max = json.max
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            min: this.min,
            max: this.max,
            duration: this.duration,
        }
    }    
}