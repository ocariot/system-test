import { accountDB } from '../src/account-service/database/account.db'

describe('testando', () => {
    for (let i = 1; i <= 20; i++) {
        it(`conexão ${i}: `, async () => {
            await accountDB.connect()
            await accountDB.dispose()
        })
    }
})