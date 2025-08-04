import { useState, useEffect } from 'react';
import { getAgeVerified, setAgeVerified } from '../utils/cookies';

export const useAgeGate = () => {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [showAgeGate, setShowAgeGate] = useState<boolean>(false);

  useEffect(() => {
    const verified = getAgeVerified();
    setIsAgeVerified(verified);
    setShowAgeGate(!verified);
  }, []);

  const verifyAge = (isOver21: boolean) => {
    if (isOver21) {
      setAgeVerified(true);
      setIsAgeVerified(true);
      setShowAgeGate(false);
    } else {
      window.location.href = 'https://www.google.com';
    }
  };

  return {
    isAgeVerified,
    showAgeGate,
    verifyAge
  };
};
