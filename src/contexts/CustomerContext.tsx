import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';
import { emailService } from '../services/emailService';
import { wishlistService } from '../services/wishlistService';
import { listmonkService } from '../services/ListmonkService';
import { emailAutomationService } from '../services/EmailAutomation';
import { membershipService } from '../services/membershipService';
import { SecurityUtils } from '../utils/security';

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

    const authHandler = authService.onAuthStateChange((event: string, session: unknown) => {
      if (event === 'SIGNED_OUT') {
        setCustomer(null);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session) {
        checkAuthStatus();
      }
    });

    return () => {
      if (authHandler?.data?.subscription?.unsubscribe) {
        authHandler.data.subscription.unsubscribe();
      }
    };
    // No console.log
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const customers = await customerService.getAll();
      const customerData = customers.find((c) => c.email === (user as { email: string }).email);

      if (customerData) {
        setCustomer(customerData as unknown as Customer);
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

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setLoading(true);

      const data = await authService.login(email, password);

      if (data.user) {
        try {
          await wishlistService.migrateSessionWishlist((data.user as { id: string }).id);
        } catch {
          // Silent fail for migration
        }

        const customers = await customerService.getAll();
        const customerData = customers.find((c) => c.email === email);

        if (customerData) {
          setCustomer({
            id: customerData.id,
            email: customerData.email,
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone,
            created_at: new Date().toISOString()
          } as Customer);
          setIsAuthenticated(true);
          return { 
            success: true, 
            customer: {
              id: customerData.id,
              email: customerData.email,
              first_name: customerData.first_name,
              last_name: customerData.last_name,
              phone: customerData.phone,
              created_at: new Date().toISOString()
            } as Customer
          };
        } else {
          setCustomer({
            id: (data.user as { id: string }).id,
            email: (data.user as { email: string }).email!,
            first_name: '',
            last_name: '',
            created_at: new Date().toISOString()
          });
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      return { success: false, message: 'Login failed' };
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: RegistrationData): Promise<RegisterResult> => {
    try {
      const authResult = await authService.register(
        registrationData.email,
        registrationData.password
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

          await customerService.updateCustomerProfile(customerData.id, {
            membership_tier: 'GREEN',
            loyalty_points: 0,
            referral_code: referralCode,
            total_referrals: 0,
            lifetime_value: 0,
            total_orders: 0,
            segment: 'new'
          });
        }

        const verificationToken = SecurityUtils.generateVerificationToken();
        try {
          await emailService.sendVerificationEmail(
            registrationData.email,
            registrationData.firstName,
            verificationToken
          );
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
      await authService.logout();
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
