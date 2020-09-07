import request from 'supertest'

class GamificationUtil {
    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public saveGamificationProfile(accessToken: string, gamificationProfile: any): Promise<any> {

        return request(this.URI)
            .post('/gamificationprofiles')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(gamificationProfile)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

}

export const gamification = new GamificationUtil()