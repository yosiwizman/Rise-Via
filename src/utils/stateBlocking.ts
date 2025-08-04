import { BLOCKED_STATES } from './constants';

export const isStateBlocked = (stateCode: string): boolean => {
  return BLOCKED_STATES.includes(stateCode.toUpperCase());
};

export const getBlockedStateMessage = (stateCode: string): string => {
  const stateName = stateCode; // Could be enhanced with state name lookup
  return `We cannot ship THCA products to ${stateName}. THCA products are not available in your state due to local regulations.`;
};

export const validateShippingState = (stateCode: string): { 
  isValid: boolean; 
  message?: string; 
} => {
  if (!stateCode) {
    return { isValid: false, message: 'Please select your state' };
  }
  
  if (isStateBlocked(stateCode)) {
    return { 
      isValid: false, 
      message: getBlockedStateMessage(stateCode) 
    };
  }
  
  return { isValid: true };
};
