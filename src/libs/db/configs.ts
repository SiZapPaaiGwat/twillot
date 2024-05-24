import { Config, OptionName } from '../../types'
import { openDb, getObjectStore, CONFIGS_TABLE_NAME } from './index'

// 创建或更新配置项
export async function upsertConfig(config: Config) {
  const db = await openDb()
  const { objectStore } = getObjectStore(db, CONFIGS_TABLE_NAME)
  return new Promise<void>((resolve, reject) => {
    const request = objectStore.put(config)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 读取配置项
export async function readConfig(optionName: OptionName) {
  const db = await openDb()
  const { objectStore } = getObjectStore(db, CONFIGS_TABLE_NAME)
  return new Promise<Config | undefined>((resolve, reject) => {
    const request = objectStore.get(optionName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 删除配置项
export async function deleteConfig(optionName: OptionName) {
  const db = await openDb()
  const { objectStore } = getObjectStore(db, CONFIGS_TABLE_NAME)
  return new Promise<void>((resolve, reject) => {
    const request = objectStore.delete(optionName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
