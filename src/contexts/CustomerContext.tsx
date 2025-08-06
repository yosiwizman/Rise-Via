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

      const response = await fetch('/api/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('customerToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('customerToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('customerToken', data.token);
      setCustomer(data.customer);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (registrationData: any) => {
    const response = await fetch('/api/customers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('customerToken', data.token);
      setCustomer(data.customer);
      setIsAuthenticated(true);
    }
    return data;
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
