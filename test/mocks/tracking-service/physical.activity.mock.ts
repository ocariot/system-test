import { PhysicalActivity } from '../../../src/tracking-service/model/physical.activity'
import { PhysicalActivityHeartRate } from '../../../src/tracking-service/model/physical.activity.heart.rate'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/tracking-service/model/physical.activity.level'

export class PhysicalActivityMock extends PhysicalActivity {

    constructor(type?: ActivityTypeMock) {
        super()
        super.fromJSON(JSON.stringify(this.generatePhysicalActivity(type)))
    }

    private generatePhysicalActivity(type?: ActivityTypeMock): PhysicalActivity {
        if (!type) type = this.chooseType()

        const physicalActivity: PhysicalActivity = new PhysicalActivity()
        physicalActivity.id = this.generateObjectId()
        physicalActivity.start_time = new Date()
        physicalActivity.end_time = new Date(new Date(physicalActivity.start_time)
            .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
        physicalActivity.duration = physicalActivity.end_time.getTime() - physicalActivity.start_time.getTime()
        physicalActivity.name = type
        physicalActivity.calories = Math.floor((Math.random() * 20000 + 500)) // 500-20000

        if (type === ActivityTypeMock.WALK || type === ActivityTypeMock.RUN) {
            physicalActivity.steps = Math.floor((Math.random() * 20000 + 100)) // 100-15000
        }

        physicalActivity.levels = this.generatePhysicalActivityLevels()
        physicalActivity.heart_rate = this.generateHeartRate()
        return physicalActivity
    }

    private generateHeartRate(): PhysicalActivityHeartRate {
        const activityHeartRateJSON: any = {
            average: Math.floor((Math.random() * 120 + 70)), // 70-189,
            out_of_range_zone: {
                min: 30,
                max: 91,
                duration: 0
            },
            fat_burn_zone: {
                min: 91,
                max: 127,
                duration: 10
            },
            cardio_zone: {
                min: 127,
                max: 154,
                duration: 0
            },
            peak_zone: {
                min: 154,
                max: 220,
                duration: 0
            },
        }
        return new PhysicalActivityHeartRate().fromJSON(activityHeartRateJSON)
    }    

    private generatePhysicalActivityLevels(): Array<PhysicalActivityLevel> {
        const levels: Array<PhysicalActivityLevel> = []
        levels.push(new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)))
        levels.push(new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)))
        levels.push(new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)))
        levels.push(new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000)))
        return levels
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private chooseType(): ActivityTypeMock {
        switch (Math.floor((Math.random() * 4))) { // 0-3
            case 0:
                return ActivityTypeMock.WALK
            case 1:
                return ActivityTypeMock.RUN
            case 2:
                return ActivityTypeMock.BIKE
            default:
                return ActivityTypeMock.SWIM
        }
    }
}

export enum ActivityTypeMock {
    WALK = 'walk',
    RUN = 'run',
    BIKE = 'bike',
    SWIM = 'swim'
}
