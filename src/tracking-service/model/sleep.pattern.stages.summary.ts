import { SleepPatternSummaryData } from './sleep.pattern.summary.data'

export class SleepPatternStagesSummary {
    public deep!: SleepPatternSummaryData
    public light!: SleepPatternSummaryData
    public rem!: SleepPatternSummaryData
    public awake!: SleepPatternSummaryData

    constructor(deep?: SleepPatternSummaryData, light?: SleepPatternSummaryData, rem?: SleepPatternSummaryData,
        awake?: SleepPatternSummaryData) {
        if (deep) this.deep = deep
        if (light) this.light = light
        if (rem) this.rem = rem
        if (awake) this.awake = awake
    }

    public toJSON(): any {
        return {
            deep: this.deep ? this.deep.toJSON() : this.deep,
            light: this.light ? this.light.toJSON() : this.light,
            rem: this.rem ? this.rem.toJSON() : this.rem,
            awake: this.awake ? this.awake.toJSON() : this.awake
        }
    }
}