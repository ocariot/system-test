import request from 'supertest'
import { Environment } from 'tracking-service/model/environment'
import { PhysicalActivity } from 'tracking-service/model/physical.activity'
import { Sleep } from 'tracking-service/model/sleep'
import { Log, LogType } from 'tracking-service/model/log'
import { BodyFat } from 'tracking-service/model/body.fat';
import { Weight } from 'tracking-service/model/weight';

class TrackingUtil {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081'

    public saveEnvironment(accessToken: string, environment: Environment): Promise<any> {

        return request(this.URI)
            .post('/environments')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(environment.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public savePhysicalActivitiy(accessToken: string, physical_activity: PhysicalActivity, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/children/${child_ID}/physicalactivities`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(physical_activity.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveSleep(accessToken: string, sleep: Sleep, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/children/${child_ID}/sleep`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(sleep.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveLogs(accessToken: string, resource: LogType, logs: Array<Log>, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/children/${child_ID}/logs/${resource}`)
            .send(logs)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveBodyFat(accessToken: string, bodyFat: BodyFat, child_ID): Promise<any> {
        
        return request(this.URI)
            .post(`/children/${child_ID}/bodyfats`)
            .send(bodyFat.toJSON())
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveWeight(accessToken: string, weight: Weight, child_ID): Promise<any> {
        
        return request(this.URI)
            .post(`/children/${child_ID}/weights`)
            .send(weight.toJSON())
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

}

export const trck = new TrackingUtil()