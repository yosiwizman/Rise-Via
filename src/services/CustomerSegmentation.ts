import { customerService } from './customerService';
import { listmonkService } from './ListmonkService';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  customer_profiles?: Array<{
    membership_tier?: string;
    loyalty_points?: number;
    lifetime_value?: number;
    total_orders?: number;
    last_order_date?: string;
    is_b2b?: boolean;
  }>;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: (customer: Customer) => boolean;
  listmonkListId?: number;
  color: string;
}

class CustomerSegmentationService {
  private segments: CustomerSegment[] = [
    {
      id: 'vip',
      name: 'VIP Customers',
      description: 'High-value customers with $1500+ lifetime value',
      color: '#8b5cf6',
      criteria: (customer) => {
        const profile = customer.customer_profiles?.[0];
        return (profile?.lifetime_value || 0) >= 1500;
      }
    },
    {
      id: 'regular',
      name: 'Regular Customers',
      description: 'Customers with 2+ orders and $500+ lifetime value',
      color: '#10b981',
      criteria: (customer) => {
        const profile = customer.customer_profiles?.[0];
        return (profile?.total_orders || 0) >= 2 && (profile?.lifetime_value || 0) >= 500;
      }
    },
    {
      id: 'new',
      name: 'New Customers',
      description: 'Customers with less than 30 days since registration',
      color: '#3b82f6',
      criteria: (customer) => {
        const createdAt = new Date(customer.created_at).getTime();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return createdAt > thirtyDaysAgo;
      }
    },
    {
      id: 'dormant',
      name: 'Dormant Customers',
      description: 'No purchases in 60+ days',
      color: '#ef4444',
      criteria: (customer) => {
        const profile = customer.customer_profiles?.[0];
        if (!profile?.last_order_date) return true;
        const lastOrder = new Date(profile.last_order_date).getTime();
        const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
        return lastOrder < sixtyDaysAgo;
      }
    },
    {
      id: 'b2b',
      name: 'B2B Customers',
      description: 'Business customers and wholesale accounts',
      color: '#f59e0b',
      criteria: (customer) => {
        const profile = customer.customer_profiles?.[0];
        return profile?.is_b2b === true;
      }
    },
    {
      id: 'sativa_lovers',
      name: 'Sativa Enthusiasts',
      description: 'Customers who prefer Sativa strains',
      color: '#84cc16',
      criteria: (_customer) => {
        return true;
      }
    },
    {
      id: 'indica_lovers',
      name: 'Indica Enthusiasts',
      description: 'Customers who prefer Indica strains',
      color: '#6366f1',
      criteria: (_customer) => {
        return true;
      }
    },
    {
      id: 'hybrid_lovers',
      name: 'Hybrid Enthusiasts',
      description: 'Customers who prefer Hybrid strains',
      color: '#ec4899',
      criteria: (_customer) => {
        return true;
      }
    }
  ];

  async segmentCustomers(): Promise<Map<string, Customer[]>> {
    try {
      const customers = await customerService.getAll();
      const segmentedCustomers = new Map<string, Customer[]>();

      for (const segment of this.segments) {
        const matchingCustomers = customers.filter(segment.criteria);
        segmentedCustomers.set(segment.id, matchingCustomers);
      }

      return segmentedCustomers;
    } catch (error) {
      console.error('Failed to segment customers:', error);
      return new Map();
    }
  }

  async getCustomerSegments(customerId: string): Promise<string[]> {
    try {
      const customers = await customerService.getAll();
      const customer = customers.find(c => c.id === customerId);
      
      if (!customer) return [];

      return this.segments
        .filter(segment => segment.criteria(customer))
        .map(segment => segment.id);
    } catch (error) {
      console.error('Failed to get customer segments:', error);
      return [];
    }
  }

  getSegmentDefinitions(): CustomerSegment[] {
    return this.segments;
  }

  async syncSegmentsWithListmonk(): Promise<void> {
    try {
      const segmentedCustomers = await this.segmentCustomers();
      
      for (const segment of this.segments) {
        const customers = segmentedCustomers.get(segment.id) || [];
        
        try {
          const listResponse = await listmonkService.createList(segment.name);
          segment.listmonkListId = listResponse.data.id;
          
          for (const customer of customers) {
            if (customer.email && segment.listmonkListId) {
              try {
                const subscriberData = {
                  email: customer.email,
                  name: `${customer.first_name} ${customer.last_name}`,
                  status: 'enabled' as const,
                  attributes: {
                    membershipTier: customer.customer_profiles?.[0]?.membership_tier || 'GREEN',
                    loyaltyPoints: customer.customer_profiles?.[0]?.loyalty_points || 0,
                    lifetimeValue: customer.customer_profiles?.[0]?.lifetime_value || 0,
                    segment: segment.id,
                    isB2B: customer.customer_profiles?.[0]?.is_b2b || false
                  },
                  lists: [segment.listmonkListId]
                };

                await listmonkService.addSubscriber(subscriberData);
              } catch (subscriberError) {
                console.warn(`Failed to add subscriber ${customer.email} to segment ${segment.id}:`, subscriberError);
              }
            }
          }
        } catch (listError) {
          console.warn(`Failed to create list for segment ${segment.id}:`, listError);
        }
      }
    } catch (error) {
      console.error('Failed to sync segments with Listmonk:', error);
    }
  }

  async addCustomerToSegments(customer: Customer): Promise<void> {
    try {
      const segments = this.segments.filter(segment => segment.criteria(customer));
      
      for (const segment of segments) {
        if (segment.listmonkListId && customer.email) {
          try {
            const subscriberData = {
              email: customer.email,
              name: `${customer.first_name} ${customer.last_name}`,
              status: 'enabled' as const,
              attributes: {
                membershipTier: customer.customer_profiles?.[0]?.membership_tier || 'GREEN',
                loyaltyPoints: customer.customer_profiles?.[0]?.loyalty_points || 0,
                lifetimeValue: customer.customer_profiles?.[0]?.lifetime_value || 0,
                segment: segment.id,
                isB2B: customer.customer_profiles?.[0]?.is_b2b || false
              },
              lists: [segment.listmonkListId]
            };

            await listmonkService.addSubscriber(subscriberData);
          } catch (error) {
            console.warn(`Failed to add customer to segment ${segment.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to add customer to segments:', error);
    }
  }

  getSegmentStats(segmentedCustomers: Map<string, Customer[]>) {
    const stats = new Map();
    
    for (const [segmentId, customers] of segmentedCustomers) {
      const segment = this.segments.find(s => s.id === segmentId);
      if (segment) {
        const totalValue = customers.reduce((sum, customer) => {
          const profile = customer.customer_profiles?.[0];
          return sum + (profile?.lifetime_value || 0);
        }, 0);

        stats.set(segmentId, {
          name: segment.name,
          count: customers.length,
          totalValue,
          averageValue: customers.length > 0 ? totalValue / customers.length : 0,
          color: segment.color
        });
      }
    }
    
    return stats;
  }
}

export const customerSegmentationService = new CustomerSegmentationService();
