import browser from 'webextension-polyfill'
import { describe, it, expect, beforeEach } from 'vitest'
import { addWorkflow } from './store'
import dataStore, { defaultState } from '../../options/store'

const [store, setStore] = dataStore

// Normally, the function being tested would be in a different file
async function isXyzEnabled(): Promise<boolean> {
  const { xyz } = await browser.storage.local.get('xyz')
  return xyz
}

describe('Workflow Store Module', () => {
  beforeEach(() => {
    browser.reset()
    setStore(defaultState())
  })

  it('should return true when enabled', async () => {
    const expected = true
    await browser.storage.local.set({ xyz: expected })
    const actual = await isXyzEnabled()
    expect(actual).toBe(expected)
  })

  it('addWorkflow', () => {
    addWorkflow()
    expect(store.workflows.length).toBe(1)
  })
})
