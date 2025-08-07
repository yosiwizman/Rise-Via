import { emailService } from '../services/emailService';
import { orderService } from '../services/orderService';

export const testCompleteEmailFlow = async () => {
  console.log('🧪 Testing complete email flow...');
  
  console.log('\n1. Testing Welcome Email...');
  try {
    const welcomeResult = await emailService.sendWelcomeEmail({
      email: 'test@risevia.com',
      name: 'Test Customer'
    });
    console.log('✅ Welcome email result:', welcomeResult);
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }

  console.log('\n2. Testing Order Confirmation Email...');
  try {
    const orderData = {
      id: 'test-order-' + Date.now(),
      order_number: 'RV' + Date.now(),
      customer_email: 'customer@risevia.com',
      customer_name: 'John Doe',
      total: 129.97,
      created_at: new Date().toISOString(),
      items: [
        {
          product_name: 'Purple Haze',
          quantity: 2,
          price: 39.99
        },
        {
          product_name: 'Green Crack',
          quantity: 1,
          price: 49.99
        }
      ]
    };
    
    const orderResult = await emailService.sendOrderConfirmation(orderData);
    console.log('✅ Order confirmation result:', orderResult);
  } catch (error) {
    console.error('❌ Order confirmation failed:', error);
  }

  console.log('\n3. Testing Order Status Update Email...');
  try {
    const statusResult = await emailService.sendOrderStatusUpdate(
      {
        id: 'test-order-123',
        order_number: 'RV123456789'
      },
      'shipped',
      'customer@risevia.com'
    );
    console.log('✅ Status update result:', statusResult);
  } catch (error) {
    console.error('❌ Status update failed:', error);
  }

  console.log('\n4. Testing Low Stock Alert Email...');
  try {
    const lowStockProducts = [
      { name: 'Purple Haze', inventory_count: 2 },
      { name: 'White Widow', inventory_count: 1 },
      { name: 'Green Crack', inventory_count: 3 }
    ];
    
    const alertResult = await emailService.sendLowStockAlert(lowStockProducts);
    console.log('✅ Low stock alert result:', alertResult);
  } catch (error) {
    console.error('❌ Low stock alert failed:', error);
  }

  console.log('\n🎯 Email flow testing complete!');
  console.log('📧 Check your Resend dashboard at https://resend.com/emails for delivery status');
};

export const testOrderCreationFlow = async () => {
  console.log('\n🛒 Testing Order Creation with Email Integration...');
  
  try {
    const testOrder = await orderService.createOrder({
      customer_id: 'test-customer-123',
      customer_email: 'testorder@risevia.com',
      customer_name: 'Test Customer',
      subtotal: 89.98,
      tax: 7.20,
      delivery_fee: 5.00,
      discount: 0,
      total: 102.18,
      fulfillment_type: 'delivery',
      items: [
        {
          product_id: 'prod-1',
          product_name: 'Purple Haze',
          quantity: 1,
          price: 39.99
        },
        {
          product_id: 'prod-2',
          product_name: 'Green Crack',
          quantity: 1,
          price: 49.99
        }
      ]
    });
    
    console.log('✅ Order created successfully:', testOrder);
    console.log('📧 Order confirmation email should have been sent automatically');
  } catch (error) {
    console.error('❌ Order creation failed:', error);
  }
};
