import { Activity } from './activity'
import { SleepPattern } from './sleep.pattern'

/**
 * Implementation of the sleep entity.
 *
 * @extends {Activity}
 */
export class Sleep extends Activity {
    public pattern?: SleepPattern // Sleep pattern tracking.

    public fromJSON(json: any): Sleep {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.pattern !== undefined) this.pattern = new SleepPattern().fromJSON(json.pattern)

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                pattern: this.pattern ? this.pattern.toJSON() : this.pattern
            }
        }
    }
}
