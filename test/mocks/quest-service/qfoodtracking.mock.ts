export class QfoodtrackingMock {
    public id?: string
    public child_id?: string
    public date?: Date
    public type?: string
    public categories_array?: Array<string>

    constructor(type?: string) {
        this.generateQFoodTracking(type)
    }

    private generateQFoodTracking(type?: string) {

        if (!type) type = this.generateType()

        this.id = this.generateObjectId()
        this.child_id = '5a62be07de34500146d9c544'
        this.date = this.generateDate()
        this.type = type
        this.categories_array = this.getCategoriesArray(this.type)

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

    private generateType(): string {
        switch (Math.floor((Math.random() * 6))) { // 0-5
            case 0:
                return QFoodTrackingTypeMock.BREAKFAST
            case 1:
                return QFoodTrackingTypeMock.SNACK
            case 2:
                return QFoodTrackingTypeMock.LUNCH
            case 3:
                return QFoodTrackingTypeMock.AFTERNOON_SNACK
            case 4:
                return QFoodTrackingTypeMock.DINNER
            case 5:
                return QFoodTrackingTypeMock.CEIA
            default:
                return QFoodTrackingTypeMock.BREAKFAST
        }
    }

    private getCategoriesArray(type: string): Array<string> {
        switch (type) {
            case QFoodTrackingTypeMock.BREAKFAST:
                return this.getBreakFastFoods()
            case QFoodTrackingTypeMock.SNACK:
                return this.getSnackFoods()
            case QFoodTrackingTypeMock.LUNCH:
                return this.getMealFoods()
            case QFoodTrackingTypeMock.AFTERNOON_SNACK:
                return this.getSnackFoods()
            case QFoodTrackingTypeMock.DINNER:
                return this.getMealFoods()
            case QFoodTrackingTypeMock.CEIA:
                return this.getMealFoods()
            default:
                return this.getBreakFastFoods()
        }
    }

    private getBreakFastFoods(): Array<string> {
        const amountBread = Math.floor((Math.random() * 11))// 0-10
        const amountCheese = Math.floor((Math.random() * 11))// 0-10
        const amountEggs = Math.floor((Math.random() * 11))// 0-10
        const amountYogurt = Math.floor((Math.random() * 11))// 0-10
        const amountFruit = Math.floor((Math.random() * 11))// 0-10
        const amountVegetable_Milk = Math.floor((Math.random() * 11))// 0-10
        const amountInd_Juice = Math.floor((Math.random() * 11))// 0-10
        const amountBiscuits = Math.floor((Math.random() * 11))// 0-10
        const amountInd_Pastry = Math.floor((Math.random() * 11))// 0-10

        return [
            QFoodTrackingBreakFastFoodsMock.BREAD, amountBread.toString(),
            QFoodTrackingBreakFastFoodsMock.CHEESE, amountCheese.toString(),
            QFoodTrackingBreakFastFoodsMock.EGGS, amountEggs.toString(),
            QFoodTrackingBreakFastFoodsMock.YOGURT, amountYogurt.toString(),
            QFoodTrackingBreakFastFoodsMock.FRUIT, amountFruit.toString(),
            QFoodTrackingBreakFastFoodsMock.VEGETABLE_MILK, amountVegetable_Milk.toString(),
            QFoodTrackingBreakFastFoodsMock.IND_JUICE, amountInd_Juice.toString(),
            QFoodTrackingBreakFastFoodsMock.BISCUITS, amountBiscuits.toString(),
            QFoodTrackingBreakFastFoodsMock.IND_PASTRY, amountInd_Pastry.toString()
        ]
    }

    private getSnackFoods(): Array<string> {
        const amountPizza = Math.floor((Math.random() * 11))// 0-10
        const amountSandwich = Math.floor((Math.random() * 11))// 0-10
        const amountHamburguer = Math.floor((Math.random() * 11))// 0-10
        const amountSugar_Sodas = Math.floor((Math.random() * 11))// 0-10

        return [
            QFoodTrackingSnackFoodsMock.PIZZA, amountPizza.toString(),
            QFoodTrackingSnackFoodsMock.SANDWICH, amountSandwich.toString(),
            QFoodTrackingSnackFoodsMock.HAMBURGUER, amountHamburguer.toString(),
            QFoodTrackingSnackFoodsMock.SUGAR_SODAS, amountSugar_Sodas.toString()
        ]
    }

    private getMealFoods(): Array<string> {
        const amountRice = Math.floor((Math.random() * 11))// 0-10
        const amountPasta = Math.floor((Math.random() * 11))// 0-10
        const amountMeat = Math.floor((Math.random() * 11))// 0-10
        const amountLegumes = Math.floor((Math.random() * 11))// 0-10
        const amountFish = Math.floor((Math.random() * 11))// 0-10

        return [
            QFoodTrackingMealFoodsMock.RICE, amountRice.toString(),
            QFoodTrackingMealFoodsMock.PASTA, amountPasta.toString(),
            QFoodTrackingMealFoodsMock.MEAT, amountMeat.toString(),
            QFoodTrackingMealFoodsMock.LEGUMES, amountLegumes.toString(),
            QFoodTrackingMealFoodsMock.FISH, amountFish.toString()
        ]
    }

    public fromJSON(questionnaire: QfoodtrackingMock) {
        const JSON = {
            id: questionnaire.id,
            child_id: questionnaire.child_id,
            date: questionnaire.date!.toISOString(),
            type: questionnaire.type,
            categories_array: questionnaire.categories_array
        }
        return JSON
    }

}

export enum QFoodTrackingSnackFoodsMock {
    PIZZA = 'pizza',
    SANDWICH = 'sandwich',
    HAMBURGUER = 'hamburguer',
    SUGAR_SODAS = 'sugar_sodas'
}

export enum QFoodTrackingBreakFastFoodsMock {
    BREAD = 'bread',
    CHEESE = 'cheese',
    EGGS = 'eggs',
    YOGURT = 'yogurt',
    FRUIT = 'fruits',
    VEGETABLE_MILK = 'vegetable_milk',
    IND_JUICE = 'ind_juice',
    BISCUITS = 'biscuits',
    IND_PASTRY = 'ind_pastry'
}

export enum QFoodTrackingTypeMock {
    BREAKFAST = 'Breakfast',
    SNACK = 'Snack',
    AFTERNOON_SNACK = 'afternoon_snack',
    LUNCH = 'lunch',
    DINNER = 'Dinner',
    CEIA = 'Ceia'
}

export enum QFoodTrackingMealFoodsMock {
    RICE = 'rice',
    PASTA = 'pasta',
    MEAT = 'meat',
    LEGUMES = 'legumes',
    FISH = 'fish'
}