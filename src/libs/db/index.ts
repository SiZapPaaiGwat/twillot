import { IndexedDbIndexItem } from '../../types'

export const DB_VERSION = 10

export const DB_NAME = 'twillot'

export const TWEETS_TABLE_NAME = 'tweets'

export const CONFIGS_TABLE_NAME = 'configs'

export function getObjectStore(db: IDBDatabase, tableName = TWEETS_TABLE_NAME) {
  const transaction = db.transaction([tableName], 'readwrite')
  return {
    transaction,
    objectStore: transaction.objectStore(tableName),
  }
}

export function createSchema(
  db: IDBDatabase,
  transaction: IDBTransaction,
  tableName: string,
  keyPath: string,
  indexes: IndexedDbIndexItem[],
) {
  let objectStore = db.objectStoreNames.contains(tableName)
    ? transaction.objectStore(tableName)
    : db.createObjectStore(tableName, {
        keyPath: keyPath,
      })

  indexes.forEach((index) => {
    if (!objectStore.indexNames.contains(index.name)) {
      objectStore.createIndex(index.name, index.name, index.options)
    }
  })
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject('IndexedDB is not supported by this browser.')
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = (event: Event) => {
      reject(
        'Database error: ' +
          (event.target as IDBOpenDBRequest).error?.toString(),
      )
    }
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const target = event.target as IDBOpenDBRequest
      const db = target.result
      // DO NOT create a new transaction here
      const indexFields =
        'full_text,sort_index,screen_name,created_at,has_image,has_video,has_link,has_quote,is_long_text,folder'
          .split(',')
          .map((field) => ({
            name: field,
            options: {
              unique: false,
              multiEntry: false,
            },
          }))
      indexFields.push({
        name: 'tags',
        options: {
          unique: false,
          multiEntry: true,
        },
      })
      createSchema(
        db,
        target.transaction,
        TWEETS_TABLE_NAME,
        'tweet_id',
        indexFields,
      )
      createSchema(
        db,
        target.transaction,
        CONFIGS_TABLE_NAME,
        'option_name',
        [],
      )
    }

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }
  })
}
