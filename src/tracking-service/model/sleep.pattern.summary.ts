import { SleepPatternSummaryData } from './sleep.pattern.summary.data'

/**
 * The implementation of the summary entity of sleep pattern.
 */
export class SleepPatternSummary {
    public awake!: SleepPatternSummaryData
    public asleep!: SleepPatternSummaryData
    public restless!: SleepPatternSummaryData

    public fromJSON(json: any): SleepPatternSummary {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.awake !== undefined) this.awake = new SleepPatternSummaryData(json.awake.count, json.awake.duration)
        if (json.asleep !== undefined) this.asleep = new SleepPatternSummaryData(json.asleep.count, json.asleep.duration)
        if (json.restless !== undefined) {
            this.restless = new SleepPatternSummaryData(json.restless.count, json.restless.duration)
        }

        return this
    }

    public toJSON(): any {
        return {
            awake: this.awake,
            asleep: this.asleep,
            restless: this.restless
        }
    }
}
