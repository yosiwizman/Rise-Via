import { vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const sql = vi.fn(async (strings: TemplateStringsArray, ..._values: any[]) => {
  const query = strings.join('?');
  
  if (query.includes('wishlist_sessions')) {
    return { 
      rows: [{ id: 1, session_token: 'test-token' }],
      rowCount: 1 
    };
  }
  
  if (query.includes('wishlist_items')) {
    return { 
      rows: [],
      rowCount: 0 
    };
  }
  
  if (query.includes('products')) {
    return {
      rows: [
        { id: 1, name: 'Test Product', price: 99.99 }
      ],
      rowCount: 1
    };
  }
  
  return { rows: [], rowCount: 0 };
});

export const neon = vi.fn(() => sql);
