import request from 'supertest'

class DsAgentUtils {

    public readonly URI: string = process.env.AG_URL || 'https://localhost:8081/v1'

    public readonly tokenInformation = {
        "access_token": process.env.ACCESS_TOKEN,
        "refresh_token": process.env.REFRESH_TOKEN
    }

    public associateFitbitAccount(accessToken: string, childId?: string): Promise<any> {

        return request(this.URI)
            .post(`/users/${childId}/fitbit/auth`)
            .set('Authorization', 'Bearer '.concat(accessToken))
            .set('Content-Type', 'application/json')
            .send(this.tokenInformation)
            .then(res => Promise.resolve(res.body))
            .catch(err => Promise.reject(err))
    }

}

export const dsAgentUtils = new DsAgentUtils()