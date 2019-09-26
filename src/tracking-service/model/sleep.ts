import { Activity } from './activity'
import { SleepPattern } from './sleep.pattern'

/**
 * Implementation of the sleep entity.
 *
 * @extends {Activity}
 */
export class Sleep extends Activity {
    public pattern?: SleepPattern // Sleep pattern tracking.
    public type?: SleepType // Sleep Pattern type

    public fromJSON(json: any): Sleep {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.pattern !== undefined) this.pattern = new SleepPattern().fromJSON(json.pattern)
        if (json.type !== undefined) this.type = json.type

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                type: this.type,
                pattern: this.pattern ? this.pattern.toJSON() : this.pattern
            }
        }
    }
}

export enum SleepType {
    CLASSIC = 'classic',
    STAGES = 'stages'
}