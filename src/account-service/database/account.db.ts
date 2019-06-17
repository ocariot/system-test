import mongoose, { Connection, Mongoose } from 'mongoose'
import { EventEmitter } from 'events'

/**
 * Implementation of the interface that provides connection with MongoDB.
 * To implement the MongoDB abstraction the mongoose library was used.
 *
 * @see {@link https://mongoosejs.com/} for more details.
 * @implements {IConnectionDB}
 */
export class AccountDb {
    // private readonly COLLECTIONS_NAMES: Array<string> = ['users', 'institutions', 'childrengroups', 'integrationevents']

    private _connection?: Connection
    private readonly _eventConnection: EventEmitter
    private readonly options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        bufferMaxEntries: 0,
        reconnectTries: Number.MAX_SAFE_INTEGER,
        reconnectInterval: 1500
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
    public async connect(retries: number, interval: number): Promise<void> {
        const _this = this
        await this.createConnection(retries, interval)
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
            mongoose.connect(this.getURL(), this.options)
                .then((result: Mongoose) => resolve(result.connection))
                .catch(err => reject(err))
        })
    }

    private getURL(): string {
        return process.env.ACCOUNT_MONGODB_URI_TEST || 'mongodb://localhost:27018/account-service-test'
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
            console.log('Reconnection established with MongoDB...')
            this._eventConnection.emit('connected')
        })

        connection.on('disconnected', () => {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            console.log('Connection to MongoDB was lost...')
        })
    }

    /**
     * Releases the resources.
     *
     * @return {Promise<void>}
     */
    public async dispose(): Promise<void> {
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

    public deleteUsers(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this._connection) {
                this._connection.db
                    .collection('users')
                    .deleteMany({ 'type': { $ne: 'admin' } })
                    .then(() => resolve(true))
                    .catch(reject)
            }
            return resolve(false)
        })
    }

    public deleteInstitutions(): Promise<boolean> {
        return this._deleteCollection('institutions')
    }

    public deleteChildrenGroups(): Promise<boolean> {
        return this._deleteCollection('childrengroups')
    }

    public deleteIntegrationEvents(): Promise<boolean> {
        return this._deleteCollection('integrationevents')
    }

    public async removeCollections(): Promise<boolean> {
        if (this._connection) {
            const result = await this._connection.db
                .listCollections({
                    $or: [
                        { name: 'users' },
                        { name: 'institutions' },
                        { name: 'childrengroups' },
                        { name: 'integrationevents' }
                    ]
                })
                .toArray()

            let errors: Array<string> = []
            for (let c of result) {
                try {
                    if (c.name === 'users') {
                        await this.deleteUsers()
                    } else {
                        await this._deleteCollection(c.name)
                    }
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