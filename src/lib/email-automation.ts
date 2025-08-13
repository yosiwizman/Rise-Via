/**
 * Advanced Email Automation System
 * Handles sophisticated email workflows, templates, and customer journey automation
 */

import { sql } from './neon';
import { emailService } from '../services/emailService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: 'welcome' | 'order_confirmation' | 'abandoned_cart' | 'loyalty_reward' | 'promotional' | 'newsletter' | 'custom';
  variables: string[]; // Array of variable names like ['firstName', 'orderTotal']
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  template_id: string;
  trigger_type: 'manual' | 'scheduled' | 'event_based' | 'drip_sequence';
  trigger_conditions: Record<string, unknown>;
  target_audience: 'all' | 'segment' | 'custom';
  audience_criteria: Record<string, unknown>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  send_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  trigger_event: 'user_registered' | 'order_placed' | 'cart_abandoned' | 'product_viewed' | 'loyalty_milestone' | 'custom';
  delay_minutes: number;
  template_id: string;
  conditions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSendLog {
  id: string;
  recipient_email: string;
  template_id: string;
  campaign_id?: string;
  automation_id?: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  created_at: string;
}

/**
 * Initialize email automation tables
 */
export async function initializeEmailAutomationTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping email automation table initialization');
      return;
    }

    // Email templates table
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT,
        template_type VARCHAR(50) NOT NULL,
        variables TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Email campaigns table
    await sql`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        template_id UUID NOT NULL,
        trigger_type VARCHAR(50) NOT NULL,
        trigger_conditions JSONB DEFAULT '{}',
        target_audience VARCHAR(50) DEFAULT 'all',
        audience_criteria JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'draft',
        send_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Email automations table
    await sql`
      CREATE TABLE IF NOT EXISTS email_automations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        trigger_event VARCHAR(100) NOT NULL,
        delay_minutes INTEGER DEFAULT 0,
        template_id UUID NOT NULL,
        conditions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Email send logs table
    await sql`
      CREATE TABLE IF NOT EXISTS email_send_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_email VARCHAR(255) NOT NULL,
        template_id UUID NOT NULL,
        campaign_id UUID,
        automation_id UUID,
        status VARCHAR(20) DEFAULT 'queued',
        sent_at TIMESTAMP,
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Email subscribers table
    await sql`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        subscription_source VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        preferences JSONB DEFAULT '{}',
        subscribed_at TIMESTAMP DEFAULT NOW(),
        unsubscribed_at TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_automations_trigger ON email_automations(trigger_event)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_send_logs_recipient ON email_send_logs(recipient_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_send_logs_status ON email_send_logs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status)`;

    console.log('✅ Email automation tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize email automation tables:', error);
  }
}

/**
 * Create email template
 */
export async function createEmailTemplate(
  name: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  templateType: EmailTemplate['template_type'],
  variables: string[] = []
): Promise<EmailTemplate | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const templates = await sql`
      INSERT INTO email_templates (name, subject, html_content, text_content, template_type, variables)
      VALUES (${name}, ${subject}, ${htmlContent}, ${textContent}, ${templateType}, ${variables})
      RETURNING *
    ` as Array<EmailTemplate>;

    return templates.length > 0 ? templates[0] : null;
  } catch (error) {
    console.error('Failed to create email template:', error);
    return null;
  }
}

/**
 * Get email template by ID
 */
export async function getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const templates = await sql`
      SELECT * FROM email_templates WHERE id = ${templateId} AND is_active = true
    ` as Array<EmailTemplate>;

    return templates.length > 0 ? templates[0] : null;
  } catch (error) {
    console.error('Failed to get email template:', error);
    return null;
  }
}

/**
 * Process email template with variables
 */
export function processEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; htmlContent: string; textContent: string } {
  let subject = template.subject;
  let htmlContent = template.html_content;
  let textContent = template.text_content || '';

  // Replace variables in template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
  }

  return { subject, htmlContent, textContent };
}

/**
 * Create email automation
 */
export async function createEmailAutomation(
  name: string,
  triggerEvent: EmailAutomation['trigger_event'],
  delayMinutes: number,
  templateId: string,
  conditions: Record<string, unknown> = {}
): Promise<EmailAutomation | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const automations = await sql`
      INSERT INTO email_automations (name, trigger_event, delay_minutes, template_id, conditions)
      VALUES (${name}, ${triggerEvent}, ${delayMinutes}, ${templateId}, ${JSON.stringify(conditions)})
      RETURNING *
    ` as Array<EmailAutomation>;

    return automations.length > 0 ? automations[0] : null;
  } catch (error) {
    console.error('Failed to create email automation:', error);
    return null;
  }
}

/**
 * Trigger email automation
 */
export async function triggerEmailAutomation(
  triggerEvent: EmailAutomation['trigger_event'],
  recipientEmail: string,
  eventData: Record<string, unknown> = {}
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping email automation');
      return;
    }

    // Get active automations for this trigger event
    const automations = await sql`
      SELECT * FROM email_automations 
      WHERE trigger_event = ${triggerEvent} AND is_active = true
    ` as Array<EmailAutomation>;

    for (const automation of automations) {
      // Check if conditions are met
      if (!checkAutomationConditions(automation.conditions, eventData)) {
        continue;
      }

      // Schedule email send
      const sendAt = new Date(Date.now() + automation.delay_minutes * 60 * 1000);
      
      await scheduleAutomationEmail(
        automation.id,
        automation.template_id,
        recipientEmail,
        eventData,
        sendAt
      );
    }
  } catch (error) {
    console.error('Failed to trigger email automation:', error);
  }
}

/**
 * Check if automation conditions are met
 */
function checkAutomationConditions(
  conditions: Record<string, unknown>,
  eventData: Record<string, unknown>
): boolean {
  // Simple condition checking - can be expanded for complex logic
  for (const [key, expectedValue] of Object.entries(conditions)) {
    if (eventData[key] !== expectedValue) {
      return false;
    }
  }
  return true;
}

/**
 * Schedule automation email
 */
async function scheduleAutomationEmail(
  automationId: string,
  templateId: string,
  recipientEmail: string,
  variables: Record<string, unknown>,
  sendAt: Date
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping email scheduling');
      return;
    }

    // Log the scheduled email
    await sql`
      INSERT INTO email_send_logs (recipient_email, template_id, automation_id, status)
      VALUES (${recipientEmail}, ${templateId}, ${automationId}, 'queued')
    `;

    // For immediate sends (delay = 0), send now
    if (sendAt <= new Date()) {
      await sendAutomationEmail(templateId, recipientEmail, variables);
    } else {
      // For delayed sends, you would typically use a job queue
      // For now, we'll use setTimeout (not recommended for production)
      const delay = sendAt.getTime() - Date.now();
      setTimeout(async () => {
        await sendAutomationEmail(templateId, recipientEmail, variables);
      }, delay);
    }
  } catch (error) {
    console.error('Failed to schedule automation email:', error);
  }
}

/**
 * Send automation email
 */
async function sendAutomationEmail(
  templateId: string,
  recipientEmail: string,
  variables: Record<string, unknown>
): Promise<void> {
  try {
    const template = await getEmailTemplate(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return;
    }

    const processedTemplate = processEmailTemplate(template, variables as Record<string, string>);

    // Send email using the email service
    const result = await emailService.sendEmail(
      recipientEmail,
      processedTemplate.subject,
      processedTemplate.htmlContent
    );

    // Update send log
    if (sql) {
      await sql`
        UPDATE email_send_logs 
        SET status = ${result ? 'sent' : 'failed'}, 
            sent_at = ${result ? new Date().toISOString() : null},
            error_message = ${result ? null : 'Failed to send email'}
        WHERE recipient_email = ${recipientEmail} 
        AND template_id = ${templateId} 
        AND status = 'queued'
      `;
    }
  } catch (error) {
    console.error('Failed to send automation email:', error);
    
    // Update send log with error
    if (sql) {
      await sql`
        UPDATE email_send_logs 
        SET status = 'failed', 
            error_message = ${error instanceof Error ? error.message : 'Unknown error'}
        WHERE recipient_email = ${recipientEmail} 
        AND template_id = ${templateId} 
        AND status = 'queued'
      `;
    }
  }
}

/**
 * Subscribe user to email list
 */
export async function subscribeToEmails(
  email: string,
  firstName?: string,
  lastName?: string,
  source: string = 'website',
  tags: string[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Service temporarily unavailable' };
    }

    // Check if already subscribed
    const existing = await sql`
      SELECT id, status FROM email_subscribers WHERE email = ${email}
    ` as Array<{ id: string; status: string }>;

    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return { success: true }; // Already subscribed
      } else {
        // Reactivate subscription
        await sql`
          UPDATE email_subscribers 
          SET status = 'active', subscribed_at = NOW(), unsubscribed_at = NULL
          WHERE email = ${email}
        `;
        return { success: true };
      }
    }

    // Create new subscription
    await sql`
      INSERT INTO email_subscribers (email, first_name, last_name, subscription_source, tags)
      VALUES (${email}, ${firstName || null}, ${lastName || null}, ${source}, ${tags})
    `;

    // Trigger welcome email automation
    await triggerEmailAutomation('user_registered', email, {
      firstName: firstName || 'Valued Customer',
      source
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to subscribe to emails:', error);
    return { success: false, error: 'Failed to subscribe to emails' };
  }
}

/**
 * Unsubscribe user from emails
 */
export async function unsubscribeFromEmails(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Service temporarily unavailable' };
    }

    await sql`
      UPDATE email_subscribers 
      SET status = 'unsubscribed', unsubscribed_at = NOW()
      WHERE email = ${email}
    `;

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe from emails:', error);
    return { success: false, error: 'Failed to unsubscribe from emails' };
  }
}

/**
 * Get email analytics
 */
export async function getEmailAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  topTemplates: Array<{ template_id: string; sent_count: number; open_rate: number }>;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        topTemplates: []
      };
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END) as total_sent,
        COUNT(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 END) as total_delivered,
        COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) as total_opened,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as total_clicked
      FROM email_send_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
    ` as Array<{
      total_sent: number;
      total_delivered: number;
      total_opened: number;
      total_clicked: number;
    }>;

    // Get top templates
    const topTemplates = await sql`
      SELECT 
        template_id,
        COUNT(*) as sent_count,
        CASE 
          WHEN COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END) > 0 
          THEN COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) * 100.0 / COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END)
          ELSE 0 
        END as open_rate
      FROM email_send_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY template_id
      ORDER BY sent_count DESC
      LIMIT 10
    ` as Array<{ template_id: string; sent_count: number; open_rate: number }>;

    const stats = overallStats[0] || {
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0
    };

    const deliveryRate = stats.total_sent > 0 ? (stats.total_delivered / stats.total_sent) * 100 : 0;
    const openRate = stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0;
    const clickRate = stats.total_opened > 0 ? (stats.total_clicked / stats.total_opened) * 100 : 0;

    return {
      totalSent: stats.total_sent,
      totalDelivered: stats.total_delivered,
      totalOpened: stats.total_opened,
      totalClicked: stats.total_clicked,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      topTemplates: topTemplates || []
    };
  } catch (error) {
    console.error('Failed to get email analytics:', error);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      topTemplates: []
    };
  }
}

// Initialize email automation tables on module load
initializeEmailAutomationTables();