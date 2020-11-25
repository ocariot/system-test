export class RobotResultMock {
    public userId?: string
    public userName?: string
    public favoriteSport?: string
    public date?: string
    public missions?: Array<any>
    public userLog?: Array<any>

    constructor() {
        this.generateRobotResult()
    }

    private generateRobotResult() {
        this.userId = this.generateObjectId()
        this.userName = 'username'
        this.favoriteSport = 'basketball'
        this.date = this.generateDate()
        this.missions = this.generateMissions()
        this.userLog = this.generateUserLog()
    }

    private generateDate(): string {
        const dateStart = new Date(2018, 4, 15)
        const dateEnd = new Date()
        const randomDateMilliseconds = dateEnd.getTime() + Math.floor(Math.random() * (dateEnd.getTime() - dateStart.getTime()))

        return this.getDateFormattedAccordingToMissionsService(new Date(randomDateMilliseconds).toISOString())
    }

    private generateMissions(): Array<any> {
        const missions: Array<any> = new Array()
        missions.push({
            mission: 'mission',
            category: 'category'
        })
        return missions
    }

    private generateUserLog(): Array<any> {
        const userLog: Array<any> = new Array()
        userLog.push({
            question: 'question',
            answer: 'answer',
            score: 0,
            category: 'category'
        })
        return userLog
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    public fromJSON(robotResultMock: RobotResultMock) {
        const JSON = {
            userId: robotResultMock.userId,
            userName: robotResultMock.userName,
            favoriteSport: robotResultMock.favoriteSport,
            date: robotResultMock.date,
            missions: robotResultMock.missions,
            userLog: robotResultMock.userLog
        }

        return JSON
    }

    public getDateFormattedAccordingToMissionsService(date: string): string {
        return `${date.substring(0, 4)}-${date.substring(5, 7)}-${date.substring(8, 10)} ${date.substring(11, 13)}:${date.substring(14, 16)}:${date.substring(17, 19)}`
    }
}