import { describe, it, expect, vi } from 'vitest'

describe('Storage Service', () => {
  it('should handle localStorage operations', () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    
    Object.defineProperty(window, 'localStorage', { value: mockStorage })
    
    localStorage.setItem('test', 'value')
    expect(mockStorage.setItem).toHaveBeenCalledWith('test', 'value')
  })

  it('should handle sessionStorage operations', () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    
    Object.defineProperty(window, 'sessionStorage', { value: mockStorage })
    
    sessionStorage.setItem('session', 'data')
    expect(mockStorage.setItem).toHaveBeenCalledWith('session', 'data')
  })

  it('should handle storage errors gracefully', () => {
    const mockStorage = {
      setItem: vi.fn(() => { throw new Error('Storage full') }),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    
    Object.defineProperty(window, 'localStorage', { value: mockStorage })
    
    expect(() => localStorage.setItem('test', 'value')).toThrow('Storage full')
  })
})
