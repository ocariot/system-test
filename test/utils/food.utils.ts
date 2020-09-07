import request from 'supertest'

class FoodUtil {
    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public saveFood(accessToken: string, foodqs: any): Promise<any> {

        return request(this.URI)
            .post('/foodqs')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(foodqs)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }
}

export const food = new FoodUtil()