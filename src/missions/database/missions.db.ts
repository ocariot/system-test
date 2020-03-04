import { Sequelize, Options } from 'sequelize'
import shelljs from 'shelljs'

class MissionsDb {

    private sequelize: Sequelize
    private readonly MISSIONS_DB_NAME?: string = process.env.MISSIONS_MYSQL_DB_NAME
    private readonly MISSIONS_DB_USER?: string = process.env.MISSIONS_DB_USER
    private readonly MISSIONS_DB_PASS?: string = process.env.MISSIONS_DB_PASS
    private readonly options: Options = {
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: false
        }
    }

    constructor() {
        this.sequelize = new Sequelize(this.MISSIONS_DB_NAME!, this.MISSIONS_DB_USER!, this.MISSIONS_DB_PASS!, this.options)
    }

    public async connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.sequelize.authenticate()
                .then(() => resolve(true))
                .catch(reject)
        })
    }

    public restoreDatabase(): any {
        const MISSIONS_CONTAINER_NAME: string = 'ocariot-mysql-missions'
        shelljs.exec(`cat ${__dirname}/backup.sql | docker exec -i ${MISSIONS_CONTAINER_NAME} /usr/bin/mysql -u ${this.MISSIONS_DB_USER} -p"${this.MISSIONS_DB_PASS}" ${this.MISSIONS_DB_NAME}`)
    }

    public showTables(): any {
        return this.sequelize.getQueryInterface().showAllSchemas()
    }

    public async close(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.sequelize.close()
                .then(() => resolve(true))
                .catch(reject)
        })
    }

}

export const missionsDB = new MissionsDb()

export enum TableNameMock {
    ACTIVITY_LOGIN = 'activitylogin',
    ADRESS = 'address',
    APP_ROLE = 'app_role',
    APP_USER = 'app_user',
    ARDENRULE = 'ardenrule',
    ARDENRULE_FOR_PATIENT = 'ardenruleforpatient',
    ASSIGNED_MISSION = 'assigned_mission',
    CATEGORY = 'category',
    CUSTOM_MIGRATIONS = 'custom_migrations',
    EDUCATOR_MISSION = 'educator_mission',
    FOOD_RECOGNITION = 'food_recognition',
    NOTIFICATION = 'notifications',
    OBSERVATION = 'observation',
    OBSERVATION_NEW = 'observations_new',
    PATIENT_AUDIT = 'patientaudit',
    ROBOT_RESULT = 'robot_result',
    ROBOT_RESULT_LOG = 'robot_result_log',
    ROBOT_RESULT_MISSION = 'robot_result_mission',
    RULES_RESULT = 'ruleresult',
    USER_ROLES = 'users_roles',
    WEEKLY_MISSION = 'weekly_mission',
    WEEKLY_QUESTIONNAIRES = 'weekly_questionnaires',
}

// sequelize.query("SELECT * FROM educator_mission").spread(function(results, metadata) {
//     console.log('REGISTROS DA TABELA educator_mission: ', results)
// })

// sequelize.getQueryInterface().dropTable('educator_mission').then(res => {
//     console.log(res)
// })
//
// sequelize.query("SELECT * FROM educator_mission").spread(function(results, metadata) {
//     console.log('RESULTS: ', results)
// })