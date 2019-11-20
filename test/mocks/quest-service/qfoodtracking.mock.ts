export class QfoodtrackingMock {
    public id?: string
    public child_id?: string
    public date?: Date
    public type?: string
    public categories_array?: Array<string>

    constructor() {
        this.generateQFoodTracking()
    }

    private generateQFoodTracking() {

        this.id = '5dd572e805560300431b1004'
        this.child_id = '5a62be07de34500146d9c544'
        this.date = new Date('2019-11-07T19:40:45.124Z')
        this.type = this.generateType()
        this.categories_array = this.getCategoriesArray()

        return this
    }

    private generateType(): string {
        switch (Math.floor((Math.random() * 5))) { // 0-4
            case 0:
                return QfoodtrackingTypeMock.BREAKFAST
            case 1:
                return QfoodtrackingTypeMock.SNACK
            case 2:
                return QfoodtrackingTypeMock.LANCHE_TARDE
            case 3:
                return QfoodtrackingTypeMock.DINNER
            case 4:
                return QfoodtrackingTypeMock.CEIA
            default:
                return QfoodtrackingTypeMock.BREAKFAST
        }
    }

    private getCategoriesArray(): Array<string> {
        const categoriesArr: Array<string> = new Array<string>()
        categoriesArr.push('Bread')
        categoriesArr.push('2')
        categoriesArr.push('Eggs')
        categoriesArr.push('1')

        return categoriesArr
    }
}

export enum QfoodtrackingTypeMock {
    BREAKFAST = 'Breakfast',
    SNACK = 'Snack',
    LANCHE_TARDE = 'lanche_tarde',
    DINNER = 'Dinner',
    CEIA = 'Ceia'
}

