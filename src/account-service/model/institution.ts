import { Entity } from './entity'

/**
 * Implementation of the institution entity.
 *
 * @extends {Entity}
 */
export class Institution extends Entity {
    public type?: string // Type of institution, for example: Institute of Scientific Research.
    public name?: string // Name of institution.
    public address?: string // Address of institution.
    public latitude?: number // Latitude from place's geolocation, for example: -7.2100766.
    public longitude?: number // Longitude from place's geolocation, for example: -35.9175756.

    public fromJSON(json: any): Institution {
        if (!json) return this

        if (json.institution_id !== undefined) {
            super.id = json.institution_id.trim() !== '' ? json.institution_id : undefined
            return this
        }

        if (json.id !== undefined) super.id = json.id
        if (json.type !== undefined) this.type = json.type
        if (json.name !== undefined) this.name = json.name
        if (json.address !== undefined) this.address = json.address
        if (json.latitude !== undefined) this.latitude = parseFloat(json.latitude)      //  json.latitude is a string
        if (json.longitude !== undefined) this.longitude = parseFloat(json.longitude)   //  json.longitude is a string

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            type: this.type,
            name: this.name,
            address: this.address,
            latitude: this.latitude,
            longitude: this.longitude
        }
    }
}