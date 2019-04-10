/**
 * The implementation of the entity summary data of sleep pattern.
 */
export class SleepPatternSummaryData {
    public count?: number
    public duration?: number // in minutes

    constructor(count: number, duration: number) {
        this.count = count
        this.duration = duration
    }

    public fromJSON(json: any): SleepPatternSummaryData {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.count !== undefined) this.count = json.count
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            count: this.count,
            duration: this.duration
        }
    }
}
