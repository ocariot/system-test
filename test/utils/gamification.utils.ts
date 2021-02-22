import request from 'supertest'
import { Question } from '../../src/gamification-service/model/question'

class GamificationUtil {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public saveQuestion(accessToken: string, question: Question): Promise<any> {
        return request(this.URI)
            .post('/questions')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(question.asJSONRequest())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public deleteQuestion(accessToken: string, question: Question): Promise<any> {
        return request(this.URI)
            .delete(`/questions/${question.id}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

}

export const gamification = new GamificationUtil()