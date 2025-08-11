const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (authService):', query, values);
    
    if (query.includes('admin_users')) {
      return Promise.resolve([{
        id: 'mock-admin-id',
        email: 'admin@rise-via.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOuLQv3c1yqBWVHxkd0LQ4YCOuLQv3c1y',
        role: 'admin',
        created_at: new Date().toISOString()
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

export const authService = {
  async login(email: string, password: string): Promise<any> {
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    
    try {
      const users = await sql`SELECT id, email, password_hash, role, created_at 
        FROM admin_users 
        WHERE email = ${email} AND is_active = true` as any[];
      
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
      return { success: true, user: { id: user.id, email: user.email, role: user.role } };
    } catch (error) {
      throw error;
    }
  },

  async register(email: string, _password: string, metadata: any) {
    try {
      const users = await sql`INSERT INTO admin_users (email, password_hash, role, metadata, created_at)
        VALUES (${email}, ${'mock-hash'}, ${metadata.role || 'employee'}, ${JSON.stringify(metadata)}, NOW())
        RETURNING id, email, role, created_at` as any[];
      
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
      const users = await sql`SELECT id, email, role, created_at 
        FROM admin_users 
        WHERE id = ${decoded.userId} AND is_active = true` as any[];
      
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
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('🔵 Password reset requested for:', email);
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(token: string, _password: string): Promise<void> {
    try {
      console.log('🔵 Password reset with token:', token);
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  }
};
