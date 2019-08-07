import request from 'supertest'
import { Environment } from 'tracking-service/model/environment'
import { PhysicalActivity } from 'tracking-service/model/physical.activity'
import { Sleep } from 'tracking-service/model/sleep'
import { Log } from 'tracking-service/model/log'

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
            .post(`/users/children/${child_ID}/physicalactivities`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(physical_activity.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public saveSleepRecord(accessToken: string, logs: Log, resource: string, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/users/children/${child_ID}/physicalactivities/logs/${resource}`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(logs.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

    public savePhysicalActivitiesLogs(accessToken: string, sleep: Sleep, child_ID?: string): Promise<any> {

        return request(this.URI)
            .post(`/users/children/${child_ID}/sleep`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(sleep.toJSON())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }
}

export const trck = new TrackingUtil()