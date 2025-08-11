import { sql } from '../lib/neon';
import { hashPassword } from '../lib/database';

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
    const passwordHash = await hashPassword(password);
    
    if (!sql) {
      console.warn('⚠️ Database not available, returning login failure');
      throw new Error('Database not available');
    }
    
    const users = await sql`
      SELECT id, email, created_at 
      FROM users 
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `;
    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }
    const user = users[0] as User;
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  async register(email: string, password: string) {
    if (!sql) {
      console.warn('⚠️ Database not available, returning registration failure');
      throw new Error('Database not available');
    }
    
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existingUsers.length > 0) {
      throw new Error('User already exists with this email');
    }
    const passwordHash = await hashPassword(password);
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
      
      if (!sql) {
        console.warn('⚠️ Database not available, returning cached user');
        return user;
      }
      
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

  onAuthStateChange(callback: (event: string, session: { user: User } | null) => void) {
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
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (!sql) {
      console.warn('⚠️ Database not available, cannot process password reset');
      throw new Error('Database not available');
    }
    
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      throw new Error('No account found with this email address');
    }
    
    const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${users[0].id}, ${resetToken}, ${expiresAt})
      ON CONFLICT (user_id) 
      DO UPDATE SET token = ${resetToken}, expires_at = ${expiresAt}, created_at = NOW()
    `;
    
    console.log(`Password reset token generated for ${email}: ${resetToken}`);
    console.log(`Reset URL: ${window.location.origin}/?page=password-reset&token=${resetToken}`);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!sql) {
      console.warn('⚠️ Database not available, cannot reset password');
      throw new Error('Database not available');
    }

    const resetTokens = await sql`
      SELECT user_id FROM password_reset_tokens 
      WHERE token = ${token} AND expires_at > NOW()
    `;
    
    if (resetTokens.length === 0) {
      throw new Error('Invalid or expired reset token');
    }
    
    const passwordHash = await hashPassword(newPassword);
    
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE id = ${resetTokens[0].user_id}
    `;
    
    await sql`
      DELETE FROM password_reset_tokens 
      WHERE token = ${token}
    `;
  }
};
