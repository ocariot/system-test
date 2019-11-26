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

        this.id = '5dd572e805560300431b1004'
        this.child_id = '5a62be07de34500146d9c544'
        this.date = this.generateDate()
        this.type = type
        this.categories_array = this.getCategoriesArray(this.type)

        return this
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
                return QfoodtrackingTypeMock.BREAKFAST
            case 1:
                return QfoodtrackingTypeMock.SNACK
            case 2:
                return QfoodtrackingTypeMock.LUNCH
            case 3:
                return QfoodtrackingTypeMock.AFTERNOON_SNACK
            case 4:
                return QfoodtrackingTypeMock.DINNER
            case 5:
                return QfoodtrackingTypeMock.CEIA
            default:
                return QfoodtrackingTypeMock.BREAKFAST
        }
    }

    private getCategoriesArray(type: string): Array<string> {
        switch (type) {
            case QfoodtrackingTypeMock.BREAKFAST:
                return this.getBreakFastFoods()
            case QfoodtrackingTypeMock.SNACK:
                return this.getSnackFoods()
            case QfoodtrackingTypeMock.LUNCH:
                return this.getMealFoods()
            case QfoodtrackingTypeMock.AFTERNOON_SNACK:
                return this.getSnackFoods()
            case QfoodtrackingTypeMock.DINNER:
                return this.getMealFoods()
            case QfoodtrackingTypeMock.CEIA:
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

        return ['Bread', amountBread.toString(), 'Cheese', amountCheese.toString(), 'Eggs', amountEggs.toString()
            , 'Yogurt', amountYogurt.toString(), 'Fruit', amountFruit.toString(), 'vegetable_milk', amountVegetable_Milk.toString()
            , 'ind_juice', amountInd_Juice.toString(), 'biscuits', amountBiscuits.toString(), 'ind_pastry', amountInd_Pastry.toString()
        ]
    }

    private getSnackFoods(): Array<string> {
        const amountPizza = Math.floor((Math.random() * 11))// 0-10
        const amountSandwich = Math.floor((Math.random() * 11))// 0-10
        const amountHamburguer = Math.floor((Math.random() * 11))// 0-10
        const amountSugar_Sodas = Math.floor((Math.random() * 11))// 0-10

        return ['Pizza', amountPizza.toString(), 'Sandwich', amountSandwich.toString(), 'Hamburguer'
            , amountHamburguer.toString(), 'Sugar_sodas', amountSugar_Sodas.toString()
        ]
    }

    private getMealFoods(): Array<string> {
        const amountRice = Math.floor((Math.random() * 11))// 0-10
        const amountPasta = Math.floor((Math.random() * 11))// 0-10
        const amountMeat = Math.floor((Math.random() * 11))// 0-10
        const amountLegumes = Math.floor((Math.random() * 11))// 0-10
        const amountFish = Math.floor((Math.random() * 11))// 0-10

        return ['Rice', amountRice.toString(), 'Pasta', amountPasta.toString(), 'Meat', amountMeat.toString(),
            'legumes', amountLegumes.toString(), 'Fish', amountFish.toString()
        ]
    }
}

export enum QfoodtrackingTypeMock {
    BREAKFAST = 'Breakfast',
    SNACK = 'Snack',
    AFTERNOON_SNACK = 'afternoon_snack',
    LUNCH = 'lunch',
    DINNER = 'Dinner',
    CEIA = 'Ceia'
}

