import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  setAgeVerified,
  getAgeVerified,
  setUserState,
  getUserState,
  setCookieConsent,
  getCookieConsent,
  clearAllCookies,
  COOKIE_NAMES
} from '../../utils/cookies'

vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn()
  }
}))

describe('cookie utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('age verification cookies', () => {
    it('should set age verification', async () => {
      const Cookies = (await import('js-cookie')).default
      
      setAgeVerified(true)
      
      expect(Cookies.set).toHaveBeenCalledWith(
        COOKIE_NAMES.AGE_VERIFIED,
        'true',
        { expires: 365 }
      )
    })

    it('should get age verification', async () => {
      const Cookies = (await import('js-cookie')).default
      vi.mocked(Cookies.get).mockImplementation(() => 'true')
      
      const result = getAgeVerified()
      
      expect(result).toBe(true)
      expect(Cookies.get).toHaveBeenCalledWith(COOKIE_NAMES.AGE_VERIFIED)
    })

    it('should handle missing age verification', async () => {
      const Cookies = (await import('js-cookie')).default
      vi.mocked(Cookies.get).mockImplementation(() => undefined)
      
      const result = getAgeVerified()
      
      expect(result).toBe(false)
    })
  })

  describe('user state cookies', () => {
    it('should set user state', async () => {
      const Cookies = (await import('js-cookie')).default
      
      setUserState('CA')
      
      expect(Cookies.set).toHaveBeenCalledWith(
        COOKIE_NAMES.STATE_SELECTION,
        'CA',
        { expires: 30 }
      )
    })

    it('should get user state', async () => {
      const Cookies = (await import('js-cookie')).default
      vi.mocked(Cookies.get).mockImplementation(() => 'CA')
      
      const result = getUserState()
      
      expect(result).toBe('CA')
      expect(Cookies.get).toHaveBeenCalledWith(COOKIE_NAMES.STATE_SELECTION)
    })

    it('should handle missing user state', async () => {
      const Cookies = (await import('js-cookie')).default
      vi.mocked(Cookies.get).mockImplementation(() => undefined)
      
      const result = getUserState()
      
      expect(result).toBeUndefined()
    })
  })

  describe('cookie consent', () => {
    it('should set cookie consent', async () => {
      const Cookies = (await import('js-cookie')).default
      
      setCookieConsent(true)
      
      expect(Cookies.set).toHaveBeenCalledWith(
        COOKIE_NAMES.COOKIE_CONSENT,
        'true',
        { expires: 365 }
      )
    })

    it('should get cookie consent', async () => {
      const Cookies = (await import('js-cookie')).default
      vi.mocked(Cookies.get).mockImplementation(() => 'true')
      
      const result = getCookieConsent()
      
      expect(result).toBe(true)
    })
  })

  describe('clearAllCookies', () => {
    it('should clear all cookies', async () => {
      const Cookies = (await import('js-cookie')).default
      
      clearAllCookies()
      
      expect(Cookies.remove).toHaveBeenCalledWith(COOKIE_NAMES.AGE_VERIFIED)
      expect(Cookies.remove).toHaveBeenCalledWith(COOKIE_NAMES.STATE_SELECTION)
      expect(Cookies.remove).toHaveBeenCalledWith(COOKIE_NAMES.COOKIE_CONSENT)
    })
  })

  describe('COOKIE_NAMES', () => {
    it('should export cookie name constants', () => {
      expect(COOKIE_NAMES.AGE_VERIFIED).toBe('risevia_age_verified')
      expect(COOKIE_NAMES.STATE_SELECTION).toBe('risevia_state')
      expect(COOKIE_NAMES.COOKIE_CONSENT).toBe('risevia_cookie_consent')
    })
  })
})
