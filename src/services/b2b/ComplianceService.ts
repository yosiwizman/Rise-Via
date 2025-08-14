import { sql } from '../../lib/neon';

export interface LicenseInfo {
  id: string;
  business_account_id: string;
  license_number: string;
  license_type: string;
  license_state: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  verified: boolean;
  verified_at?: string;
  verification_method?: string;
  documents?: string[];
}

export interface ComplianceCheck {
  id: string;
  business_account_id: string;
  check_type: 'license' | 'age' | 'location' | 'product' | 'quantity';
  status: 'passed' | 'failed' | 'pending';
  details: any;
  performed_at: string;
  performed_by?: string;
}

export interface StateCompliance {
  state_code: string;
  state_name: string;
  thca_legal: boolean;
  delta8_legal: boolean;
  delta9_limit: number;
  requires_license: boolean;
  license_types: string[];
  age_requirement: number;
  purchase_limits?: any;
  restricted_products?: string[];
  notes?: string;
}

export interface ComplianceReport {
  business_account_id: string;
  report_date: string;
  compliance_score: number;
  checks_passed: number;
  checks_failed: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    resolution?: string;
  }>;
  recommendations: string[];
}

class ComplianceService {
  private static instance: ComplianceService;
  private stateComplianceCache: Map<string, StateCompliance> = new Map();
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Verify business license
   */
  async verifyLicense(
    licenseNumber: string,
    licenseState: string,
    licenseType: string
  ): Promise<{ valid: boolean; details?: any; error?: string }> {
    try {
      // In production, this would call state-specific APIs
      // For now,  simulate verification
      
      // Check format based on state
      const isValidFormat = this.validateLicenseFormat(licenseNumber, licenseState);
      
      if (!isValidFormat) {
        return { 
          valid: false, 
          error: 'Invalid license format for state' 
        };
      }

      // Simulate API call to state database
      const mockVerification = {
        valid: true,
        business_name: 'Mock Business',
        issue_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };

      // Record verification
      await sql`
        INSERT INTO license_verifications (
          license_number, license_state, license_type,
          verification_result, verified_at
        ) VALUES (
          ${licenseNumber}, ${licenseState}, ${licenseType},
          ${JSON.stringify(mockVerification)}, NOW()
        )
      `;

      return { 
        valid: mockVerification.valid, 
        details: mockVerification 
      };
    } catch (error) {
      console.error('Error verifying license:', error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'License verification failed' 
      };
    }
  }

  /**
   * Validate license format based on state
   */
  private validateLicenseFormat(licenseNumber: string, state: string): boolean {
    // State-specific license format validation
    const formats: Record<string, RegExp> = {
      'CA': /^[A-Z]\d{2}-\d{7}$/,
      'CO': /^[A-Z]{3}\d{5}$/,
      'WA': /^\d{6}$/,
      'OR': /^[A-Z]{2}\d{6}$/,
      'NV': /^[A-Z]\d{8}$/,
      // Add more states as needed
    };

    const format = formats[state];
    if (!format) {
      // If no specific format, just check it's not empty
      return licenseNumber.length > 0;
    }

    return format.test(licenseNumber);
  }

  /**
   * Check state compliance for products
   */
  async checkStateCompliance(
    state: string,
    products: Array<{ id: string; type: string; thc_content: number }>
  ): Promise<{ compliant: boolean; issues: string[] }> {
    try {
      const stateRules = await this.getStateCompliance(state);
      
      if (!stateRules) {
        return { 
          compliant: false, 
          issues: ['State compliance rules not found'] 
        };
      }

      const issues: string[] = [];

      for (const product of products) {
        // Check THCA legality
        if (product.type === 'thca' && !stateRules.thca_legal) {
          issues.push(`THCA products are not legal in ${state}`);
        }

        // Check Delta-8 legality
        if (product.type === 'delta8' && !stateRules.delta8_legal) {
          issues.push(`Delta-8 products are not legal in ${state}`);
        }

        // Check Delta-9 THC limits
        if (product.thc_content > stateRules.delta9_limit) {
          issues.push(`Product exceeds Delta-9 THC limit of ${stateRules.delta9_limit}% in ${state}`);
        }

        // Check restricted products
        if (stateRules.restricted_products?.includes(product.type)) {
          issues.push(`${product.type} products are restricted in ${state}`);
        }
      }

      return {
        compliant: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error checking state compliance:', error);
      return { 
        compliant: false, 
        issues: ['Failed to check state compliance'] 
      };
    }
  }

  /**
   * Get state compliance rules
   */
  async getStateCompliance(state: string): Promise<StateCompliance | null> {
    try {
      // Check cache first
      if (this.stateComplianceCache.has(state) && this.isCacheValid()) {
        return this.stateComplianceCache.get(state)!;
      }

      const result = await sql`
        SELECT * FROM state_compliance WHERE state_code = ${state}
      `;

      if (result && result.length > 0) {
        const compliance = result[0] as StateCompliance;
        this.stateComplianceCache.set(state, compliance);
        this.lastCacheUpdate = new Date();
        return compliance;
      }

      // Return default rules if not found
      return this.getDefaultStateCompliance(state);
    } catch (error) {
      console.error('Error fetching state compliance:', error);
      return null;
    }
  }

  /**
   * Get default state compliance rules
   */
  private getDefaultStateCompliance(state: string): StateCompliance {
    return {
      state_code: state,
      state_name: state,
      thca_legal: true, // Federal compliance
      delta8_legal: true,
      delta9_limit: 0.3, // Federal limit
      requires_license: true,
      license_types: ['Retail', 'Wholesale'],
      age_requirement: 21,
      purchase_limits: {
        daily: 1000, // grams
        monthly: 5000
      }
    };
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) return false;
    
    const now = new Date();
    const timeSinceUpdate = now.getTime() - this.lastCacheUpdate.getTime();
    return timeSinceUpdate < this.CACHE_DURATION;
  }

  /**
   * Perform age verification
   */
  async verifyAge(
    dateOfBirth: string,
    state: string
  ): Promise<{ verified: boolean; error?: string }> {
    try {
      const stateRules = await this.getStateCompliance(state);
      const ageRequirement = stateRules?.age_requirement || 21;

      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      if (age < ageRequirement) {
        return { 
          verified: false, 
          error: `Must be ${ageRequirement} or older to purchase in ${state}` 
        };
      }

      return { verified: true };
    } catch (error) {
      console.error('Error verifying age:', error);
      return { 
        verified: false, 
        error: 'Age verification failed' 
      };
    }
  }

  /**
   * Check purchase limits
   */
  async checkPurchaseLimits(
    businessAccountId: string,
    state: string,
    orderAmount: number,
    period: 'daily' | 'monthly' = 'daily'
  ): Promise<{ allowed: boolean; limit?: number; current?: number }> {
    try {
      const stateRules = await this.getStateCompliance(state);
      
      if (!stateRules?.purchase_limits) {
        return { allowed: true };
      }

      const limit = stateRules.purchase_limits[period];
      if (!limit) {
        return { allowed: true };
      }

      // Get current period purchases
      const startDate = period === 'daily' 
        ? new Date(new Date().setHours(0, 0, 0, 0))
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const result = await sql`
        SELECT SUM(quantity) as total
        FROM orders
        WHERE business_account_id = ${businessAccountId}
        AND created_at >= ${startDate}
        AND status NOT IN ('cancelled', 'refunded')
      `;

      const currentTotal = result[0]?.total || 0;
      const newTotal = currentTotal + orderAmount;

      return {
        allowed: newTotal <= limit,
        limit,
        current: currentTotal
      };
    } catch (error) {
      console.error('Error checking purchase limits:', error);
      return { allowed: true }; // Allow by default if check fails
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    businessAccountId: string
  ): Promise<ComplianceReport> {
    try {
      // Get business account details
      const accountResult = await sql`
        SELECT * FROM business_accounts WHERE id = ${businessAccountId}
      `;

      if (!accountResult || accountResult.length === 0) {
        throw new Error('Business account not found');
      }

      const account = accountResult[0];
      const issues: ComplianceReport['issues'] = [];
      const recommendations: string[] = [];
      let checksPassed = 0;
      let checksFailed = 0;

      // Check license status
      if (account.license_verified) {
        checksPassed++;
      } else {
        checksFailed++;
        issues.push({
          type: 'license',
          severity: 'high',
          description: 'Business license not verified',
          resolution: 'Submit license for verification'
        });
      }

      // Check license expiry
      if (account.license_expiry) {
        const expiryDate = new Date(account.license_expiry);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          checksFailed++;
          issues.push({
            type: 'license',
            severity: 'critical',
            description: 'Business license has expired',
            resolution: 'Renew business license immediately'
          });
        } else if (daysUntilExpiry < 30) {
          checksFailed++;
          issues.push({
            type: 'license',
            severity: 'medium',
            description: `Business license expires in ${daysUntilExpiry} days`,
            resolution: 'Renew business license soon'
          });
        } else {
          checksPassed++;
        }
      }

      // Check recent compliance violations
      const violationsResult = await sql`
        SELECT COUNT(*) as count FROM compliance_violations
        WHERE business_account_id = ${businessAccountId}
        AND created_at > NOW() - INTERVAL '90 days'
      `;

      if (violationsResult[0]?.count > 0) {
        checksFailed++;
        issues.push({
          type: 'violations',
          severity: 'medium',
          description: `${violationsResult[0].count} compliance violations in the last 90 days`,
          resolution: 'Review and address compliance violations'
        });
      } else {
        checksPassed++;
      }

      // Calculate compliance score
      const totalChecks = checksPassed + checksFailed;
      const complianceScore = totalChecks > 0 
        ? Math.round((checksPassed / totalChecks) * 100) 
        : 0;

      // Add recommendations based on score
      if (complianceScore < 50) {
        recommendations.push('Immediate action required to address compliance issues');
        recommendations.push('Consider scheduling a compliance review meeting');
      } else if (complianceScore < 80) {
        recommendations.push('Address outstanding compliance issues to improve score');
        recommendations.push('Review compliance documentation for completeness');
      } else {
        recommendations.push('Maintain current compliance practices');
        recommendations.push('Schedule regular compliance audits');
      }

      return {
        business_account_id: businessAccountId,
        report_date: new Date().toISOString(),
        compliance_score: complianceScore,
        checks_passed: checksPassed,
        checks_failed: checksFailed,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return {
        business_account_id: businessAccountId,
        report_date: new Date().toISOString(),
        compliance_score: 0,
        checks_passed: 0,
        checks_failed: 0,
        issues: [{
          type: 'error',
          severity: 'high',
          description: 'Failed to generate compliance report'
        }],
        recommendations: ['Contact support for assistance']
      };
    }
  }

  /**
   * Record compliance check
   */
  async recordComplianceCheck(
    businessAccountId: string,
    checkType: ComplianceCheck['check_type'],
    status: ComplianceCheck['status'],
    details: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sql`
        INSERT INTO compliance_checks (
          business_account_id, check_type, status, details, performed_at
        ) VALUES (
          ${businessAccountId}, ${checkType}, ${status}, 
          ${JSON.stringify(details)}, NOW()
        )
      `;

      return { success: true };
    } catch (error) {
      console.error('Error recording compliance check:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record compliance check' 
      };
    }
  }
}

export const complianceService = ComplianceService.getInstance();
