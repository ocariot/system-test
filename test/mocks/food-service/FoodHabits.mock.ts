import { Child } from '../../../src/account-service/model/child'

export class FoodHabitsMock {
    public id: string
    public date: Date
    public child_id: string
    public breakfast_habit: string
    public fresh_fruit: string
    public vegetables: string
    public sugary_sodas: string
    public industrial_pastry: string
    public industrial_juice: string
    public fast_food: string
    public sweets: string
    public fried_snacks: string
    public caloricDessert: string
    public dairy_products: string
    public fish: string
    public legume: string
    public nuts: string
    public variety_fruit: string
    public variety_vegetables: string
    public number_meals: string
    public water_consumption: string
    public family_cooking: string
    public family_purchasing: string
    public meals_screentime: string
    public screentime_mean: string
    public sports_parents: string
    public percentage: string    
    public state: string

    constructor(child: Child){
        this.id = this.generateObjectId()
        this.date = this.generateDate()
        this.child_id = child.id!

        this.breakfast_habit = 'Breakfast habits...'
        this.fresh_fruit = 'Fresh fruits...'
        this.vegetables = 'Vegetables...'
        this.sugary_sodas = 'Sugary sodas...'
        this.industrial_pastry = 'Industrial pastry...'
        this.industrial_juice = 'Industrial juice...'
        this.fast_food = 'Fast food...'
        this.sweets = 'Sweets...'
        this.fried_snacks = 'Friend snacks...'
        this.caloricDessert = 'Caloric dessert...'
        this.dairy_products = 'Dairy products...'
        this.fish = 'Fish...'
        this.legume = 'Legume...'
        this.nuts = 'Nuts...'
        this.variety_fruit = 'Variety fruit...'
        this.variety_vegetables = 'Variety vegetables...'
        this.number_meals = 'Number meals...'
        this.water_consumption = 'Water consumption...'
        this.family_cooking = 'Family cooking...'
        this.family_purchasing = 'Family purchasing...'
        this.meals_screentime = 'Meals screentime...'
        this.screentime_mean = 'Screentime mean...'
        this.sports_parents = 'Sports parents...'

        this.percentage = '100%'
        this.state = 'complete'
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
        const dateStart = new Date(2020, 12, 4)
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
    }

    public asJSONResponse(): any {
        return {
            id: this.id,
            date: this.date.toISOString(),
            child_id: this.child_id,
    
            breakfast_habit: this.breakfast_habit,
            fresh_fruit: this.fresh_fruit,
            vegetables: this.vegetables,
            sugary_sodas: this.sugary_sodas,
            industrial_pastry: this.industrial_pastry,
            industrial_juice: this.industrial_juice,
            fast_food: this.fast_food,
            sweets: this.sweets,
            fried_snacks: this.fried_snacks,
            caloricDessert: this.caloricDessert,
            dairy_products: this.dairy_products,
            fish: this.fish,
            legume: this.legume,
            nuts: this.nuts,
            variety_fruit: this.variety_fruit,
            variety_vegetables: this.variety_vegetables,
            number_meals: this.number_meals,
            water_consumption: this.water_consumption,
            family_cooking: this.family_cooking,
            family_purchasing: this.family_purchasing,
            meals_screentime: this.meals_screentime,
            screentime_mean: this.screentime_mean,
            sports_parents: this.sports_parents,
    
            percentage: this.percentage,
            state: this.state,
            }
    }

}