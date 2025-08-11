const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (orderService):', query, values);
    
    if (query.includes('INSERT INTO orders')) {
      return Promise.resolve([{
        id: 'mock-order-id',
        customer_id: values[0] || 'mock-customer-id',
        total: values[1] || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
    
    if (query.includes('SELECT * FROM orders')) {
      return Promise.resolve([{
        id: 'mock-order-id',
        customer_id: 'mock-customer-id',
        total: 99.99,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
    
    if (query.includes('order_items')) {
      return Promise.resolve([{
        id: 'mock-item-id',
        order_id: 'mock-order-id',
        product_id: 'mock-product-id',
        quantity: 1,
        price: 99.99,
        created_at: new Date().toISOString()
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

export interface Order {
  id: string
  customer_id: string
  total: number
  status: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface CreateOrderData {
  customer_id: string
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  total: number
}

export const orderService = {
  async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for order creation');
        return null;
      }

      const orders = await sql`
        INSERT INTO orders (customer_id, total, status)
        VALUES (${orderData.customer_id}, ${orderData.total}, 'pending')
        RETURNING *
      `;

      if (orders.length === 0) return null;

      const order = orders[0];

      for (const item of orderData.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.price})
        `;
      }

      return order as Order;
    } catch {
      return null;
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for order retrieval');
        return null;
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE id = ${orderId}
      `;
      return orders.length > 0 ? orders[0] as Order : null;
    } catch {
      return null;
    }
  },

  async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for orders by email');
        return [];
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE customer_email = ${email}
        ORDER BY created_at DESC
      `;
      return (orders as Order[]) || [];
    } catch {
      return [];
    }
  },

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for orders by customer');
        return [];
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE customer_id = ${customerId}
        ORDER BY created_at DESC
      `;
      return (orders || []) as Order[];
    } catch {
      return [];
    }
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for order items');
        return [];
      }

      const items = await sql`
        SELECT * FROM order_items 
        WHERE order_id = ${orderId}
        ORDER BY created_at ASC
      `;
      return (items || []) as OrderItem[];
    } catch {
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for order status update');
        return null;
      }

      const orders = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `;
      return orders.length > 0 ? orders[0] as Order : null;
    } catch {
      return null;
    }
  },

  async getOrderWithItems(orderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return null;

      const items = await this.getOrderItems(orderId);
      return { ...order, items };
    } catch {
      return null;
    }
  },
};
