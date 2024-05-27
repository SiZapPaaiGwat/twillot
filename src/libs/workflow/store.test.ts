import browser from 'webextension-polyfill'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  addWorkflow,
  getUnusedThen,
  getUnusedWhen,
  getUsedThens,
} from './store'
import dataStore, { defaultState } from '../../options/store'
import { Action } from './actions'
import { readConfig } from '../db/configs'

const [store, setStore] = dataStore

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

  it('getUnusedWhen should return the first unused trigger', () => {
    const unusedWhen = getUnusedWhen()
    expect(unusedWhen).toBe('CreateBookmark')
  })

  it('getUsedThens should return a set of current thens', () => {
    const currentThens = ['UnrollThread'] as Action[]
    const usedThens = getUsedThens(currentThens)
    expect(usedThens).toEqual(new Set(currentThens))
  })

  it('getUnusedThen should return the first unused action', () => {
    const currentThens = ['UnrollThread']
    const unusedThen = getUnusedThen(currentThens as Action[])
    expect(unusedThen).toBe('DeleteBookmark') // Assuming 'translate' is the default unused action
  })

  it('addWorkflow', () => {
    addWorkflow()
    expect(store.workflows.length).toBe(1)
    expect(store.workflows[0].name).toBe('')
    expect(store.workflows[0].unchanged).toBe(true)
    expect(store.workflows[0].editable).toBe(true)
  })
})
