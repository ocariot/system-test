import request from 'supertest'
import { RobotResultMock } from '../mocks/missions-service/robotResult.mock'

class missionsUtil {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081'

    public saveRobotResult(accessToken: string, robotResult: RobotResultMock): Promise<any> {

        return request(this.URI)
            .post(`/robot-result`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(robotResult)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

}

export const missions = new missionsUtil()