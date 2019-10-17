import { HeartRateZone } from '../model/heart.rate.zone'
import { JsonUtils } from '../utils/json.utils'

export class PhysicalActivityHeartRate {
    
    public average?: number // Average heart rate
    public out_of_range_zone?: HeartRateZone // 'Out of Range' heart rate zone
    public fat_burn_zone?: HeartRateZone // 'Fat Burn' heart rate zone
    public cardio_zone?: HeartRateZone // 'Cardio' heart rate zone
    public peak_zone?: HeartRateZone // 'Peak' heart rate zone  
    
    public fromJSON(json: any): PhysicalActivityHeartRate {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.average !== undefined) this.average = json.average
        if (json.out_of_range_zone !== undefined) this.out_of_range_zone = new HeartRateZone().fromJSON(json.out_of_range_zone)
        if (json.fat_burn_zone !== undefined) this.fat_burn_zone = new HeartRateZone().fromJSON(json.fat_burn_zone)
        if (json.cardio_zone !== undefined) this.cardio_zone = new HeartRateZone().fromJSON(json.cardio_zone)
        if (json.peak_zone !== undefined) this.peak_zone = new HeartRateZone().fromJSON(json.peak_zone)

        return this
    }

    public toJSON(): any {
        return {
            average: this.average,
            out_of_range_zone: this.out_of_range_zone ? this.out_of_range_zone.toJSON() : this.out_of_range_zone,
            fat_burn_zone: this.fat_burn_zone ? this.fat_burn_zone.toJSON() : this.fat_burn_zone,
            cardio_zone: this.cardio_zone ? this.cardio_zone.toJSON() : this.cardio_zone,
            peak_zone: this.peak_zone ? this.peak_zone.toJSON() : this.peak_zone
        }
    }    
}