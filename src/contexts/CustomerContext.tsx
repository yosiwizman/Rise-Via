import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profile?: {
    membershipTier: string;
    loyaltyPoints: number;
    lifetimeValue: number;
    totalOrders: number;
    segment: string;
    isB2B: boolean;
    referralCode: string;
    totalReferrals: number;
  };
}

interface CustomerContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider = ({ children }: CustomerProviderProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const mockCustomer = {
        id: 'demo-customer-1',
        email: 'demo@risevia.com',
        firstName: 'Demo',
        lastName: 'Customer',
        profile: {
          membershipTier: 'GOLD',
          loyaltyPoints: 1250,
          lifetimeValue: 2500.00,
          totalOrders: 8,
          segment: 'VIP',
          isB2B: false,
          referralCode: 'DEMO2024',
          totalReferrals: 3
        }
      };

      setCustomer(mockCustomer);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('customerToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email && password) {
      const mockCustomer = {
        id: 'demo-customer-1',
        email: email,
        firstName: 'Demo',
        lastName: 'Customer',
        profile: {
          membershipTier: 'GOLD',
          loyaltyPoints: 1250,
          lifetimeValue: 2500.00,
          totalOrders: 8,
          segment: 'VIP',
          isB2B: false,
          referralCode: 'DEMO2024',
          totalReferrals: 3
        }
      };

      localStorage.setItem('customerToken', 'demo-token-123');
      setCustomer(mockCustomer);
      setIsAuthenticated(true);
      return { success: true, customer: mockCustomer };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const register = async (registrationData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (registrationData.email && registrationData.firstName && registrationData.lastName) {
      const mockCustomer = {
        id: 'demo-customer-new',
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        profile: {
          membershipTier: 'GREEN',
          loyaltyPoints: 0,
          lifetimeValue: 0,
          totalOrders: 0,
          segment: 'New',
          isB2B: false,
          referralCode: `${registrationData.firstName.toUpperCase()}${new Date().getFullYear()}`,
          totalReferrals: 0
        }
      };

      localStorage.setItem('customerToken', 'demo-token-new');
      setCustomer(mockCustomer);
      setIsAuthenticated(true);
      return { success: true, customer: mockCustomer };
    }
    
    return { success: false, message: 'Missing required fields' };
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    setCustomer(null);
    setIsAuthenticated(false);
  };

  return (
    <CustomerContext.Provider value={{ 
      customer, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout, 
      checkAuthStatus 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
