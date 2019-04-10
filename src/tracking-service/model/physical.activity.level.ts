/**
 * Entity implementation of the physicalactivity levels.
 */
export class PhysicalActivityLevel {
    public name!: ActivityLevelType // Name of physical activity level (sedentary, light, fair or very).
    public duration!: number // Total time spent in milliseconds on the level.

    constructor(name?: ActivityLevelType, duration?: number) {
        if (name) this.name = name
        if (duration) this.duration = duration
    }

    public fromJSON(json: any): PhysicalActivityLevel {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            name: this.name,
            duration: this.duration
        }
    }
}

/**
 * Name of traceable physicalactivity levels.
 */
export enum ActivityLevelType {
    SEDENTARY = 'sedentary',
    LIGHTLY = 'lightly',
    FAIRLY = 'fairly',
    VERY = 'very'
}
