export class RobotResultMock {
    public userId?: string
    public userName?: string
    public favoriteSport?: string
    public date?: Date
    public missions?: Array<any>
    public userLog?: Array<any>

    constructor() {
        this.generateRobotResult()
    }

    private generateRobotResult() {
        this.userId = this.generateObjectId()
        this.userName = 'username'
        this.favoriteSport = 'basketball'
        this.date = new Date(1560826800000 + Math.floor((Math.random() * 100000)))
        this.missions = this.generateMissions()
        this.userLog = this.generateUserLog()
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
            date: robotResultMock.date?.toISOString(),
            missions: robotResultMock.missions,
            userLog: robotResultMock.userLog
        }

        return JSON
    }
}