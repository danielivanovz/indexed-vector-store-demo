import { IDBPDatabase, openDB } from 'idb'

import config from './config'

export async function createDB(): Promise<IDBPDatabase<unknown>> {
    return openDB(config.DATABASE_NAME, config.DATABASE_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(config.STORE_NAME)) {
                const store = db.createObjectStore(config.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex(config.INDEX_STRATEGIES.MAGNITUDE, config.INDEX_STRATEGIES.MAGNITUDE, { unique: false });
                store.createIndex(config.INDEX_STRATEGIES.LSH, config.INDEX_STRATEGIES.LSH, { unique: false });

            }
        },
    })
}
