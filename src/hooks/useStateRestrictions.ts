import { useState, useEffect } from 'react';

interface StateRestriction {
  state: string;
  isRestricted: boolean;
  message: string;
}

const RESTRICTED_STATES = [
  'ID', // Idaho
  'KS', // Kansas
  'NE', // Nebraska
  'NC', // North Carolina
  'SC', // South Carolina
  'TN', // Tennessee
  'TX', // Texas
  'WY', // Wyoming
];

const STATE_MESSAGES: Record<string, string> = {
  'ID': 'We cannot ship THCA products to Idaho due to state regulations.',
  'KS': 'We cannot ship THCA products to Kansas due to state regulations.',
  'NE': 'We cannot ship THCA products to Nebraska due to state regulations.',
  'NC': 'We cannot ship THCA products to North Carolina due to state regulations.',
  'SC': 'We cannot ship THCA products to South Carolina due to state regulations.',
  'TN': 'We cannot ship THCA products to Tennessee due to state regulations.',
  'TX': 'We cannot ship THCA products to Texas due to state regulations.',
  'WY': 'We cannot ship THCA products to Wyoming due to state regulations.',
};

export const useStateRestrictions = () => {
  const [stateRestriction, setStateRestriction] = useState<StateRestriction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStateRestrictions = async () => {
      try {
        const userState = localStorage.getItem('user-state');
        
        if (userState) {
          const isRestricted = RESTRICTED_STATES.includes(userState.toUpperCase());
          setStateRestriction({
            state: userState.toUpperCase(),
            isRestricted,
            message: isRestricted ? STATE_MESSAGES[userState.toUpperCase()] || 'We cannot ship THCA products to your state due to local regulations.' : ''
          });
          setIsLoading(false);
          return;
        }

        setStateRestriction({
          state: 'UNKNOWN',
          isRestricted: false,
          message: ''
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking state restrictions:', error);
        setStateRestriction({
          state: 'UNKNOWN',
          isRestricted: false,
          message: ''
        });
        setIsLoading(false);
      }
    };

    checkStateRestrictions();
  }, []);

  const setUserState = (state: string) => {
    const stateUpper = state.toUpperCase();
    localStorage.setItem('user-state', stateUpper);
    
    const isRestricted = RESTRICTED_STATES.includes(stateUpper);
    setStateRestriction({
      state: stateUpper,
      isRestricted,
      message: isRestricted ? STATE_MESSAGES[stateUpper] || 'We cannot ship THCA products to your state due to local regulations.' : ''
    });
  };

  const clearUserState = () => {
    localStorage.removeItem('user-state');
    setStateRestriction({
      state: 'UNKNOWN',
      isRestricted: false,
      message: ''
    });
  };

  return {
    stateRestriction,
    isLoading,
    setUserState,
    clearUserState,
    isRestricted: stateRestriction?.isRestricted || false,
    restrictionMessage: stateRestriction?.message || ''
  };
};
