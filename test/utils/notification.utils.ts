import request from 'supertest'
import { NotificationUser } from '../../src/notification/model/notification.user'

class NotificationUtils {
    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public saveNotificationUser(accessToken: string, notificationUser: NotificationUser): Promise<any> {
        return request(this.URI)
            .post(`/notifications/user/${notificationUser.id}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '.concat(accessToken))
            .send(notificationUser.asJSONRequestBody())
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err.body))
    }
}

export const notificationUtils = new NotificationUtils()