import request from 'supertest'

class FoodUtil {
    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public saveFoodHabits(accessToken: string, foodHabits: any): Promise<any> {
        return request(this.URI)
            .post('/foodqs')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(foodHabits)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

}

export const food = new FoodUtil()