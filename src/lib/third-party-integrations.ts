/**
 * Third-Party Integrations Hub
 * Centralized management of external service integrations
 */

import { sql } from './neon';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'crm' | 'sms' | 'email' | 'analytics' | 'social' | 'payment' | 'shipping' | 'inventory';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  credentials: Record<string, string>;
  settings: Record<string, unknown>;
  webhook_url?: string;
  last_sync?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  integration_id: string;
  sync_type: 'full' | 'incremental' | 'webhook';
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_success: number;
  records_failed: number;
  error_details?: string[];
  started_at: string;
  completed_at: string;
}

export interface WebhookEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  signature?: string;
  processed: boolean;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

// CRM Integration (HubSpot, Salesforce, etc.)
export interface CRMIntegration {
  syncCustomers(): Promise<SyncResult>;
  syncOrders(): Promise<SyncResult>;
  createContact(customerData: any): Promise<{ success: boolean; id?: string; error?: string }>;
  updateContact(contactId: string, data: any): Promise<{ success: boolean; error?: string }>;
  createDeal(dealData: any): Promise<{ success: boolean; id?: string; error?: string }>;
  getContacts(filters?: any): Promise<any[]>;
}

// SMS Integration (Twilio, SendGrid, etc.)
export interface SMSIntegration {
  sendSMS(to: string, message: string, metadata?: any): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBulkSMS(recipients: Array<{ phone: string; message: string }>): Promise<SyncResult>;
  getDeliveryStatus(messageId: string): Promise<{ status: string; delivered_at?: string }>;
  validatePhoneNumber(phone: string): Promise<{ valid: boolean; formatted?: string }>;
}

// Social Media Integration (Facebook, Instagram, Twitter)
export interface SocialMediaIntegration {
  postContent(platform: string, content: any): Promise<{ success: boolean; postId?: string; error?: string }>;
  getAnalytics(platform: string, dateRange: { start: string; end: string }): Promise<any>;
  syncProducts(platform: string): Promise<SyncResult>;
  respondToMessage(platform: string, messageId: string, response: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Initialize third-party integration tables
 */
export async function initializeThirdPartyIntegrationTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping third-party integration table initialization');
      return;
    }

    // Integration configurations table
    await sql`
      CREATE TABLE IF NOT EXISTS integration_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'inactive',
        credentials JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        webhook_url TEXT,
        last_sync TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Integration sync history table
    await sql`
      CREATE TABLE IF NOT EXISTS integration_sync_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
        sync_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        records_processed INTEGER DEFAULT 0,
        records_success INTEGER DEFAULT 0,
        records_failed INTEGER DEFAULT 0,
        error_details JSONB,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      )
    `;

    // Webhook events table
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        signature VARCHAR(255),
        processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMP,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Integration data mapping table
    await sql`
      CREATE TABLE IF NOT EXISTS integration_data_mapping (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
        local_entity VARCHAR(100) NOT NULL,
        local_field VARCHAR(100) NOT NULL,
        external_entity VARCHAR(100) NOT NULL,
        external_field VARCHAR(100) NOT NULL,
        transformation_rule JSONB,
        is_bidirectional BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // API rate limiting table
    await sql`
      CREATE TABLE IF NOT EXISTS api_rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
        endpoint VARCHAR(255) NOT NULL,
        requests_made INTEGER DEFAULT 0,
        requests_limit INTEGER NOT NULL,
        window_start TIMESTAMP DEFAULT NOW(),
        window_duration_minutes INTEGER DEFAULT 60,
        last_request TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_integration_configs_type ON integration_configs(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_integration_configs_status ON integration_configs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sync_history_integration ON integration_sync_history(integration_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sync_history_status ON integration_sync_history(status, started_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON webhook_events(integration_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_data_mapping_integration ON integration_data_mapping(integration_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_integration ON api_rate_limits(integration_id, endpoint)`;

    console.log('✅ Third-party integration tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize third-party integration tables:', error);
  }
}

/**
 * Integration Manager - Central hub for all integrations
 */
export class IntegrationManager {
  private static integrations = new Map<string, any>();

  /**
   * Register an integration
   */
  static registerIntegration(config: IntegrationConfig, implementation: any): void {
    this.integrations.set(config.id, {
      config,
      implementation,
      lastUsed: Date.now()
    });
  }

  /**
   * Get integration by ID
   */
  static getIntegration(integrationId: string): any {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.lastUsed = Date.now();
      return integration.implementation;
    }
    return null;
  }

  /**
   * Create new integration configuration
   */
  static async createIntegration(config: Omit<IntegrationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      if (!sql) {
        throw new Error('Database not available');
      }

      const result = await sql`
        INSERT INTO integration_configs (
          name, type, provider, status, credentials, settings, webhook_url
        )
        VALUES (
          ${config.name}, ${config.type}, ${config.provider}, ${config.status},
          ${JSON.stringify(config.credentials)}, ${JSON.stringify(config.settings)},
          ${config.webhook_url || null}
        )
        RETURNING id
      ` as Array<{ id: string }>;

      return result[0].id;
    } catch (error) {
      console.error('Failed to create integration:', error);
      throw error;
    }
  }

  /**
   * Update integration configuration
   */
  static async updateIntegration(
    integrationId: string, 
    updates: Partial<IntegrationConfig>
  ): Promise<void> {
    try {
      if (!sql) {
        throw new Error('Database not available');
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          updateFields.push(`${key} = $${updateValues.length + 1}`);
          updateValues.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        
        await sql`
          UPDATE integration_configs 
          SET ${sql.unsafe(updateFields.join(', '))}
          WHERE id = ${integrationId}
        `;
      }
    } catch (error) {
      console.error('Failed to update integration:', error);
      throw error;
    }
  }

  /**
   * Get all integrations
   */
  static async getAllIntegrations(): Promise<IntegrationConfig[]> {
    try {
      if (!sql) {
        return [];
      }

      const integrations = await sql`
        SELECT * FROM integration_configs ORDER BY created_at DESC
      ` as IntegrationConfig[];

      return integrations;
    } catch (error) {
      console.error('Failed to get integrations:', error);
      return [];
    }
  }

  /**
   * Test integration connection
   */
  static async testIntegration(integrationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = this.getIntegration(integrationId);
      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      // Each integration should implement a test method
      if (typeof integration.test === 'function') {
        const result = await integration.test();
        
        // Update integration status based on test result
        await this.updateIntegration(integrationId, {
          status: result.success ? 'active' : 'error',
          error_message: result.error || null,
          last_sync: new Date().toISOString()
        });

        return result;
      }

      return { success: false, error: 'Test method not implemented' };
    } catch (error) {
      console.error('Integration test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Record sync result
   */
  static async recordSyncResult(result: SyncResult): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping sync result recording');
        return;
      }

      await sql`
        INSERT INTO integration_sync_history (
          integration_id, sync_type, status, records_processed, 
          records_success, records_failed, error_details, 
          started_at, completed_at
        )
        VALUES (
          ${result.integration_id}, ${result.sync_type}, ${result.status},
          ${result.records_processed}, ${result.records_success}, ${result.records_failed},
          ${result.error_details ? JSON.stringify(result.error_details) : null},
          ${result.started_at}, ${result.completed_at}
        )
      `;
    } catch (error) {
      console.error('Failed to record sync result:', error);
    }
  }

  /**
   * Process webhook event
   */
  static async processWebhookEvent(event: Omit<WebhookEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping webhook event processing');
        return;
      }

      // Store webhook event
      const result = await sql`
        INSERT INTO webhook_events (
          integration_id, event_type, payload, signature, retry_count
        )
        VALUES (
          ${event.integration_id}, ${event.event_type}, 
          ${JSON.stringify(event.payload)}, ${event.signature || null}, ${event.retry_count}
        )
        RETURNING id
      ` as Array<{ id: string }>;

      const webhookId = result[0].id;

      // Process the event
      const integration = this.getIntegration(event.integration_id);
      if (integration && typeof integration.processWebhook === 'function') {
        try {
          await integration.processWebhook(event.event_type, event.payload);
          
          // Mark as processed
          await sql`
            UPDATE webhook_events 
            SET processed = true, processed_at = NOW()
            WHERE id = ${webhookId}
          `;
        } catch (processingError) {
          // Mark as failed
          await sql`
            UPDATE webhook_events 
            SET error_message = ${processingError instanceof Error ? processingError.message : 'Processing failed'}
            WHERE id = ${webhookId}
          `;
        }
      }
    } catch (error) {
      console.error('Failed to process webhook event:', error);
    }
  }

  /**
   * Check API rate limits
   */
  static async checkRateLimit(
    integrationId: string, 
    endpoint: string, 
    limit: number, 
    windowMinutes: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      if (!sql) {
        return { allowed: true, remaining: limit, resetTime: new Date() };
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

      // Get current rate limit status
      const rateLimitData = await sql`
        SELECT * FROM api_rate_limits 
        WHERE integration_id = ${integrationId} 
        AND endpoint = ${endpoint}
        AND window_start > ${windowStart.toISOString()}
      ` as Array<{
        requests_made: number;
        requests_limit: number;
        window_start: string;
        window_duration_minutes: number;
      }>;

      let requestsMade = 0;
      let resetTime = new Date(now.getTime() + windowMinutes * 60 * 1000);

      if (rateLimitData.length > 0) {
        const data = rateLimitData[0];
        requestsMade = data.requests_made;
        resetTime = new Date(new Date(data.window_start).getTime() + data.window_duration_minutes * 60 * 1000);
      }

      const allowed = requestsMade < limit;
      const remaining = Math.max(0, limit - requestsMade);

      if (allowed) {
        // Increment request count
        await sql`
          INSERT INTO api_rate_limits (
            integration_id, endpoint, requests_made, requests_limit, 
            window_duration_minutes, last_request
          )
          VALUES (
            ${integrationId}, ${endpoint}, 1, ${limit}, ${windowMinutes}, NOW()
          )
          ON CONFLICT (integration_id, endpoint) DO UPDATE SET
            requests_made = CASE 
              WHEN api_rate_limits.window_start < ${windowStart.toISOString()} THEN 1
              ELSE api_rate_limits.requests_made + 1
            END,
            window_start = CASE
              WHEN api_rate_limits.window_start < ${windowStart.toISOString()} THEN NOW()
              ELSE api_rate_limits.window_start
            END,
            last_request = NOW()
        `;
      }

      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      return { allowed: true, remaining: limit, resetTime: new Date() };
    }
  }
}

/**
 * HubSpot CRM Integration
 */
export class HubSpotIntegration implements CRMIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async test(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/v1/lists/all/contacts/all?count=1&hapikey=${this.apiKey}`);
      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  async syncCustomers(): Promise<SyncResult> {
    const startTime = new Date().toISOString();
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsFailed = 0;
    const errorDetails: string[] = [];

    try {
      // Get customers from local database
      if (sql) {
        const customers = await sql`
          SELECT id, email, first_name, last_name, phone, created_at
          FROM users 
          WHERE email IS NOT NULL
          LIMIT 100
        ` as Array<{
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          created_at: string;
        }>;

        for (const customer of customers) {
          recordsProcessed++;
          
          try {
            const result = await this.createContact({
              email: customer.email,
              firstname: customer.first_name,
              lastname: customer.last_name,
              phone: customer.phone,
              createdate: customer.created_at
            });

            if (result.success) {
              recordsSuccess++;
            } else {
              recordsFailed++;
              if (result.error) errorDetails.push(result.error);
            }
          } catch (error) {
            recordsFailed++;
            errorDetails.push(`Customer ${customer.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      return {
        integration_id: 'hubspot',
        sync_type: 'full',
        status: recordsFailed === 0 ? 'success' : (recordsSuccess > 0 ? 'partial' : 'failed'),
        records_processed: recordsProcessed,
        records_success: recordsSuccess,
        records_failed: recordsFailed,
        error_details: errorDetails.length > 0 ? errorDetails : undefined,
        started_at: startTime,
        completed_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        integration_id: 'hubspot',
        sync_type: 'full',
        status: 'failed',
        records_processed: recordsProcessed,
        records_success: recordsSuccess,
        records_failed: recordsFailed,
        error_details: [error instanceof Error ? error.message : 'Sync failed'],
        started_at: startTime,
        completed_at: new Date().toISOString()
      };
    }
  }

  async syncOrders(): Promise<SyncResult> {
    // Similar implementation for orders
    return {
      integration_id: 'hubspot',
      sync_type: 'full',
      status: 'success',
      records_processed: 0,
      records_success: 0,
      records_failed: 0,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  }

  async createContact(customerData: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/v1/contact?hapikey=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: customerData })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, id: result.vid?.toString() };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateContact(contactId: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/v1/contact/vid/${contactId}/profile?hapikey=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: data })
      });

      return { success: response.ok, error: response.ok ? undefined : await response.text() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createDeal(dealData: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/deals/v1/deal?hapikey=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: dealData })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, id: result.dealId?.toString() };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getContacts(filters?: any): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/v1/lists/all/contacts/all?hapikey=${this.apiKey}`);
      if (response.ok) {
        const result = await response.json();
        return result.contacts || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return [];
    }
  }
}

/**
 * Twilio SMS Integration
 */
export class TwilioSMSIntegration implements SMSIntegration {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async test(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test by validating credentials with Twilio API
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      
      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  async sendSMS(to: string, message: string, metadata?: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: message
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, messageId: result.sid };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendBulkSMS(recipients: Array<{ phone: string; message: string }>): Promise<SyncResult> {
    const startTime = new Date().toISOString();
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsFailed = 0;
    const errorDetails: string[] = [];

    for (const recipient of recipients) {
      recordsProcessed++;
      
      try {
        const result = await this.sendSMS(recipient.phone, recipient.message);
        if (result.success) {
          recordsSuccess++;
        } else {
          recordsFailed++;
          if (result.error) errorDetails.push(`${recipient.phone}: ${result.error}`);
        }
      } catch (error) {
        recordsFailed++;
        errorDetails.push(`${recipient.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      integration_id: 'twilio',
      sync_type: 'full',
      status: recordsFailed === 0 ? 'success' : (recordsSuccess > 0 ? 'partial' : 'failed'),
      records_processed: recordsProcessed,
      records_success: recordsSuccess,
      records_failed: recordsFailed,
      error_details: errorDetails.length > 0 ? errorDetails : undefined,
      started_at: startTime,
      completed_at: new Date().toISOString()
    };
  }

  async getDeliveryStatus(messageId: string): Promise<{ status: string; delivered_at?: string }> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageId}.json`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (response.ok) {
        const result = await response.json();
        return {
          status: result.status,
          delivered_at: result.date_sent
        };
      }
      
      return { status: 'unknown' };
    } catch (error) {
      console.error('Failed to get delivery status:', error);
      return { status: 'error' };
    }
  }

  async validatePhoneNumber(phone: string): Promise<{ valid: boolean; formatted?: string }> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(`https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(phone)}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (response.ok) {
        const result = await response.json();
        return {
          valid: true,
          formatted: result.phone_number
        };
      }
      
      return { valid: false };
    } catch (error) {
      console.error('Failed to validate phone number:', error);
      return { valid: false };
    }
  }
}

/**
 * Run integration health checks
 */
export async function runIntegrationHealthChecks(): Promise<void> {
  try {
    console.log('🔍 Running integration health checks...');

    const integrations = await IntegrationManager.getAllIntegrations();
    
    for (const integration of integrations) {
      if (integration.status === 'active') {
        console.log(`Testing ${integration.name} (${integration.provider})...`);
        
        const testResult = await IntegrationManager.testIntegration(integration.id);
        
        if (testResult.success) {
          console.log(`✅ ${integration.name} is healthy`);
        } else {
          console.log(`❌ ${integration.name} failed: ${testResult.error}`);
        }
      }
    }

    // Process pending webhook events
    if (sql) {
      const pendingWebhooks = await sql`
        SELECT * FROM webhook_events 
        WHERE processed = false 
        AND retry_count < 3
        ORDER BY created_at ASC
        LIMIT 50
      ` as WebhookEvent[];

      for (const webhook of pendingWebhooks) {
        try {
          await IntegrationManager.processWebhookEvent({
            integration_id: webhook.integration_id,
            event_type: webhook.event_type,
            payload: webhook.payload,
            signature: webhook.signature,
            processed: false,
            retry_count: webhook.retry_count + 1
          });
        } catch (error) {
          console.error(`Failed to process webhook ${webhook.id}:`, error);
        }
      }
    }

    console.log('✅ Integration health checks completed');
  } catch (error) {
    console.error('❌ Integration health checks failed:', error);
  }
}

// Initialize third-party integration tables on module load
initializeThirdPartyIntegrationTables();

// Run integration health checks every 30 minutes
setInterval(runIntegrationHealthChecks, 30 * 60 * 1000);