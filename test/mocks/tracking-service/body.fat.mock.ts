import { BodyFat } from '../../../src/tracking-service/model/body.fat'
import { MeasurementType } from '../../../src/tracking-service/model/measurement'

export class BodyFatMock extends BodyFat {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateBodyFat()))
    }

    private generateBodyFat(): BodyFat {
        const bodyFat = new BodyFat()

        bodyFat.id = this.generateObjectId()
        bodyFat.type = MeasurementType.BODY_FAT
        bodyFat.timestamp = new Date(1560826800000 + Math.floor((Math.random() * 100000)))
        bodyFat.value = Math.random() * 10 + 20 // 20-29
        bodyFat.unit = '%'
        bodyFat.child_id = '5a62be07de34500146d9c544'

        return bodyFat
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