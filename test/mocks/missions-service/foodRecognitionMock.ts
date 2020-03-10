export class FoodRecognitionMock {
    public childId?: string
    public outcome?: string
    public imagePath?: string
    public date?: Date

    constructor() {
        this.generateFoodRecognition()
    }

    private generateFoodRecognition() {
        this.childId = this.generateObjectId()
        this.outcome = 'result obtained'
        this.imagePath = 'home/usr/public/1de40af0-3d25-11ea-b6d4-27aada5a6b2c.JPG'
        this.date = new Date(1560826800000 + Math.floor((Math.random() * 100000)))
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
            date: foodRecognitionMock.date?.toISOString()
        }

        return JSON
    }
}