import { ChildMock } from './child.mock'
import { Family } from '../../../src/account-service/model/family'
import { Institution } from '../../../src/account-service/model/institution'

export class FamilyMock extends Family {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateFamily()))
    }

    private generateFamily(): Family {
        const family: Family = new Family()
        family.id = this.generateObjectId()
        family.username = 'family_mock'
        family.password = 'family_password'
        family.institution = this.generateInstitution()
        family.children = [new ChildMock(), new ChildMock()]

        return family
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
