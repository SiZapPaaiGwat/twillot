import { describe, it, expect, afterEach } from 'vitest'
import 'fake-indexeddb/auto'

import { deleteConfig, readConfig, upsertConfig } from './configs'
import { Config, OptionName } from '../../types'

describe('configManager', () => {
  afterEach(() => {
    indexedDB = new IDBFactory()
  })

  it('should be able to upsert, read, and delete config successfully', async () => {
    const config = {
      option_name: OptionName.FOLDER,
      option_value: 'folder1',
    } as Config
    await upsertConfig(config)
    const readResult = await readConfig(OptionName.FOLDER)
    expect(readResult).toEqual(config)
    await deleteConfig(OptionName.FOLDER)
    const deletedResult = await readConfig(OptionName.FOLDER)
    expect(deletedResult).toBeUndefined()
  })
})
