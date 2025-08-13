import { sql } from '../lib/neon';

interface FlourishConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  storeId: string;
}

interface FlourishProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  strain_type?: string;
  thc_content?: number;
  cbd_content?: number;
  quantity_available: number;
  unit_price: number;
  compliance_status: string;
  batch_number?: string;
  test_results?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface FlourishInventoryItem {
  product_id: string;
  quantity: number;
  unit_of_measure: string;
  location: string;
  batch_id: string;
  expiration_date?: string;
  received_date: string;
}

interface ComplianceReport {
  report_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  data: Record<string, unknown>;
  created_at: string;
  submitted_at?: string;
}

interface FlourishResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class FlourishService {
  private config: FlourishConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_FLOURISH_API_KEY || '',
      environment: (import.meta.env.VITE_FLOURISH_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
      storeId: import.meta.env.VITE_FLOURISH_STORE_ID || ''
    };

    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.flourishsoftware.com/v1'
      : 'https://sandbox-api.flourishsoftware.com/v1';
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<FlourishResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Store-ID': this.config.storeId
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Flourish API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test the API connection to Flourish
   */
  async testConnection(): Promise<FlourishResponse<{ connected: boolean; store_name?: string }>> {
    try {
      const response = await this.makeRequest<{ store: { id: string; name: string } }>('/stores/current');
      
      if (response.success && response.data) {
        // Save successful connection timestamp
        await sql`
          INSERT INTO system_settings (key, value, category, updated_at)
          VALUES ('flourish_last_connection', ${JSON.stringify(new Date().toISOString())}, 'flourish', NOW())
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = EXCLUDED.updated_at
        `;

        return {
          success: true,
          data: {
            connected: true,
            store_name: response.data.store.name
          }
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to connect to Flourish'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get current inventory from Flourish
   */
  async getInventory(): Promise<FlourishResponse<FlourishInventoryItem[]>> {
    try {
      const response = await this.makeRequest<{ inventory: FlourishInventoryItem[] }>('/inventory');
      
      if (response.success && response.data) {
        // Update last sync timestamp
        await this.updateLastSyncTime('inventory');
        
        return {
          success: true,
          data: response.data.inventory
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch inventory'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory'
      };
    }
  }

  /**
   * Update inventory in Flourish
   */
  async updateInventory(updates: Partial<FlourishInventoryItem>[]): Promise<FlourishResponse<{ updated: number }>> {
    try {
      const response = await this.makeRequest<{ updated: number }>(
        '/inventory/batch-update',
        'POST',
        { updates }
      );

      if (response.success) {
        await this.updateLastSyncTime('inventory_update');
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update inventory'
      };
    }
  }

  /**
   * Get compliance reports from Flourish
   */
  async getComplianceReports(
    startDate?: string,
    endDate?: string,
    reportType?: string
  ): Promise<FlourishResponse<ComplianceReport[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (reportType) params.append('report_type', reportType);

      const endpoint = `/compliance/reports${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.makeRequest<{ reports: ComplianceReport[] }>(endpoint);

      if (response.success && response.data) {
        await this.updateLastSyncTime('compliance_reports');
        
        return {
          success: true,
          data: response.data.reports
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch compliance reports'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch compliance reports'
      };
    }
  }

  /**
   * Sync product catalog with Flourish
   */
  async syncProducts(): Promise<FlourishResponse<{ synced: number; failed: number }>> {
    try {
      // Get products from Flourish
      const response = await this.makeRequest<{ products: FlourishProduct[] }>('/products');
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Failed to fetch products from Flourish'
        };
      }

      const flourishProducts = response.data.products;
      let synced = 0;
      let failed = 0;

      // Sync each product to local database
      for (const product of flourishProducts) {
        try {
          await sql`
            INSERT INTO products (
              external_id,
              name,
              sku,
              category,
              strain_type,
              thc_content,
              cbd_content,
              stock_quantity,
              price,
              compliance_status,
              batch_number,
              test_results,
              updated_at
            ) VALUES (
              ${product.id},
              ${product.name},
              ${product.sku},
              ${product.category},
              ${product.strain_type || null},
              ${product.thc_content || 0},
              ${product.cbd_content || 0},
              ${product.quantity_available},
              ${product.unit_price},
              ${product.compliance_status},
              ${product.batch_number || null},
              ${JSON.stringify(product.test_results || {})},
              NOW()
            )
            ON CONFLICT (external_id) DO UPDATE SET
              name = EXCLUDED.name,
              sku = EXCLUDED.sku,
              category = EXCLUDED.category,
              strain_type = EXCLUDED.strain_type,
              thc_content = EXCLUDED.thc_content,
              cbd_content = EXCLUDED.cbd_content,
              stock_quantity = EXCLUDED.stock_quantity,
              price = EXCLUDED.price,
              compliance_status = EXCLUDED.compliance_status,
              batch_number = EXCLUDED.batch_number,
              test_results = EXCLUDED.test_results,
              updated_at = EXCLUDED.updated_at
          `;
          synced++;
        } catch (error) {
          console.error(`Failed to sync product ${product.id}:`, error);
          failed++;
        }
      }

      await this.updateLastSyncTime('products');

      return {
        success: true,
        data: { synced, failed }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product sync failed'
      };
    }
  }

  /**
   * Submit a compliance report to Flourish
   */
  async submitComplianceReport(
    reportType: string,
    data: Record<string, unknown>
  ): Promise<FlourishResponse<{ report_id: string; status: string }>> {
    try {
      const response = await this.makeRequest<{ report_id: string; status: string }>(
        '/compliance/reports',
        'POST',
        {
          report_type: reportType,
          data,
          store_id: this.config.storeId
        }
      );

      if (response.success) {
        await this.updateLastSyncTime('compliance_submission');
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit compliance report'
      };
    }
  }

  /**
   * Get batch information for seed-to-sale tracking
   */
  async getBatchInfo(batchId: string): Promise<FlourishResponse<unknown>> {
    try {
      const response = await this.makeRequest(`/batches/${batchId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch batch information'
      };
    }
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(config: Partial<FlourishConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update base URL if environment changed
    if (config.environment) {
      this.baseUrl = config.environment === 'production'
        ? 'https://api.flourishsoftware.com/v1'
        : 'https://sandbox-api.flourishsoftware.com/v1';
    }
  }

  /**
   * Get current configuration (without exposing API key)
   */
  getConfig(): Omit<FlourishConfig, 'apiKey'> & { apiKey: string } {
    return {
      ...this.config,
      apiKey: this.config.apiKey ? '***' + this.config.apiKey.slice(-4) : ''
    };
  }

  /**
   * Helper method to update last sync timestamp
   */
  private async updateLastSyncTime(syncType: string): Promise<void> {
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${`flourish_last_sync_${syncType}`}, ${JSON.stringify(new Date().toISOString())}, 'flourish', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
    } catch (error) {
      console.error(`Failed to update sync timestamp for ${syncType}:`, error);
    }
  }
}

// Export singleton instance
export const flourishService = new FlourishService();

// Export types
export type {
  FlourishConfig,
  FlourishProduct,
  FlourishInventoryItem,
  ComplianceReport,
  FlourishResponse
};
