import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface StateCompliance {
  state: string;
  isLegal: boolean;
  ageRequirement: number;
  maxPossession: string;
  homeGrowAllowed: boolean;
  publicConsumption: boolean;
  drivingLimit: string;
  retailSalesAllowed: boolean;
  deliveryAllowed: boolean;
  onlineOrderingAllowed: boolean;
  taxRate: number;
  licenseRequired: boolean;
  lastUpdated: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'regulatory_change' | 'license_expiry' | 'tax_update' | 'shipping_restriction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  deadline?: string;
  affectedStates: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  complianceFlags: string[];
}

interface ComplianceEvent {
  id?: string;
  event_type: 'age_verification' | 'state_block' | 'purchase_limit' | 'id_verification' | 'metrc_sync';
  user_id?: string;
  session_id: string;
  data: Record<string, unknown>;
  risk_score: number;
  compliance_result: boolean;
  created_at?: string;
}



class ComplianceService {
  private static instance: ComplianceService;
  private complianceCache: Map<string, StateCompliance> = new Map();
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  async getStateCompliance(state: string): Promise<StateCompliance | null> {
    try {
      if (this.isCacheValid() && this.complianceCache.has(state)) {
        return this.complianceCache.get(state)!;
      }

      const result = await sql`
        SELECT * FROM state_compliance 
        WHERE state = ${state} 
        ORDER BY last_updated DESC 
        LIMIT 1
      `;

      if (result.length === 0) {
        return null;
      }

      const compliance: StateCompliance = {
        state: result[0].state,
        isLegal: result[0].is_legal,
        ageRequirement: result[0].age_requirement,
        maxPossession: result[0].max_possession,
        homeGrowAllowed: result[0].home_grow_allowed,
        publicConsumption: result[0].public_consumption,
        drivingLimit: result[0].driving_limit,
        retailSalesAllowed: result[0].retail_sales_allowed,
        deliveryAllowed: result[0].delivery_allowed,
        onlineOrderingAllowed: result[0].online_ordering_allowed,
        taxRate: parseFloat(result[0].tax_rate),
        licenseRequired: result[0].license_required,
        lastUpdated: result[0].last_updated
      };

      this.complianceCache.set(state, compliance);
      return compliance;
    } catch (error) {
      console.error('Error fetching state compliance:', error);
      throw new Error('Failed to fetch compliance data');
    }
  }

  async getAllStateCompliance(): Promise<StateCompliance[]> {
    try {
      if (this.isCacheValid() && this.complianceCache.size > 0) {
        return Array.from(this.complianceCache.values());
      }

      const result = await sql`
        SELECT DISTINCT ON (state) * FROM state_compliance 
        ORDER BY state, last_updated DESC
      `;

      const complianceData: StateCompliance[] = result.map(row => ({
        state: row.state,
        isLegal: row.is_legal,
        ageRequirement: row.age_requirement,
        maxPossession: row.max_possession,
        homeGrowAllowed: row.home_grow_allowed,
        publicConsumption: row.public_consumption,
        drivingLimit: row.driving_limit,
        retailSalesAllowed: row.retail_sales_allowed,
        deliveryAllowed: row.delivery_allowed,
        onlineOrderingAllowed: row.online_ordering_allowed,
        taxRate: parseFloat(row.tax_rate),
        licenseRequired: row.license_required,
        lastUpdated: row.last_updated
      }));

      this.complianceCache.clear();
      complianceData.forEach(compliance => {
        this.complianceCache.set(compliance.state, compliance);
      });
      this.lastCacheUpdate = new Date();

      return complianceData;
    } catch (error) {
      console.error('Error fetching all state compliance:', error);
      throw new Error('Failed to fetch compliance data');
    }
  }

  async validateOrder(orderData: {
    customerState: string;
    customerAge: number;
    items: Array<{ id: string; quantity: number; type: string }>;
    shippingAddress: {
      state: string;
      city: string;
      zipCode: string;
    };
  }): Promise<{
    isValid: boolean;
    violations: string[];
    warnings: string[];
    requiredActions: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];

    try {
      const compliance = await this.getStateCompliance(orderData.customerState);
      
      if (!compliance) {
        violations.push(`No compliance data available for ${orderData.customerState}`);
        return { isValid: false, violations, warnings, requiredActions };
      }

      if (!compliance.isLegal) {
        violations.push(`Cannabis is not legal in ${orderData.customerState}`);
      }

      if (orderData.customerAge < compliance.ageRequirement) {
        violations.push(`Customer must be at least ${compliance.ageRequirement} years old`);
      }

      if (!compliance.retailSalesAllowed) {
        violations.push(`Retail sales are not permitted in ${orderData.customerState}`);
      }

      if (!compliance.deliveryAllowed) {
        violations.push(`Delivery is not permitted in ${orderData.customerState}`);
      }

      if (!compliance.onlineOrderingAllowed) {
        violations.push(`Online ordering is not permitted in ${orderData.customerState}`);
      }

      if (orderData.shippingAddress.state !== orderData.customerState) {
        const shippingCompliance = await this.getStateCompliance(orderData.shippingAddress.state);
        if (!shippingCompliance?.deliveryAllowed) {
          violations.push(`Delivery not permitted to ${orderData.shippingAddress.state}`);
        }
      }

      if (compliance.licenseRequired) {
        requiredActions.push('Valid cannabis license verification required');
      }

      if (compliance.taxRate > 0) {
        requiredActions.push(`Apply ${(compliance.taxRate * 100).toFixed(2)}% state cannabis tax`);
      }

      if (compliance.maxPossession) {
        warnings.push(`State possession limit: ${compliance.maxPossession}`);
      }

      return {
        isValid: violations.length === 0,
        violations,
        warnings,
        requiredActions
      };
    } catch (error) {
      console.error('Error validating order:', error);
      violations.push('Unable to validate order compliance');
      return { isValid: false, violations, warnings, requiredActions };
    }
  }

  async logComplianceAction(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await sql`
        INSERT INTO compliance_audit_logs (
          user_id, action, resource, details, ip_address, user_agent, compliance_flags
        ) VALUES (
          ${auditLog.userId},
          ${auditLog.action},
          ${auditLog.resource},
          ${JSON.stringify(auditLog.details)},
          ${auditLog.ipAddress},
          ${auditLog.userAgent},
          ${JSON.stringify(auditLog.complianceFlags)}
        )
      `;
    } catch (error) {
      console.error('Error logging compliance action:', error);
      throw new Error('Failed to log compliance action');
    }
  }

  async getComplianceAlerts(severity?: ComplianceAlert['severity']): Promise<ComplianceAlert[]> {
    try {
      let query = sql`
        SELECT * FROM compliance_alerts 
        WHERE resolved_at IS NULL
      `;

      if (severity) {
        query = sql`
          SELECT * FROM compliance_alerts 
          WHERE resolved_at IS NULL AND severity = ${severity}
        `;
      }

      const result = await query;

      return result.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        title: row.title,
        description: row.description,
        actionRequired: row.action_required,
        deadline: row.deadline,
        affectedStates: JSON.parse(row.affected_states || '[]'),
        createdAt: row.created_at,
        resolvedAt: row.resolved_at
      }));
    } catch (error) {
      console.error('Error fetching compliance alerts:', error);
      throw new Error('Failed to fetch compliance alerts');
    }
  }

  async createComplianceAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const result = await sql`
        INSERT INTO compliance_alerts (
          type, severity, title, description, action_required, deadline, affected_states
        ) VALUES (
          ${alert.type},
          ${alert.severity},
          ${alert.title},
          ${alert.description},
          ${alert.actionRequired},
          ${alert.deadline || null},
          ${JSON.stringify(alert.affectedStates)}
        ) RETURNING id
      `;

      return result[0].id;
    } catch (error) {
      console.error('Error creating compliance alert:', error);
      throw new Error('Failed to create compliance alert');
    }
  }

  async resolveComplianceAlert(alertId: string): Promise<void> {
    try {
      await sql`
        UPDATE compliance_alerts 
        SET resolved_at = NOW() 
        WHERE id = ${alertId}
      `;
    } catch (error) {
      console.error('Error resolving compliance alert:', error);
      throw new Error('Failed to resolve compliance alert');
    }
  }

  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) return false;
    return Date.now() - this.lastCacheUpdate.getTime() < this.CACHE_DURATION;
  }

  async trackAgeVerification(sessionId: string, birthDate?: Date, userAgent?: string): Promise<void> {
    const isValid = birthDate ? (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000) >= 21 : false;
    const riskScore = isValid ? 0.1 : 0.9;

    await this.logComplianceEvent({
      event_type: 'age_verification',
      session_id: sessionId,
      data: { birthDate: birthDate?.toISOString(), userAgent },
      risk_score: riskScore,
      compliance_result: isValid
    });
  }

  async trackStateRestriction(sessionId: string, userState: string, ipAddress?: string): Promise<boolean> {
    const compliance = await this.getStateCompliance(userState);
    const isValid = compliance?.isLegal || false;
    const riskScore = isValid ? 0.1 : 0.9;

    await this.logComplianceEvent({
      event_type: 'state_block',
      session_id: sessionId,
      data: { userState, ipAddress, blocked: !isValid },
      risk_score: riskScore,
      compliance_result: isValid
    });

    return isValid;
  }

  async checkPurchaseLimit(sessionId: string, userId?: string, purchaseAmount: number = 0): Promise<boolean> {
    const existingLimitResult = await sql`
      SELECT * FROM purchase_limits 
      WHERE user_id = ${userId} OR session_id = ${sessionId}
      LIMIT 1
    `;
    const existingLimit = existingLimitResult[0];

    const today = new Date().toDateString();
    const dailyLimit = 1000;
    const monthlyLimit = 5000;

    let currentDaily = purchaseAmount;
    let currentMonthly = purchaseAmount;

    if (existingLimit[0]) {
      if (existingLimit[0].last_purchase_date === today) {
        currentDaily += existingLimit[0].daily_amount;
      }
      currentMonthly += existingLimit[0].monthly_amount;
    }

    const withinLimits = currentDaily <= dailyLimit && currentMonthly <= monthlyLimit;

    await this.logComplianceEvent({
      event_type: 'purchase_limit',
      session_id: sessionId,
      user_id: userId,
      data: { purchaseAmount, currentDaily, currentMonthly, dailyLimit, monthlyLimit },
      risk_score: withinLimits ? 0.1 : 0.9,
      compliance_result: withinLimits
    });

    return withinLimits;
  }

  async getComplianceReport(startDate: string, endDate: string): Promise<{
    totalEvents: number;
    ageVerifications: number;
    stateBlocks: number;
    purchaseLimitViolations: number;
    averageRiskScore: number;
    complianceRate: number;
  }> {
    const events = await sql`
      SELECT * FROM compliance_events 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      ORDER BY created_at DESC
    `;

    const typedEvents = (events as ComplianceEvent[]) || [];
    
    const report = {
      totalEvents: typedEvents.length,
      ageVerifications: typedEvents.filter((e) => e.event_type === 'age_verification').length,
      stateBlocks: typedEvents.filter((e) => e.event_type === 'state_block' && !e.compliance_result).length,
      purchaseLimitViolations: typedEvents.filter((e) => e.event_type === 'purchase_limit' && !e.compliance_result).length,
      averageRiskScore: typedEvents.length > 0 ? typedEvents.reduce((sum, e) => sum + (e.risk_score || 0), 0) / typedEvents.length : 0,
      complianceRate: typedEvents.length > 0 ? (typedEvents.filter((e) => e.compliance_result).length / typedEvents.length) * 100 : 0
    };

    return report;
  }

  private async logComplianceEvent(event: Omit<ComplianceEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      await sql`
        INSERT INTO compliance_events (event_type, user_id, session_id, data, risk_score, compliance_result)
        VALUES (${event.event_type}, ${event.user_id}, ${event.session_id}, ${JSON.stringify(event.data)}, ${event.risk_score}, ${event.compliance_result})
      `;
    } catch (error) {
      console.error('Failed to log compliance event:', error);
    }
  }
}

export const complianceService = ComplianceService.getInstance();
