import { PhysicalActivityLevel } from './physical.activity.level'
import { Activity } from './activity'

/**
 * Implementation of the physical physicalactivity entity.
 *
 * @extends {Entity}
 */
export class PhysicalActivity extends Activity {
    public name?: string // Name of physical physicalactivity.
    public calories?: number // Calories spent during physical physicalactivity.
    public steps?: number // Number of steps taken during the physical physicalactivity.
    public levels?: Array<PhysicalActivityLevel> // PhysicalActivity levels (sedentary, light, fair or very).


    public fromJSON(json: any): PhysicalActivity {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.name !== undefined) this.name = json.name
        if (json.calories !== undefined) this.calories = json.calories
        if (json.steps !== undefined) this.steps = json.steps
        if (json.levels !== undefined && json.levels instanceof Array) {
            this.levels = json.levels.map(level => new PhysicalActivityLevel().fromJSON(level))
        }

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                name: this.name,
                calories: this.calories,
                steps: this.steps,
                levels: this.levels ? this.levels.map(item => item.toJSON()) : this.levels
            }
        }
    }
}
