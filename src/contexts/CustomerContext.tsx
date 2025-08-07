import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';

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
  customer_profiles?: Array<{
    membership_tier: string;
    loyalty_points: number;
    lifetime_value: number;
    total_orders: number;
    segment: string;
    is_b2b: boolean;
    referral_code: string;
    total_referrals: number;
  }>;
}

interface CustomerContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: unknown; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; customer?: unknown; error?: string }>;
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
    try {
      const result = await authService.login(email, password);
      if (result.success || result.user) {
        if (result.user) {
          const customers = await customerService.getAll();
          const customerData = customers.find((c: { email: string }) => c.email === (result.user as { email: string })?.email);
          if (customerData) {
            setCustomer(customerData);
            setIsAuthenticated(true);
            return { success: true, customer: customerData };
          }
        }
        return result;
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: (error as Error).message || 'Login failed' };
    }
  };

  const register = async (registrationData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    try {
      const authResult = await authService.register(
        registrationData.email,
        registrationData.password,
        {
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          phone: registrationData.phone
        }
      );

      if (authResult.user) {
        const customerData = await customerService.create({
          email: registrationData.email,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          phone: registrationData.phone
        });

        setCustomer(customerData);
        setIsAuthenticated(true);
        return { success: true, customer: customerData };
      }

      return { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: (error as Error).message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCustomer(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
