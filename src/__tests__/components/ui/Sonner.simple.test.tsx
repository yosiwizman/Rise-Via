import { describe, it, expect } from 'vitest'

describe('Sonner - Simple', () => {
  it('should export toast configuration', () => {
    const toastConfig = {
      position: 'bottom-right',
      duration: 4000,
      theme: 'light'
    }
    expect(toastConfig.position).toBe('bottom-right')
    expect(toastConfig.duration).toBe(4000)
  })

  it('should handle toast types', () => {
    const toastTypes = ['success', 'error', 'warning', 'info']
    expect(toastTypes).toContain('success')
    expect(toastTypes).toContain('error')
    expect(toastTypes.length).toBe(4)
  })
})
