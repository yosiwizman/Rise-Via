import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '../../test-utils'
import { useAgeGate } from '../../hooks/useAgeGate'

vi.mock('../../utils/cookies', () => ({
  getAgeVerified: vi.fn(),
  setAgeVerified: vi.fn()
}))

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
})

describe('useAgeGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with age gate open when not verified', async () => {
    const { getAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(false)
    
    const { result } = renderHook(() => useAgeGate())
    
    expect(result.current.showAgeGate).toBe(true)
    expect(result.current.isAgeVerified).toBe(false)
  })

  it('should initialize with age gate closed when already verified', async () => {
    const { getAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(true)
    
    const { result } = renderHook(() => useAgeGate())
    
    expect(result.current.showAgeGate).toBe(false)
    expect(result.current.isAgeVerified).toBe(true)
  })

  it('should verify age when user is over 21', async () => {
    const { getAgeVerified, setAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(false)
    
    const { result } = renderHook(() => useAgeGate())
    
    act(() => {
      result.current.verifyAge(true)
    })
    
    expect(setAgeVerified).toHaveBeenCalledWith(true)
    expect(result.current.isAgeVerified).toBe(true)
    expect(result.current.showAgeGate).toBe(false)
  })

  it('should redirect when user is under 21', async () => {
    const { getAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(false)
    
    const { result } = renderHook(() => useAgeGate())
    
    act(() => {
      result.current.verifyAge(false)
    })
    
    expect(window.location.href).toBe('https://www.google.com')
  })

  it('should call getAgeVerified on mount', async () => {
    const { getAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(true)
    
    renderHook(() => useAgeGate())
    
    expect(getAgeVerified).toHaveBeenCalled()
  })

  it('should update state when age verification changes', async () => {
    const { getAgeVerified, setAgeVerified } = await import('../../utils/cookies')
    vi.mocked(getAgeVerified).mockReturnValue(false)
    
    const { result } = renderHook(() => useAgeGate())
    
    expect(result.current.isAgeVerified).toBe(false)
    
    act(() => {
      result.current.verifyAge(true)
    })
    
    expect(result.current.isAgeVerified).toBe(true)
    expect(setAgeVerified).toHaveBeenCalledWith(true)
  })
})
