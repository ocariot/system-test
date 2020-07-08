export class FoodRecognitionMock {
    public childId?: string
    public outcome?: string
    public imagePath?: string
    public date?: string

    constructor() {
        this.generateFoodRecognition()
    }

    private generateFoodRecognition() {
        this.childId = this.generateObjectId()
        this.outcome = 'result obtained'
        this.imagePath = '/home/usr/public/1de40af0-3d25-11ea-b6d4-27aada5a6b2c.JPG'
        this.date = this.generateDate()
    }

    private generateDate(): string {
        const dateStart = new Date(2018, 4, 15)
        const dateEnd = new Date()
        const randomDateMilliseconds = dateEnd.getTime() + Math.floor(Math.random() * (dateEnd.getTime() - dateStart.getTime()))

        return new Date(randomDateMilliseconds).toISOString()
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    public fromJSON(foodRecognitionMock: FoodRecognitionMock) {
        const JSON = {
            childId: foodRecognitionMock.childId,
            outcome: foodRecognitionMock.outcome,
            imagePath: foodRecognitionMock.imagePath,
            date: foodRecognitionMock.date
        }

        return JSON
    }

    public getDateFormattedAccordingToMissionsService(date: string): string {
        return `${date.substring(0, 4)}-${date.substring(5, 7)}-${date.substring(8, 10)} ${date.substring(11, 13)}:${date.substring(14, 16)}`
    }
}