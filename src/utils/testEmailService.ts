import { orderService } from '../services/orderService';
import { emailService } from '../services/emailService';

export const testEmailService = {
  async createTestOrder() {
    try {
      const testOrder = await orderService.createOrder({
        customer_id: 'test-customer-id',
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        subtotal: 89.99,
        tax: 7.20,
        delivery_fee: 5.00,
        discount: 0,
        total: 102.19,
        fulfillment_type: 'delivery',
        items: [
          {
            product_id: 'test-product-1',
            product_name: 'Purple Haze',
            quantity: 2,
            price: 29.99
          },
          {
            product_id: 'test-product-2',
            product_name: 'Green Crack',
            quantity: 1,
            price: 30.01
          }
        ]
      });

      console.log('Test order created:', testOrder);
      return testOrder;
    } catch (error) {
      console.error('Error creating test order:', error);
      throw error;
    }
  },

  async testWelcomeEmail() {
    try {
      const result = await emailService.sendWelcomeEmail({
        name: 'Test User',
        email: 'test@example.com'
      });

      console.log('Welcome email test result:', result);
      return result;
    } catch (error) {
      console.error('Error testing welcome email:', error);
      throw error;
    }
  },

  async testStatusUpdateEmail() {
    try {
      const testOrder = {
        id: 'test-order-id',
        order_number: 'RV123456789',
        total: 102.19,
        created_at: new Date().toISOString()
      };

      const result = await emailService.sendOrderStatusUpdate(
        testOrder,
        'shipped',
        'test@example.com'
      );

      console.log('Status update email test result:', result);
      return result;
    } catch (error) {
      console.error('Error testing status update email:', error);
      throw error;
    }
  },

  async testLowStockAlert() {
    try {
      const testProducts = [
        {
          id: '1',
          name: 'Purple Haze',
          sku: 'PH-001',
          quantity: 2,
          low_stock_alert: 5
        },
        {
          id: '2',
          name: 'Green Crack',
          sku: 'GC-001',
          quantity: 1,
          low_stock_alert: 3
        }
      ];

      const result = await emailService.sendLowStockAlert(testProducts);

      console.log('Low stock alert test result:', result);
      return result;
    } catch (error) {
      console.error('Error testing low stock alert:', error);
      throw error;
    }
  }
};
