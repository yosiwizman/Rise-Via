import { supabase } from '../lib/supabase';

interface Customer {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface SearchFilters {
  segment?: string;
  isB2B?: string;
}

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        customer_profiles (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(customer: Customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) throw error;
    
    const { error: profileError } = await supabase
      .from('customer_profiles')
      .insert([{ customer_id: data.id }]);
    
    if (profileError) throw profileError;
    
    return data;
  },

  async update(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async search(searchTerm: string, filters: SearchFilters = {}) {
    let query = supabase
      .from('customers')
      .select(`
        *,
        customer_profiles (*)
      `);

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    if (filters.segment && filters.segment !== 'all') {
      query = query.eq('customer_profiles.segment', filters.segment);
    }

    if (filters.isB2B && filters.isB2B !== 'all') {
      query = query.eq('customer_profiles.is_b2b', filters.isB2B === 'true');
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
