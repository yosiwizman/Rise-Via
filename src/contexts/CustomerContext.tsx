import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';
import { emailService } from '../services/emailService';
import { wishlistService } from '../services/wishlistService';
import { listmonkService } from '../services/ListmonkService';
import { emailAutomationService } from '../services/EmailAutomation';
import { membershipService } from '../services/membershipService';

export interface Customer {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at?: string;
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
    preferences: Record<string, unknown>;
    is_b2b?: boolean;
    business_name?: string;
    business_license?: string;
    segment?: string;
    lifetime_value?: number;
    total_orders?: number;
    referral_code?: string;
    total_referrals?: number;
    last_order_date?: string;
  }>;
}

export interface LoginResult {
  success: boolean;
  customer?: Customer;
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  customer?: Customer;
  message?: string;
  email?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface CustomerContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegistrationData) => Promise<RegisterResult>;
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
      const mockUser = {
        id: 'mock-user-id',
        email: 'user@example.com'
      };

      const customers = await customerService.getAll();
      const customerData = customers.find((c: any) => c.email === mockUser.email);
      
      if (customerData) {
        setCustomer(customerData as Customer);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, _password: string): Promise<LoginResult> => {
    try {
      setLoading(true);
      
      const mockUser = {
        id: 'mock-user-id',
        email: email
      };

      try {
        await wishlistService.migrateSessionWishlist(mockUser.id);
      } catch (migrationError) {
        console.error('Wishlist migration failed:', migrationError);
      }

      const customers = await customerService.getAll();
      const customerData = customers.find((c: any) => c.email === email);
      
      if (customerData) {
        setCustomer(customerData as Customer);
        setIsAuthenticated(true);
        return { success: true, customer: customerData };
      } else {
        setCustomer({
          id: mockUser.id,
          email: mockUser.email,
          first_name: '',
          last_name: ''
        });
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: RegistrationData): Promise<RegisterResult> => {
    try {
      const authResult = await authService.register(
        registrationData.email,
        registrationData.password,
        { firstName: registrationData.firstName, lastName: registrationData.lastName }
      );

      if (authResult.user) {
        const customerData = await customerService.create({
          email: registrationData.email,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          phone: registrationData.phone
        });

        if (customerData?.id) {
          const referralCode = membershipService.generateReferralCode(
            registrationData.firstName,
            registrationData.lastName,
            customerData.id
          );

          console.log('Customer profile would be updated with referral code:', referralCode);
        }

        try {
          console.log('Verification email would be sent to:', registrationData.email);
        } catch (emailError) {
          console.error('Verification email failed:', emailError);
        }

        try {
          await emailService.sendWelcomeEmail(
            registrationData.email,
            registrationData.firstName
          );

          await emailAutomationService.triggerWelcomeSeries(
            registrationData.email,
            registrationData.firstName
          );

          try {
            const subscriberData = {
              email: registrationData.email,
              name: `${registrationData.firstName} ${registrationData.lastName}`,
              status: 'enabled' as const,
              attributes: {
                membershipTier: 'GREEN',
                loyaltyPoints: 0,
                lifetimeValue: 0,
                segment: 'new',
                isB2B: false
              },
              lists: []
            };

            await listmonkService.addSubscriber(subscriberData);
          } catch {
            // Silent fail for Listmonk
          }
        } catch {
          // Silent fail for welcome emails
        }

        setCustomer(customerData as Customer);
        setIsAuthenticated(true);
        return { success: true, customer: customerData as Customer, email: registrationData.email };
      }

      return { success: false, message: 'Registration failed' };
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('customerToken');
      setCustomer(null);
      setIsAuthenticated(false);
    } catch {
      // Silent fail
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
