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

    public saveQ503SleepingHabits(accessToken: string, q503sleepinghabits: any): Promise<any> {

        return request(this.URI)
            .post('/q503sleepinghabits')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(q503sleepinghabits)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

    public saveQ501PhysicalActivityForChildren(accessToken: string, q501physicalactivityforchildren: any): Promise<any> {

        return request(this.URI)
            .post('/q501physicalactivityforchildren')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(q501physicalactivityforchildren)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

    public getQFoodTrackingByID(accessToken: string, questionnaire_id: string): Promise<any> {

        return request(this.URI)
            .get(`/qfoodtrackings/${questionnaire_id}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }

}

export const quest = new QuestionnairesUtil()