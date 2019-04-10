import { Educator } from './educator'
import { UserType } from './user'

/**
 * Implementation of the health professional entity.
 *
 * @extends {Educator}
 */
export class HealthProfessional extends Educator {
    constructor() {
        super()
        super.type = UserType.HEALTH_PROFESSIONAL
    }
}
