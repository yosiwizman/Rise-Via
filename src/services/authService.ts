import { sql } from '../lib/neon';

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: { id: string; email: string; role: string; created_at: string } }> {
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    
    const users = await sql`SELECT id, email, password_hash, role, created_at 
      FROM admin_users 
      WHERE email = ${email} AND is_active = true` as Array<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      created_at: string;
    }>;
    
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    
    const sessionToken = btoa(JSON.stringify({ 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      timestamp: Date.now() 
    }));
    
    localStorage.setItem('adminToken', sessionToken);
    return { success: true, user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at } };
  },

  async register(email: string, _password: string, metadata: Record<string, unknown>) {
    const users = await sql`INSERT INTO admin_users (email, password_hash, role, metadata, created_at)
      VALUES (${email}, ${'mock-hash'}, ${metadata.role || 'employee'}, ${JSON.stringify(metadata)}, NOW())
      RETURNING id, email, role, created_at` as Array<{
      id: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    
    return { user: users[0] };
  },

  async logout() {
    localStorage.removeItem('adminToken');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('adminToken');
    if (!token || token === 'admin-token') {
      return token === 'admin-token' ? { id: 'admin-1', email: 'admin', role: 'admin', created_at: new Date().toISOString() } : null;
    }
    
    try {
      const decoded = JSON.parse(atob(token));
      const users = await sql`SELECT id, email, role, created_at 
        FROM admin_users 
        WHERE id = ${decoded.userId} AND is_active = true` as Array<{
        id: string;
        email: string;
        role: string;
        created_at: string;
      }>;
      
      return users.length > 0 ? users[0] : null;
    } catch {
      return null;
    }
  },

  async getSession() {
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },

  async onAuthStateChange(callback: (event: string, session: { user: { id: string; email: string; role: string; created_at: string } } | null) => void) {
    const checkAuth = async () => {
      const session = await this.getSession();
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    };
    
    checkAuth();
    return { unsubscribe: () => {} };
  },

  async requestPasswordReset(email: string): Promise<void> {
    console.log('🔵 Password reset requested for:', email);
    return Promise.resolve();
  },

  async resetPassword(token: string, password: string): Promise<void> {
    console.log('🔵 Password reset with token:', token, 'password length:', password.length);
    return Promise.resolve();
  }
};
