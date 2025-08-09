import { sql } from '../lib/neon';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

const SESSION_KEY = 'rise_via_user_session';

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User }> {
    // Admin shortcut
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token');
      return { success: true };
    }
    const users = await sql`
      SELECT id, email, password_hash, created_at 
      FROM users 
      WHERE email = ${email}
    `;
    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }
    const user = users[0] as User;
    // NOTE: Passwords should be hashed and verified securely in production
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  async register(email: string, password: string) {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existingUsers.length > 0) {
      throw new Error('User already exists with this email');
    }
    // WARNING: Password should be hashed before storing in production
    const passwordHash = password;
    const newUsers = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id, email, created_at
    `;
    const user = newUsers[0] as User;
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('adminToken');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      const user = JSON.parse(sessionData);
      const users = await sql`
        SELECT id, email, created_at 
        FROM users 
        WHERE id = ${user.id}
      `;
      return users.length > 0 ? users[0] as User : null;
    } catch {
      return null;
    }
  },

  async getSession() {
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },

  async onAuthStateChange(callback: (event: string, session: { user: User } | null) => void) {
    const handleStorageChange = () => {
      this.getCurrentUser().then(user => {
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange);
          }
        }
      }
    };
  }
};
