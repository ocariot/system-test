import { Institution } from '../../../src/account-service/model/institution'

export class InstitutionMock extends Institution {
    constructor() {
        super()
        this.generateInstitution()
    }

    private generateInstitution(): void {
        super.id = this.generateObjectId()
        super.type = 'Institute of Scientific Research'
        super.name = 'Institution '.concat(this.generateObjectId())
        super.address = '221B Baker Street, St.'
        super.latitude = Math.random() * 90
        super.longitude = Math.random() * 180
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
