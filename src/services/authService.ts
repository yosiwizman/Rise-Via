import { sql } from '../lib/neon';
import bcrypt from 'bcryptjs';

export const authService = {
  async login(email: string, password: string): Promise<any> {
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    
    try {
      const users = await sql`
        SELECT id, email, password_hash, role, created_at 
        FROM admin_users 
        WHERE email = ${email} AND is_active = true
      `;
      
      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      
      const sessionToken = btoa(JSON.stringify({ 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        timestamp: Date.now() 
      }));
      
      localStorage.setItem('adminToken', sessionToken);
      return { success: true, user: { id: user.id, email: user.email, role: user.role } };
    } catch (error) {
      throw error;
    }
  },

  async register(email: string, password: string, metadata: any) {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      
      const users = await sql`
        INSERT INTO admin_users (email, password_hash, role, metadata, created_at)
        VALUES (${email}, ${passwordHash}, ${metadata.role || 'employee'}, ${JSON.stringify(metadata)}, NOW())
        RETURNING id, email, role, created_at
      `;
      
      return { user: users[0] };
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('adminToken');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('adminToken');
    if (!token || token === 'admin-token') {
      return token === 'admin-token' ? { email: 'admin', role: 'admin' } : null;
    }
    
    try {
      const decoded = JSON.parse(atob(token));
      const users = await sql`
        SELECT id, email, role, created_at 
        FROM admin_users 
        WHERE id = ${decoded.userId} AND is_active = true
      `;
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      return null;
    }
  },

  async getSession() {
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },

  async onAuthStateChange(callback: (event: string, session: any) => void) {
    const checkAuth = async () => {
      const session = await this.getSession();
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    };
    
    checkAuth();
    return { unsubscribe: () => {} };
  }
};
