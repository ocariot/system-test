import mongoose, { Connection } from 'mongoose'
import { EventEmitter } from 'events'

/**
 * Implementation of the interface that provides connection with MongoDB.
 * To implement the MongoDB abstraction the mongoose library was used.
 *
 * @see {@link https://mongoosejs.com/} for more details.
 * @implements {IConnectionDB}
 */
class TrackingDb {
    // private readonly COLLECTIONS_NAMES: Array<string> = ['users', 'institutions', 'childrengroups', 'integrationevents']

    private _connection?: Connection
    private readonly _eventConnection: EventEmitter
    private readonly options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        bufferMaxEntries: 0,
        reconnectTries: Number.MAX_SAFE_INTEGER,
        reconnectInterval: 1500,
        useUnifiedTopology: true
    }

    /**
     * Once connected, the reconnection policy is managed by the MongoDB driver,
     * the values set in the environment variables or in the default file are
     * used for the total number of retries and intervals between them.
     *
     * In case MongoDB is initially not available for a first connection,
     * a new attempt will be made every 2 seconds. After the successful
     * connection, reconnection will be automatically managed by the MongoDB driver.
     *
     * @param retries Total attempts to be made until give up reconnecting
     * @param interval Interval in milliseconds between each attempt
     * @return {Promise<void>}
     */
    public async connect(retries?: number, interval?: number): Promise<void> {
        const _this = this
        await this.createConnection(retries ? retries : 0, interval ? interval : 1000)
            .then((connection: Connection) => {
                this._connection = connection
                this.connectionStatusListener(this._connection)
                this._eventConnection.emit('connected')
            })
            .catch((err) => {
                this._connection = undefined
                this._eventConnection.emit('disconnected')
                console.log(`Error trying to connect for the first time with mongoDB: ${err.message}`)
                setTimeout(async () => {
                    _this.connect(retries, interval).then()
                }, 2000)
            })
    }


    /**
     * Create connection with MongoDB.
     *
     * @param retries
     * @param interval
     */
    private createConnection(retries: number, interval: number): Promise<Connection> {
        this.options.reconnectTries = (retries === 0) ? Number.MAX_SAFE_INTEGER : retries
        this.options.reconnectInterval = interval

        return new Promise<Connection>((resolve, reject) => {
            mongoose.createConnection(this.getURL(), this.options)
                .then((result) => resolve(result))
                .catch(err => reject(err))
        })
    }

    private getURL(): string {
        return process.env.TRACKING_MONGODB_URI_TEST || 'mongodb://localhost:27019/tracking-service-test'
    }

    constructor() {
        this._eventConnection = new EventEmitter()
    }

    get connection(): Connection | undefined {
        return this._connection
    }

    /**
     * Initializes connected and disconnected listeners.
     *
     * @param connection
     */
    private connectionStatusListener(connection: Connection | undefined): void {
        if (!connection) {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            return
        }

        connection.on('connected', () => {
            this._eventConnection.emit('connected')
        })

        connection.on('disconnected', () => {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
        })
    }

    /**
     * Releases the resources.
     *
     * @return {Promise<void>}
     */
    public async dispose(): Promise<void> {
        if (this._connection) await this._connection.removeAllListeners()
        if (this._connection) await this._connection.close()
        this._connection = undefined
    }

    private _deleteCollection(name: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.db
                    .collection(name)
                    .deleteMany({})
                    .then(() => resolve(true))
                    .catch(reject)
            } else {
                return resolve(false)
            }
        })
    }

    public deleteEnviroments(): Promise<boolean> {
        return this._deleteCollection('environments')
    }

    public deletePhysicalActivities(): Promise<boolean> {
        return this._deleteCollection('physicalactivities')
    }

    public deletePhysicalActivitiesLogs(): Promise<boolean> {
        return this._deleteCollection('physicalactivitieslogs')
    }

    public deleteSleepsRecords(): Promise<boolean> {
        return this._deleteCollection('sleeps')
    }

    public async removeCollections(): Promise<boolean> {
        if (this._connection) {
            const result = await this._connection.db
                .listCollections({
                    $or: [
                        { name: 'environments' },
                        { name: 'physicalactivities' },
                        { name: 'physicalactivitieslogs' },
                        { name: 'sleeps' }
                    ]
                })
                .toArray()

            let errors: Array<string> = []
            for (let c of result) {
                try {
                    await this._deleteCollection(c.name)
                } catch (err) {
                    errors.push(`Error in ${c.name}. ${err.message}`)
                }
            }
            if (errors.length > 0) return Promise.reject(errors)
            return Promise.resolve(true)
        }
        return Promise.reject(false)
    }
}
export const trackingDB = new TrackingDb()