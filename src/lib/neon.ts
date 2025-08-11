export const mockDatabase = {
  admin_users: [
    {
      id: '1',
      email: 'admin@rise-via.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOuLQv3c1yqBWVHxkd0LQ4YCOuLQv3c1y',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      permissions: {
        products: { create: true, read: true, update: true, delete: true },
        orders: { create: true, read: true, update: true, delete: true },
        customers: { create: true, read: true, update: true, delete: true },
        inventory: { create: true, read: true, update: true, delete: true },
        reports: { view: true, export: true, advanced: true },
        settings: { api: true, users: true, system: true },
        media: { upload: true, manage: true, delete: true }
      },
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  api_settings: [],
  system_settings: [],
  customers: [],
  customer_profiles: []
};

export const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query:', query, values);
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

export const dbHelpers = {
  async findOne(tableName: string, conditions: Record<string, any>) {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const result = await sql`SELECT * FROM ${sql.unsafe(tableName)} WHERE ${sql.unsafe(whereClause)}`;
    return result[0] || null;
  },
  
  async findMany(tableName: string, conditions: Record<string, any> = {}) {
    if (Object.keys(conditions).length === 0) {
      return await sql`SELECT * FROM ${sql.unsafe(tableName)}`;
    }
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    return await sql`SELECT * FROM ${sql.unsafe(tableName)} WHERE ${sql.unsafe(whereClause)}`;
  },
  
  async insertOne(tableName: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const result = await sql`INSERT INTO ${sql.unsafe(tableName)} (${sql.unsafe(keys.join(', '))}) VALUES (${sql.unsafe(placeholders)}) RETURNING *`;
    return result[0];
  }
};
