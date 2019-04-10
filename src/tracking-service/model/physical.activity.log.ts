import { Log } from './log'
import { Entity } from './entity'

/**
 * Entity implementation of the physicalactivities logs.
 */
export class PhysicalActivityLog extends Entity {
    public steps!: Array<Log> // Steps logs
    public calories!: Array<Log> // Calories logs

    public fromJSON(json: any): PhysicalActivityLog {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.steps !== undefined && json.steps instanceof Array) {
            this.steps = json.steps.map(steps => new Log().fromJSON(steps))
        }

        if (json.calories !== undefined && json.calories instanceof Array) {
            this.calories = json.calories.map(calories => new Log().fromJSON(calories))
        }

        return this
    }

    public toJSON(): any {
        return {
            steps: this.steps ? this.steps.map(item => item.toJSON()) : this.steps,
            calories: this.calories ? this.calories.map(item => item.toJSON()) : this.calories
        }
    }
}
