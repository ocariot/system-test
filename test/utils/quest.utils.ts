import request from 'supertest'

class QuestionnairesUtil {
    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081'

    public saveQFoodTracking(accessToken: string, qfoodtracking: any): Promise<any> {

        return request(this.URI)
            .post('/qfoodtrackings')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(qfoodtracking)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

    public getQFoodTracking(accessToken: string, questionnaire_id: string): Promise<any> {

        return request(this.URI)
            .get(`/qfoodtrackings/${questionnaire_id}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

}

export const quest = new QuestionnairesUtil()