import { describe, it, expect } from 'vitest'

describe('Constants Module', () => {
  it('should be importable', async () => {
    const constants = await import('../../utils/constants')
    expect(constants).toBeDefined()
  })

  it('should export basic constants', async () => {
    const constants = await import('../../utils/constants')
    expect(typeof constants).toBe('object')
  })

  it('should have valid exports', async () => {
    const constants = await import('../../utils/constants')
    expect(Object.keys(constants).length).toBeGreaterThan(0)
  })
})
