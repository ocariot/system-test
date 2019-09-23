/**
 * Implementation of the entity location.
 */
export class Location {
    public local!: string // Local where device is installed.
    public room!: string // Room where device is installed.
    public latitude?: number // Latitude from place's geolocation.
    public longitude?:number // Longitude from place's geolocation.

    public fromJSON(json: any): Location {
        if (!json) return this
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }

        if (json.local !== undefined) this.local = json.local
        if (json.room !== undefined) this.room = json.room
        if (json.latitude !== undefined) this.latitude = json.latitude
        if (json.longitude !== undefined) this.longitude = json.longitude

        return this
    }

    public toJSON(): any {
        return {
            local: this.local,
            room: this.room,
            latitude: this.latitude,
            longitude: this.longitude
        }
    }
}
