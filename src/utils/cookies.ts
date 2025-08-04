import Cookies from 'js-cookie';

export const COOKIE_NAMES = {
  AGE_VERIFIED: 'risevia_age_verified',
  STATE_SELECTION: 'risevia_state',
  COOKIE_CONSENT: 'risevia_cookie_consent'
};

export const setAgeVerified = (verified: boolean) => {
  Cookies.set(COOKIE_NAMES.AGE_VERIFIED, verified.toString(), { expires: 365 });
};

export const getAgeVerified = (): boolean => {
  return Cookies.get(COOKIE_NAMES.AGE_VERIFIED) === 'true';
};

export const setUserState = (state: string) => {
  Cookies.set(COOKIE_NAMES.STATE_SELECTION, state, { expires: 30 });
};

export const getUserState = (): string | undefined => {
  return Cookies.get(COOKIE_NAMES.STATE_SELECTION);
};

export const setCookieConsent = (consent: boolean) => {
  Cookies.set(COOKIE_NAMES.COOKIE_CONSENT, consent.toString(), { expires: 365 });
};

export const getCookieConsent = (): boolean => {
  return Cookies.get(COOKIE_NAMES.COOKIE_CONSENT) === 'true';
};

export const clearAllCookies = () => {
  Object.values(COOKIE_NAMES).forEach(cookieName => {
    Cookies.remove(cookieName);
  });
};
