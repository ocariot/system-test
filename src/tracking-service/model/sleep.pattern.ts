import { SleepPatternDataSet } from './sleep.pattern.data.set'
import { SleepPatternSummary } from './sleep.pattern.summary'

/**
 * Implementation of the entity of the pattern of sleep.
 */
export class SleepPattern {
    public data_set!: Array<SleepPatternDataSet> // Sleep pattern tracking.
    public summary!: SleepPatternSummary // Summary of sleep pattern.

    public fromJSON(json: any): SleepPattern {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.data_set !== undefined && json.data_set instanceof Array) {
            this.data_set = json.data_set.map(patternDataSet => new SleepPatternDataSet().fromJSON(patternDataSet))
        }
        if (json.summary !== undefined) this.summary = new SleepPatternSummary().fromJSON(json.summary)

        return this
    }

    public toJSON(): any {
        return {
            data_set: this.data_set ? this.data_set.map(item => item.toJSON()) : this.data_set,
            summary: this.summary ? this.summary.toJSON() : this.summary
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum SleepPatternType {
    AWAKE = 'awake',
    ASLEEP = 'asleep',
    RESTLESS = 'restless'
}
