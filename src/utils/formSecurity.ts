import { SecurityUtils } from './security';

export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 1000,
  phone: 20,
  address: 200,
  businessName: 150,
  password: 128,
  firstName: 50,
  lastName: 50,
  companyName: 150,
  licenseNumber: 50,
  website: 200,
  description: 2000
} as const;

export const createSecureInputHandler = (setFormData: Function, fieldLimits: Record<string, number>) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const limit = fieldLimits[name] || 1000;
    const sanitizedValue = SecurityUtils.sanitizeInput(value).substring(0, limit);
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };
};

export const validateSecureInput = (value: string, type: 'email' | 'phone' | 'text' = 'text'): boolean => {
  if (!value || value.trim().length === 0) return false;
  
  switch (type) {
    case 'email':
      return SecurityUtils.isValidEmail(value);
    case 'phone':
      return SecurityUtils.isValidPhone(value);
    default:
      return value.length <= FIELD_LIMITS.message;
  }
};

export const generateCSRFToken = (): string => {
  return SecurityUtils.generateCSRFToken();
};

export const validateCSRFToken = (token: string): boolean => {
  return SecurityUtils.validateCSRFToken(token);
};
