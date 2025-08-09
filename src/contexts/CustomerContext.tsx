import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';
import { emailService } from '../services/emailService';
import { wishlistService } from '../services/wishlistService';
import { listmonkService } from '../services/ListmonkService';
import { customerSegmentationService } from '../services/CustomerSegmentation';
import { emailAutomationService } from '../services/EmailAutomation';

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
    
    const authStateChange = authService.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setCustomer(null);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session) {
        checkAuthStatus();
      }
    });

    return () => {
      if (authStateChange && typeof authStateChange.then === 'function') {
        authStateChange.then(res => res.data.subscription.unsubscribe());
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const customers = await customerService.getAll();
      const customerData = customers.find((c: any) => c.email === (user as any).email);
      
      if (customerData) {
        setCustomer(customerData as any);
        setIsAuthenticated(true);
      } else {
        console.warn('User authenticated but no customer record found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const data = await authService.login(email, password);
      
      if (data.user) {
        try {
          await wishlistService.migrateSessionWishlist(data.user.id);
        } catch (migrationError) {
          console.error('Wishlist migration failed:', migrationError);
        }

        const customers = await customerService.getAll();
        const customerData = customers.find((c: any) => c.email === email);
        
        if (customerData) {
          setCustomer(customerData as any);
          setIsAuthenticated(true);
          return { success: true, customer: customerData };
        } else {
          setCustomer({
            id: data.user.id,
            email: data.user.email!,
            firstName: '',
            lastName: ''
          });
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: any) => {
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
            await customerSegmentationService.addCustomerToSegments(customerData);
          } catch (listmonkError) {
            console.error('Listmonk integration failed:', listmonkError);
          }
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
        }

        setCustomer(customerData as any);
        setIsAuthenticated(true);
        return { success: true, customer: customerData };
      }

      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
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
