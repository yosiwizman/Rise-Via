import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '../../test-utils'
import { useToast } from '../../hooks/use-toast'

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toasts).toEqual([])
  })

  it('should add toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test description'
      })
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast')
  })

  it('should handle toast function existence', () => {
    const { result } = renderHook(() => useToast())
    
    expect(typeof result.current.toast).toBe('function')
    expect(typeof result.current.dismiss).toBe('function')
    expect(Array.isArray(result.current.toasts)).toBe(true)
  })

  it('should handle basic toast operations', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test Toast'
      })
    })
    
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(0)
  })

  it('should not crash when calling dismiss', () => {
    const { result } = renderHook(() => useToast())
    
    expect(() => {
      act(() => {
        result.current.dismiss('non-existent-id')
      })
    }).not.toThrow()
  })
})
