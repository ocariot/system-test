export class Q503SleepingHabitsMock {
    public id?: string
    public child_id?: string
    public date?: Date
    public time_sleep?: string
    public time_wake_up?: string
    public time_nap?: string
    public percentage?: string
    public state?: string

    constructor() {
        this.generateQ503SleepingHabits()
    }

    private generateQ503SleepingHabits() {
        this.id = this.generateObjectId()
        this.child_id = this.generateObjectId()
        this.date = this.generateDate()
        this.time_sleep = this.generateTimeSleep()
        this.time_wake_up = this.generateTimeWakeUp()
        this.time_nap = 'true'
        this.percentage = 'true'
        this.state = 'Complete'

        return this
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateDate(): Date {
        const dateStart = new Date(2018, 4, 15)
        const dateEnd = new Date()
        const randomDateMilliseconds = dateEnd.getTime() + Math.floor(Math.random() * (dateEnd.getTime() - dateStart.getTime()))

        const date = new Date(randomDateMilliseconds)

        const month = date.getMonth() + 1
        let monthString = month.toString()

        const day = date.getDate()
        let dayString = day.toString()

        // Pass the month to the valid format
        if (monthString.length === 1) {
            monthString = '0' + monthString
        }

        // Pass the day to the valid format
        if (dayString.length === 1) {
            dayString = '0' + dayString
        }

        return date
        // return `${date.getFullYear()}-${monthString}-${dayString}`
    }

    private generateTimeSleep(): string {
        switch (Math.floor((Math.random() * 5))) { //[0,4]
            case 0:
                return 'Entre 8 pm-9 pm'
            case 1:
                return 'Entre 9 pm-10 pm'
            case 2:
                return 'Entre 10 pm-11 pm'
            case 3:
                return 'Entre 11 pm-12 pm'
            case 4:
                return 'Depois das 12 pm'
            default:
                return 'Entre 8 pm-9 pm'
        }
    }

    private generateTimeWakeUp(): string {
        switch (Math.floor((Math.random() * 5))) { //[0,4]
            case 0:
                return 'Antes das 6 am'
            case 1:
                return 'Entre 6 am-7 am'
            case 2:
                return 'Entre 7 am-8 am'
            case 3:
                return 'Entre 8 am-9 am'
            case 4:
                return 'Depois das 9am'
            default:
                return 'Antes das 6 am'
        }
    }

    public fromJSON(q503SleepingHabits: Q503SleepingHabitsMock): any {
        const JSON = {
            id: q503SleepingHabits.id,
            date: q503SleepingHabits.date!.toISOString(),
            child_id: q503SleepingHabits.child_id,
            time_sleep: q503SleepingHabits.time_sleep,
            time_wake_up: q503SleepingHabits.time_wake_up,
            time_nap: q503SleepingHabits.time_nap,
            percentage: q503SleepingHabits.percentage,
            state: q503SleepingHabits.state
        }

        return JSON
    }
}