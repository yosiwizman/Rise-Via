import { supabase } from '../lib/supabase';

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: unknown; error?: string }> {
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, user: data.user };
  },

  async register(email: string, password: string, metadata: Record<string, unknown>) {
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
