import { Weight } from '../../../src/tracking-service/model/weight'
import { MeasurementType } from '../../../src/tracking-service/model/measurement'
import { BodyFatMock } from './body.fat.mock'

export class WeightMock extends Weight {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateWeight()))
    }

    private generateWeight(): Weight {
        const weight = new Weight()
        
        weight.id = this.generateObjectId()
        weight.type = MeasurementType.WEIGHT
        weight.timestamp = new Date(1560826800000 + Math.floor((Math.random() * 100000)))
        weight.value = Math.random() * 16 + 50 // 50-65
        weight.unit = 'kg'
        weight.child_id = '5a62be07de34500146d9c544'
        weight.body_fat = new BodyFatMock()
        weight.body_fat.timestamp = weight.timestamp

        return weight
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}