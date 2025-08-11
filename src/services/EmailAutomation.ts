import { emailService } from './emailService';
import { listmonkService } from './ListmonkService';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'registration' | 'purchase' | 'birthday' | 'dormant' | 'back_in_stock';
  delay?: number;
  enabled: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'educational' | 'promotional' | 'transactional';
}

class EmailAutomationService {
  private workflows: AutomationWorkflow[] = [
    {
      id: 'welcome_series',
      name: 'Welcome Email Series',
      description: '3-email welcome sequence for new customers',
      trigger: 'registration',
      enabled: true
    },
    {
      id: 'post_purchase',
      name: 'Post-Purchase Follow-up',
      description: 'Thank you and care instructions after purchase',
      trigger: 'purchase',
      delay: 24 * 60 * 60 * 1000,
      enabled: true
    },
    {
      id: 'review_request',
      name: 'Review Request',
      description: 'Request product review 7 days after delivery',
      trigger: 'purchase',
      delay: 7 * 24 * 60 * 60 * 1000,
      enabled: true
    },
    {
      id: 're_engagement',
      name: 'Re-engagement Campaign',
      description: 'Win back dormant customers',
      trigger: 'dormant',
      enabled: true
    },
    {
      id: 'birthday_discount',
      name: 'Birthday Discount',
      description: 'Special birthday offer for customers',
      trigger: 'birthday',
      enabled: true
    },
    {
      id: 'back_in_stock',
      name: 'Back in Stock Notification',
      description: 'Notify customers when products are restocked',
      trigger: 'back_in_stock',
      enabled: true
    }
  ];

  private templates: EmailTemplate[] = [
    {
      id: 'welcome_1',
      name: 'Welcome Email 1 - Introduction',
      subject: 'Welcome to Rise Via - Your Premium THCA Journey Begins!',
      type: 'welcome',
      body: `
        <h1>Welcome to Rise Via!</h1>
        <p>Hi {{customer_name}},</p>
        <p>Welcome to the Rise Via family! We're thrilled to have you join our community of cannabis enthusiasts.</p>
        <p>At Rise Via, we're committed to providing you with the highest quality THCA products, backed by rigorous lab testing and exceptional customer service.</p>
        
        <h3>What makes us different:</h3>
        <ul>
          <li>🌿 Premium THCA flower with full COAs</li>
          <li>🔬 Third-party lab tested for purity and potency</li>
          <li>📦 Discreet, fast shipping nationwide</li>
          <li>💎 Loyalty rewards program</li>
        </ul>
        
        <p>
          <a href="{{shop_url}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Explore Our Products
          </a>
        </p>
        
        <p>Questions? We're here to help at support@risevia.com</p>
        <p>Welcome aboard!</p>
        <p>The Rise Via Team</p>
      `
    },
    {
      id: 'welcome_2',
      name: 'Welcome Email 2 - Education',
      subject: 'Understanding THCA - Your Guide to Premium Cannabis',
      type: 'educational',
      body: `
        <h1>Understanding THCA</h1>
        <p>Hi {{customer_name}},</p>
        <p>Now that you're part of the Rise Via family, let's dive into what makes THCA special.</p>
        
        <h3>What is THCA?</h3>
        <p>THCA (Tetrahydrocannabinolic Acid) is the non-psychoactive precursor to THC found in raw cannabis. When heated through smoking, vaping, or cooking, THCA converts to THC through a process called decarboxylation.</p>
        
        <h3>Why Choose THCA?</h3>
        <ul>
          <li>🌿 Federally compliant (under 0.3% Delta-9 THC)</li>
          <li>🔥 Converts to THC when heated</li>
          <li>🧪 Full spectrum cannabinoid profile</li>
          <li>🌱 Farm Bill compliant hemp-derived</li>
        </ul>
        
        <h3>How to Use THCA Flower:</h3>
        <p>• <strong>Smoking:</strong> Roll in papers or use a pipe/bong</p>
        <p>• <strong>Vaping:</strong> Use a dry herb vaporizer for cleaner consumption</p>
        <p>• <strong>Cooking:</strong> Decarboxylate first, then infuse into oils or butter</p>
        
        <p>
          <a href="{{learn_url}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Learn More
          </a>
        </p>
        
        <p>Happy exploring!</p>
        <p>The Rise Via Team</p>
      `
    },
    {
      id: 'welcome_3',
      name: 'Welcome Email 3 - Special Offer',
      subject: 'Exclusive 15% Off Your First Order!',
      type: 'promotional',
      body: `
        <h1>Your Exclusive Welcome Offer!</h1>
        <p>Hi {{customer_name}},</p>
        <p>As a thank you for joining Rise Via, we're excited to offer you an exclusive 15% discount on your first order!</p>
        
        <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #10b981; margin: 0;">Use Code: WELCOME15</h2>
          <p style="margin: 10px 0;">Valid for 7 days on your first order</p>
        </div>
        
        <h3>Popular First-Time Choices:</h3>
        <ul>
          <li>🌿 <strong>Sativa Blends:</strong> Energizing daytime options</li>
          <li>🌙 <strong>Indica Varieties:</strong> Relaxing evening choices</li>
          <li>⚖️ <strong>Hybrid Strains:</strong> Balanced effects</li>
        </ul>
        
        <p>
          <a href="{{shop_url}}?discount=WELCOME15" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Shop Now & Save 15%
          </a>
        </p>
        
        <p><small>*Offer expires in 7 days. Cannot be combined with other offers.</small></p>
        
        <p>Happy shopping!</p>
        <p>The Rise Via Team</p>
      `
    },
    {
      id: 'post_purchase',
      name: 'Post-Purchase Thank You',
      subject: 'Thank you for your order! Care & Usage Tips Inside',
      type: 'transactional',
      body: `
        <h1>Thank You for Your Order!</h1>
        <p>Hi {{customer_name}},</p>
        <p>Your order #{{order_number}} has been received and is being prepared for shipment. Thank you for choosing Rise Via!</p>
        
        <h3>Care & Storage Tips:</h3>
        <ul>
          <li>🌡️ Store in a cool, dry place (60-70°F)</li>
          <li>💨 Keep away from direct sunlight</li>
          <li>🔒 Use airtight containers to preserve freshness</li>
          <li>📅 Best consumed within 6-12 months</li>
        </ul>
        
        <h3>Usage Guidelines:</h3>
        <p>⚠️ <strong>Important:</strong> Start low and go slow. THCA converts to THC when heated.</p>
        <p>🔞 Must be 21+ to use. Keep away from children and pets.</p>
        <p>🚗 Do not drive or operate machinery after use.</p>
        
        <p>
          <a href="{{track_order_url}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Track Your Order
          </a>
        </p>
        
        <p>Questions? Contact us at support@risevia.com</p>
        <p>Enjoy responsibly!</p>
        <p>The Rise Via Team</p>
      `
    },
    {
      id: 'review_request',
      name: 'Review Request',
      subject: 'How was your Rise Via experience?',
      type: 'transactional',
      body: `
        <h1>How Was Your Experience?</h1>
        <p>Hi {{customer_name}},</p>
        <p>We hope you're enjoying your recent purchase from Rise Via! Your feedback helps us continue providing the best THCA products and service.</p>
        
        <h3>Quick Review:</h3>
        <p>How would you rate your experience with us?</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{review_url}}?rating=5" style="background: #10b981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin: 5px;">⭐⭐⭐⭐⭐</a>
          <a href="{{review_url}}?rating=4" style="background: #84cc16; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin: 5px;">⭐⭐⭐⭐</a>
          <a href="{{review_url}}?rating=3" style="background: #f59e0b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin: 5px;">⭐⭐⭐</a>
        </div>
        
        <h3>Share Your Thoughts:</h3>
        <ul>
          <li>🌿 Product quality and effects</li>
          <li>📦 Packaging and shipping experience</li>
          <li>💬 Customer service interactions</li>
          <li>💡 Suggestions for improvement</li>
        </ul>
        
        <p>
          <a href="{{review_url}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Leave a Review
          </a>
        </p>
        
        <p>Thank you for being part of the Rise Via community!</p>
        <p>The Rise Via Team</p>
      `
    },
    {
      id: 're_engagement',
      name: 'Re-engagement Campaign',
      subject: 'We miss you! Come back for 20% off',
      type: 'promotional',
      body: `
        <h1>We Miss You!</h1>
        <p>Hi {{customer_name}},</p>
        <p>It's been a while since your last visit to Rise Via, and we wanted to reach out to see how you're doing.</p>
        
        <p>We've been busy adding new strains and improving our service. Here's what's new:</p>
        
        <h3>What's New at Rise Via:</h3>
        <ul>
          <li>🌿 5 new premium THCA strains</li>
          <li>🚚 Faster shipping options</li>
          <li>💎 Enhanced loyalty rewards program</li>
          <li>📱 Improved mobile shopping experience</li>
        </ul>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #f59e0b; margin: 0;">Welcome Back Offer</h2>
          <h3 style="color: #f59e0b; margin: 10px 0;">20% OFF</h3>
          <p style="margin: 10px 0;">Use Code: COMEBACK20</p>
          <p><small>Valid for 14 days</small></p>
        </div>
        
        <p>
          <a href="{{shop_url}}?discount=COMEBACK20" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Shop Now & Save 20%
          </a>
        </p>
        
        <p>We'd love to have you back in the Rise Via family!</p>
        <p>The Rise Via Team</p>
      `
    }
  ];

  async triggerWelcomeSeries(customerEmail: string, customerName: string): Promise<void> {
    try {
      const welcomeEmails = this.templates.filter(t => t && t.id && typeof t.id === 'string' && t.id.startsWith('welcome_'));
      
      for (let i = 0; i < welcomeEmails.length; i++) {
        const delay = i * 2 * 24 * 60 * 60 * 1000;
        
        setTimeout(async () => {
          try {
            await emailService.sendWelcomeEmail(customerEmail, customerName);
            console.log(`Sent welcome email ${i + 1} to ${customerEmail}`);
          } catch (error) {
            console.error(`Failed to send welcome email ${i + 1}:`, error);
          }
        }, delay);
      }
    } catch (error) {
      console.error('Failed to trigger welcome series:', error);
    }
  }

  async triggerPostPurchaseFlow(customerEmail: string, orderNumber: string): Promise<void> {
    try {
      setTimeout(async () => {
        const template = this.templates.find(t => t.id === 'post_purchase');
        if (template) {
          await emailService.sendOrderConfirmation(customerEmail, {
            orderNumber,
            total: 0
          });
        }
      }, 24 * 60 * 60 * 1000);

      setTimeout(async () => {
        const template = this.templates.find(t => t.id === 'review_request');
        if (template) {
          await emailService.sendOrderConfirmation(customerEmail, {
            orderNumber: `REVIEW-${orderNumber}`,
            total: 0
          });
        }
      }, 7 * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to trigger post-purchase flow:', error);
    }
  }

  async triggerReEngagementCampaign(): Promise<void> {
    try {
      const dormantCustomers: Array<{ email: string; first_name: string }> = [];

      for (const customer of dormantCustomers) {
        if (customer.email) {
          const template = this.templates.find(t => t.id === 're_engagement');
          if (template) {
            await emailService.sendWelcomeEmail(customer.email, customer.first_name);
          }
        }
      }
    } catch (error) {
      console.error('Failed to trigger re-engagement campaign:', error);
    }
  }

  async sendNewsletterToSegment(): Promise<void> {
    try {
      const customers: Array<{ email: string; first_name: string }> = [];

      for (const customer of customers) {
        if (customer.email) {
          await emailService.sendWelcomeEmail(customer.email, customer.first_name);
        }
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    }
  }


  getWorkflows(): AutomationWorkflow[] {
    return this.workflows;
  }

  getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  async createListmonkCampaign(templateId: string): Promise<void> {
    try {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        await listmonkService.createCampaign({
          name: template.name,
          subject: template.subject,
          lists: [],
          type: 'regular',
          content_type: 'html',
          body: template.body
        });
      }
    } catch (error) {
      console.error('Failed to create Listmonk campaign:', error);
    }
  }
}

export const emailAutomationService = new EmailAutomationService();
export type { AutomationWorkflow, EmailTemplate };
