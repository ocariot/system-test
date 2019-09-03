import { Log, LogType } from '../../../src/tracking-service/model/log'

export class LogMock extends Log {

    constructor(type?: string) {
        super()
        super.fromJSON(JSON.stringify(this.generateLog(type)))
    }

    private generateLog(type?: string): Log {
        if (!type) type = this.generateType()

        const log: Log = new Log()

        log.id = this.generateObjectId()
        log.date = this.generateDate()
        log.value = Math.floor(Math.random() * 10 + 1) * 100
        log.type = type
        log.child_id = this.generateObjectId()

        return log
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateDate(): string {
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
            monthString = "0" + monthString
        }

        // Pass the day to the valid format
        if (dayString.length === 1) {
            dayString = "0" + dayString
        }

        return `${date.getFullYear()}-${monthString}-${dayString}`
    }

    private generateType(): string {
        let logType: string
        switch (Math.floor((Math.random() * 3 + 1))) { // 1 or 3
            case 1:
                logType = LogType.STEPS
                return logType
            case 2:
                logType = LogType.CALORIES
                return logType
            default:
                return LogType.STEPS
        }
    }
}
