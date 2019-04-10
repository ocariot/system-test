import { Institution } from '../../../src/account-service/model/institution'

export class InstitutionMock extends Institution {
    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateInstitution()))
    }

    private generateInstitution(): Institution {
        const institution: Institution = new Institution()
        institution.id = this.generateObjectId()
        institution.type = 'Institute of Scientific Research'
        institution.name = 'Name Example'
        institution.address = '221B Baker Street, St.'
        institution.latitude = Math.random() * 90
        institution.longitude = Math.random() * 180

        return institution
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
