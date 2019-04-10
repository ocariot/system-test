import { User } from '../../../src/account-service/model/user'
import { Institution } from '../../../src/account-service/model/institution'

export class UserMock extends User {

    constructor(type?: UserTypeMock) {
        super()
        super.fromJSON(JSON.stringify(this.generateUser(type)))
    }

    private generateUser(type?: UserTypeMock): User {
        if (!type) type = this.chooseType()

        const user: User = new User()
        user.id = this.generateObjectId()
        user.username = 'user_mock'
        user.password = 'user_password'
        user.type = type
        user.institution = this.generateInstitution()
        user.scopes = new Array<string>('readonly')

        return user
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

    private chooseType(): UserTypeMock {
        switch (Math.floor((Math.random() * 5))) { // 0-4
            case 0:
                return UserTypeMock.CHILD
            case 1:
                return UserTypeMock.EDUCATOR
            case 2:
                return UserTypeMock.HEALTH_PROFESSIONAL
            case 3:
                return UserTypeMock.FAMILY
            default:
                return UserTypeMock.APPLICATION
        }
    }
}

/**
 * Names of user types supported of mock.
 */
export enum UserTypeMock {
    CHILD = 'child',
    EDUCATOR = 'educator',
    HEALTH_PROFESSIONAL = 'healthprofessional',
    FAMILY = 'family',
    APPLICATION = 'application'
}
