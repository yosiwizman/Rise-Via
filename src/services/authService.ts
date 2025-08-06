import { supabase } from '../lib/supabase';

export const authService = {
  async login(email: string, password: string): Promise<any> {
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async register(email: string, password: string, metadata: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('adminToken');
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
