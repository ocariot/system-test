import { HealthProfessional } from '../../../src/account-service/model/health.professional'
import { Institution } from '../../../src/account-service/model/institution'
import { ChildrenGroupMock } from './children.group.mock'

export class HealthProfessionalMock extends HealthProfessional {

    constructor() {
        super()
        this.generateHealthProfessional()
    }

    private generateHealthProfessional(): void {
        super.id = this.generateObjectId()
        super.username = 'healthprofessional '.concat(this.generateObjectId())
        super.password = 'healthprofessional123'
        super.institution = this.generateInstitution()
        super.children_groups = [new ChildrenGroupMock(), new ChildrenGroupMock()]
        super.last_login = new Date()
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateInstitution(): Institution {
        const institution = new Institution()
        institution.id = this.generateObjectId()
        institution.type = 'Institute of Scientific Research'
        institution.name = 'Name Example'
        institution.address = '221B Baker Street, St.'
        institution.latitude = Math.random() * 90
        institution.longitude = Math.random() * 180
        return institution
    }
}