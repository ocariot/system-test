import { Institution } from '../../../src/account-service/model/institution'
import { ChildMock } from './child.mock'
import { ChildrenGroup } from '../../../src/account-service/model/children.group'
import { UserMock } from './user.mock'
import { HealthProfessional } from '../../../src/account-service/model/health.professional'

export class HealthProfessionalMock extends HealthProfessional {

    constructor() {
        super()
        this.generateHealthProfessional()
    }

    private generateHealthProfessional(): void {
        super.id = this.generateObjectId()
        super.username = 'health_professional_mock'
        super.password = 'health_professional_password'
        super.institution = this.generateInstitution()

        const children_group: ChildrenGroup = new ChildrenGroup()
        children_group.name = 'children group 1'
        children_group.children = [new ChildMock(), new ChildMock(), new ChildMock()]
        children_group.school_class = 'Room 01'
        children_group.user = new UserMock()

        super.children_groups = [children_group]
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
