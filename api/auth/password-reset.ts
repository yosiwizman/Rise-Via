import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _strings: TemplateStringsArray, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ..._values: unknown[]
    ) => {
      console.log('Mock SQL Query (password-reset API): DATABASE_URL not configured, using mock');
      return Promise.resolve([]);
    };

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { email, action, token, newPassword } = await request.json();

    if (action === 'request') {
      const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const users = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (users.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const userId = users[0].id;

      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${resetToken}, ${expiresAt})
        ON CONFLICT (user_id) 
        DO UPDATE SET token = ${resetToken}, expires_at = ${expiresAt}, created_at = CURRENT_TIMESTAMP
      `;

      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent',
        ...(process.env.NODE_ENV === 'development' && { token: resetToken })
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'reset') {
      const tokenData = await sql`
        SELECT prt.user_id, u.email 
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ${token} AND prt.expires_at > NOW()
      `;

      if (tokenData.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(newPassword);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const passwordHash = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const userId = tokenData[0].user_id;

      await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
      await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password reset successful' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Password reset API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
