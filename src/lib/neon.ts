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
  api_settings: [
    {
      id: 'api-1',
      service_name: 'openai',
      api_key_encrypted: 'sk-mock-openai-key',
      configuration: { model: 'gpt-4', max_tokens: 1000 },
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  system_settings: [
    {
      key: 'site_name',
      value: 'Rise-Via',
      description: 'Site name',
      category: 'general'
    }
  ],
  customers: [
    {
      id: 'customer-1',
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe',
      created_at: new Date().toISOString()
    }
  ],
  customer_profiles: [],
  orders: [],
  products: [],
  wishlist_sessions: [],
  wishlist_items: [],
  blog_posts: []
};

export const sql = function(query: string, ...values: any[]) {
  console.log('Mock SQL Query called:', query, values);
  
  const queryLower = query.toLowerCase().trim();
  
  if (queryLower.includes('select') && queryLower.includes('admin_users')) {
    return Promise.resolve(mockDatabase.admin_users);
  }
  
  if (queryLower.includes('select') && queryLower.includes('api_settings')) {
    return Promise.resolve(mockDatabase.api_settings);
  }
  
  if (queryLower.includes('select') && queryLower.includes('system_settings')) {
    return Promise.resolve(mockDatabase.system_settings);
  }
  
  if (queryLower.includes('select') && queryLower.includes('customers')) {
    return Promise.resolve(mockDatabase.customers);
  }
  
  if (queryLower.includes('insert') || queryLower.includes('update')) {
    return Promise.resolve([{ id: 'mock-id', success: true }]);
  }
  
  return Promise.resolve([]);
};

sql.unsafe = (str: string) => str;

export const dbHelpers = {
  async findOne(tableName: string, conditions?: Record<string, any>) {
    console.log('Mock findOne called for table:', tableName, conditions);
    if (tableName === 'admin_users') {
      return mockDatabase.admin_users[0] || null;
    }
    return null;
  },
  
  async findMany(tableName: string, conditions: Record<string, any> = {}) {
    console.log('Mock findMany called for table:', tableName, conditions);
    if (tableName === 'admin_users') {
      return mockDatabase.admin_users;
    }
    if (tableName === 'customers') {
      return mockDatabase.customers;
    }
    return [];
  },
  
  async insertOne(tableName: string, data: Record<string, any>) {
    console.log('Mock insertOne called for table:', tableName);
    return { id: 'mock-id', ...data };
  }
};
