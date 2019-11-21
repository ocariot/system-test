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
        this.date = new Date('2019-11-07T19:40:45.124Z')
        this.type = type
        this.categories_array = this.getCategoriesArray(this.type)

        return this
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
        return ['Bread', '2', 'Cheese', '1', 'Eggs', '1', 'Yogurt', '1', 'Fruit', '1', 'vegetable_milk', '1', 'ind_juice', '1', 'biscuits', '1', 'ind_pastry', '1']
    }

    private getSnackFoods(): Array<string> {
        return ['Pizza', '1', 'Sandwich', '1', 'Hamburguer', '1', 'Sugar_sodas', '1']
    }

    private getMealFoods(): Array<string> {
        return ['Rice', '1', 'Pasta', '1', 'Meat', '1', 'legumes', '1', 'Fish', '1']
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

