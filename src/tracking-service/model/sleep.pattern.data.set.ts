/**
 * The implementation of the data set entity present in the sleep pattern.
 */
export class SleepPatternDataSet {
    public start_time!: Date // Date and time of the start of the pattern according to the UTC.
    public name!: string // Sleep pattern name (awake, asleep or restless).
    public duration!: number // Total in milliseconds of the time spent on the pattern.

    public fromJSON(json: any): SleepPatternDataSet {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.start_time !== undefined) this.start_time = new Date(json.start_time)
        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            start_time: this.start_time ? this.start_time.toISOString() : this.start_time,
            name: this.name,
            duration: this.duration
        }
    }
}
