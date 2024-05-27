import { fakeBrowser } from '@webext-core/fake-browser'
import { describe, it, expect, beforeEach } from 'vitest'

// Normally, the function being tested would be in a different file
async function isXyzEnabled(): Promise<boolean> {
  const { xyz } = await fakeBrowser.storage.local.get('xyz')
  return xyz
}

describe('isXyzEnabled', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('should return true when enabled', async () => {
    const expected = true
    // Use either browser or fakeBrowser to setup your test case
    await fakeBrowser.storage.local.set({ xyz: expected })
    const actual = await isXyzEnabled()
    expect(actual).toBe(expected)
  })
})
