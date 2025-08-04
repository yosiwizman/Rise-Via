import { useState, useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import { getCookieConsent, setCookieConsent } from '../utils/cookies';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasConsent = getCookieConsent();
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent(true);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All Cookies"
      cookieName="risevia_cookie_consent"
      style={{
        background: "linear-gradient(135deg, #8b5cf6, #7c3aed, #14b8a6)",
        color: "#ffffff",
        fontSize: "14px",
        padding: "20px"
      }}
      buttonStyle={{
        background: "#ffffff",
        color: "#8b5cf6",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "8px",
        padding: "10px 20px",
        border: "none",
        cursor: "pointer"
      }}
      expires={365}
      onAccept={handleAccept}
    >
      This website uses cookies for age verification, state compliance, and to enhance your browsing experience. 
      By continuing to use this site, you consent to our use of cookies as described in our{" "}
      <a href="#" style={{ color: "#ffffff", textDecoration: "underline" }}>
        Privacy Policy
      </a>.
    </CookieConsent>
  );
};
