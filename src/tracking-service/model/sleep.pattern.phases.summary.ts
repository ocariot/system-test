import { SleepPatternSummaryData } from './sleep.pattern.summary.data'

export class SleepPatternPhasesSummary {
    public awake!: SleepPatternSummaryData
    public asleep!: SleepPatternSummaryData
    public restless!: SleepPatternSummaryData

    constructor(awake?: SleepPatternSummaryData, asleep?: SleepPatternSummaryData, restless?: SleepPatternSummaryData) {
        if (awake) this.awake = awake
        if (asleep) this.asleep = asleep
        if (restless) this.restless = restless
    }

    public toJSON(): any {
        return {
            awake: this.awake ? this.awake.toJSON() : this.awake,
            asleep: this.asleep ? this.asleep.toJSON() : this.asleep,
            restless: this.restless ? this.restless.toJSON() : this.restless
        }
    }
}