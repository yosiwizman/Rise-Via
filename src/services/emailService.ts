import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 'test_key');

export const emailService = {
  async sendWelcomeEmail(customer: { name: string; email: string }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .benefits { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .benefit-item { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Rise Via</div>
              <h1>Welcome to Our Community!</h1>
              <p>Premium THCa Products & Cannabis Excellence</p>
            </div>
            
            <div class="content">
              <h2>Hi ${customer.name}! 👋</h2>
              <p>Thank you for joining our community of cannabis enthusiasts! We're thrilled to have you on board.</p>
              
              <div class="benefits">
                <h3>Your Member Benefits:</h3>
                <div class="benefit-item">🎁 <strong>100 Bonus Points</strong> - Already added to your account!</div>
                <div class="benefit-item">💰 <strong>Exclusive Discounts</strong> - Member-only pricing on premium products</div>
                <div class="benefit-item">🚀 <strong>Early Access</strong> - First to know about new strains and products</div>
                <div class="benefit-item">📦 <strong>Free Shipping</strong> - On orders over $100</div>
                <div class="benefit-item">🏆 <strong>VIP Treatment</strong> - Priority customer support</div>
              </div>
              
              <p style="text-align: center;">
                <a href="https://risevia.com/shop" class="button">Start Shopping Now</a>
              </p>
              
              <p>Questions? Our team is here to help! Reply to this email or contact us at support@risevia.com</p>
            </div>
            
            <div class="footer">
              <p><strong>Rise Via Hemp Co.</strong> | Premium THCa Products</p>
              <p>📧 support@risevia.com | 📞 1-800-RISEVIA</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This email was sent to ${customer.email}. You're receiving this because you created an account with Rise Via.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <welcome@risevia.com>',
        to: customer.email,
        subject: 'Welcome to Rise Via - 100 Bonus Points Inside! 🎁',
        html
      });

      if (error) {
        console.error('Welcome email error:', error);
        return { success: false, error };
      }

      console.log('Welcome email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { success: false, error };
    }
  },

  async sendOrderConfirmation(order: any) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .order-details { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .product-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; display: flex; justify-content: space-between; align-items: center; }
            .product-item:last-child { border-bottom: none; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .total-row { font-weight: bold; font-size: 18px; color: #7c3aed; border-top: 2px solid #7c3aed; padding-top: 15px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Rise Via</div>
              <h1>Order Confirmation</h1>
              <p>Thank you for your order!</p>
            </div>
            
            <div class="content">
              <div class="order-details">
                <h2>Order #${order.order_number}</h2>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${order.customer_name || 'Valued Customer'}</p>
                <p><strong>Email:</strong> ${order.customer_email}</p>
              </div>
              
              <h3>Order Items:</h3>
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${order.items ? order.items.map((item: any) => `
                  <div class="product-item">
                    <div>
                      <strong>${item.product_name || item.name}</strong><br>
                      <span style="color: #6b7280;">Quantity: ${item.quantity}</span>
                    </div>
                    <div style="text-align: right;">
                      <div>$${item.price.toFixed(2)} each</div>
                      <div style="font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  </div>
                `).join('') : '<div class="product-item">Order items will be confirmed shortly</div>'}
                
                <div class="product-item total-row">
                  <div>Total Amount:</div>
                  <div>$${order.total.toFixed(2)}</div>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="https://risevia.com/account/orders/${order.id}" class="button">
                  View Order Details
                </a>
              </p>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">📋 What's Next?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li>We'll process your order within 24 hours</li>
                  <li>You'll receive tracking information once shipped</li>
                  <li>Adult signature (21+) required upon delivery</li>
                </ul>
              </div>
              
              <p>Questions about your order? Contact us at orders@risevia.com or call 1-800-RISEVIA</p>
            </div>
            
            <div class="footer">
              <p><strong>Rise Via Hemp Co.</strong> | Premium THCa Products</p>
              <p>📧 orders@risevia.com | 📞 1-800-RISEVIA</p>
              <p style="font-size: 12px; margin-top: 15px;">
                Order confirmation sent to ${order.customer_email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <orders@risevia.com>',
        to: order.customer_email,
        subject: `Order Confirmation #${order.order_number} - Rise Via 🌿`,
        html
      });

      if (error) {
        console.error('Order confirmation email error:', error);
        return { success: false, error };
      }

      console.log('Order confirmation email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Order confirmation email failed:', error);
      return { success: false, error };
    }
  },

  async sendOrderStatusUpdate(order: any, newStatus: string, customerEmail: string) {
    const statusMessages = {
      pending: { title: 'Order Received', message: 'We\'ve received your order and will begin processing it soon!' },
      confirmed: { title: 'Order Confirmed', message: 'Your order has been confirmed and is being prepared!' },
      preparing: { title: 'Order Being Prepared', message: 'Our team is carefully preparing your order!' },
      ready: { title: 'Order Ready', message: 'Your order is ready for pickup/delivery!' },
      shipped: { title: 'Order Shipped', message: 'Your order is on the way!' },
      delivered: { title: 'Order Delivered', message: 'Your order has been delivered!' },
      cancelled: { title: 'Order Cancelled', message: 'Your order has been cancelled.' }
    };

    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || 
                      { title: 'Order Update', message: `Your order status has been updated to ${newStatus}` };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .status-update { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .order-info { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Rise Via</div>
              <h1>${statusInfo.title}</h1>
            </div>
            
            <div class="content">
              <div class="status-update">
                <h2 style="margin: 0 0 15px 0; color: #0ea5e9;">📦 ${statusInfo.message}</h2>
                <p style="margin: 0; font-size: 18px;"><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
              </div>
              
              <div class="order-info">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> ${order.order_number}</p>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
              </div>
              
              ${newStatus === 'shipped' ? `
                <div style="background: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #15803d;">🚚 Shipping Information</h4>
                  <p style="margin: 0; color: #15803d;">Tracking information will be available soon. You'll receive another email with tracking details.</p>
                </div>
              ` : ''}
              
              ${newStatus === 'delivered' ? `
                <div style="background: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #15803d;">✅ Delivery Complete</h4>
                  <p style="margin: 0; color: #15803d;">Thank you for choosing Rise Via! We hope you enjoy your premium THCa products.</p>
                </div>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="https://risevia.com/account/orders/${order.id}" class="button">
                  View Order Details
                </a>
              </p>
              
              <p>Questions about your order? Contact us at orders@risevia.com or call 1-800-RISEVIA</p>
            </div>
            
            <div class="footer">
              <p><strong>Rise Via Hemp Co.</strong> | Premium THCa Products</p>
              <p>📧 orders@risevia.com | 📞 1-800-RISEVIA</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <updates@risevia.com>',
        to: customerEmail,
        subject: `${statusInfo.title} - Order #${order.order_number} 📦`,
        html
      });

      if (error) {
        console.error('Order status update email error:', error);
        return { success: false, error };
      }

      console.log('Order status update email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Order status update email failed:', error);
      return { success: false, error };
    }
  },

  async sendLowStockAlert(products: any[]) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .alert-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .product-list { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .product-item { padding: 10px; margin: 5px 0; background: white; border-radius: 5px; border-left: 4px solid #dc2626; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Rise Via</div>
              <h1>⚠️ Low Stock Alert</h1>
              <p>Immediate Action Required</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2 style="margin: 0 0 15px 0; color: #dc2626;">📉 Products Running Low</h2>
                <p style="margin: 0; color: #dc2626;"><strong>${products.length}</strong> products are currently below their low stock threshold and need immediate restocking.</p>
              </div>
              
              <div class="product-list">
                <h3>Products Requiring Attention:</h3>
                ${products.map(product => `
                  <div class="product-item">
                    <strong>${product.name}</strong><br>
                    <span style="color: #6b7280;">SKU: ${product.sku}</span><br>
                    <span style="color: #dc2626; font-weight: bold;">Current Stock: ${product.quantity} (Alert Level: ${product.low_stock_alert})</span>
                  </div>
                `).join('')}
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">💡 Recommended Actions:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li>Review and update inventory levels</li>
                  <li>Contact suppliers for restocking</li>
                  <li>Consider adjusting low stock alert thresholds</li>
                  <li>Update product availability on the website</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="https://risevia.com/admin" class="button">
                  Manage Inventory
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Rise Via Admin System</strong> | Inventory Management</p>
              <p>This alert was generated automatically based on your low stock thresholds.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <alerts@risevia.com>',
        to: 'admin@risevia.com',
        subject: `🚨 Low Stock Alert - ${products.length} Products Need Restocking`,
        html
      });

      if (error) {
        console.error('Low stock alert email error:', error);
        return { success: false, error };
      }

      console.log('Low stock alert email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Low stock alert email failed:', error);
      return { success: false, error };
    }
  }
};
