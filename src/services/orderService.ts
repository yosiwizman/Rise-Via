import { sql } from '../lib/neon'

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
      const orders = await sql`
        INSERT INTO orders (customer_id, total, status)
        VALUES (${orderData.customer_id}, ${orderData.total}, 'pending')
        RETURNING *
      `

      if (orders.length === 0) return null

      const order = orders[0]

      for (const item of orderData.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.price})
        `
      }

      return order as Order
    } catch (error) {
      return null
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orders = await sql`
        SELECT * FROM orders 
        WHERE id = ${orderId}
      `
      return orders.length > 0 ? orders[0] as Order : null
    } catch (error) {
      return null
    }
  },

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const orders = await sql`
        SELECT * FROM orders 
        WHERE customer_id = ${customerId}
        ORDER BY created_at DESC
      `
      return (orders || []) as Order[]
    } catch (error) {
      return []
    }
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const items = await sql`
        SELECT * FROM order_items 
        WHERE order_id = ${orderId}
        ORDER BY created_at ASC
      `
      return (items || []) as any[]
    } catch (error) {
      return []
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    try {
      const orders = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `
      return orders.length > 0 ? orders[0] as Order : null
    } catch (error) {
      return null
    }
  },

  async getOrderWithItems(orderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) return null

      const items = await this.getOrderItems(orderId)
      return { ...order, items }
    } catch (error) {
      return null
    }
  },
}
