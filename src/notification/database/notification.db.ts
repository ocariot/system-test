import mongoose, { Connection } from 'mongoose'
import { EventEmitter } from 'events'

/**
 * Implementation of the interface that provides connection with MongoDB.
 * To implement the MongoDB abstraction the mongoose library was used.
 *
 * @see {@link https://mongoosejs.com/} for more details.
 * @implements {IConnectionDB}
 */
class NotificationDB {
    private _connection?: Connection
    private readonly _eventConnection: EventEmitter
    private readonly options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        bufferMaxEntries: 0,
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
        return new Promise<Connection>((resolve, reject) => {
            mongoose.createConnection(this.getURL(), this.options)
                .then((result) => resolve(result))
                .catch(err => reject(err))
        })
    }

    private getURL(): string {
        return process.env.NOTIFICATION_MONGODB_URI_TEST || 'mongodb://localhost:27024/notification-service-test'
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

    public async removeCollections(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.db
                    .collections()
                    .then(collections => {
                        collections.forEach(collection => {
                            collection.deleteMany({})
                        })
                    }) 
                    .then(() => resolve(true))
                    .catch(reject)
            } else {
                return resolve(false)
            }
        })

    }
}
export const notificationDB =  new NotificationDB()