import { sql } from '../lib/neon';
import { ComplianceManager } from '../utils/compliance';
import { cartAnalytics } from '../analytics/cartAnalytics';

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



export class ComplianceService {
  private static instance: ComplianceService;

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  async trackAgeVerification(sessionId: string, birthDate?: Date, userAgent?: string): Promise<void> {
    const complianceResult = ComplianceManager.verifyAge({
      birthDate,
      userAgent: userAgent || navigator.userAgent,
      timestamp: Date.now()
    });

    await this.logComplianceEvent({
      event_type: 'age_verification',
      session_id: sessionId,
      data: { birthDate: birthDate?.toISOString(), userAgent },
      risk_score: complianceResult.riskScore,
      compliance_result: complianceResult.isValid
    });

    if (complianceResult.isValid) {
      cartAnalytics.trackCartEvent('checkout_start', undefined, { compliance_verified: true });
    }
  }

  async trackStateRestriction(sessionId: string, userState: string, ipAddress?: string): Promise<boolean> {
    const complianceResult = ComplianceManager.checkStateCompliance(userState, ipAddress);

    await this.logComplianceEvent({
      event_type: 'state_block',
      session_id: sessionId,
      data: { userState, ipAddress, blocked: !complianceResult.isValid },
      risk_score: complianceResult.riskScore,
      compliance_result: complianceResult.isValid
    });

    return complianceResult.isValid;
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

    const report = {
      totalEvents: events?.length || 0,
      ageVerifications: events?.filter((e: any) => e.event_type === 'age_verification').length || 0,
      stateBlocks: events?.filter((e: any) => e.event_type === 'state_block' && !e.compliance_result).length || 0,
      purchaseLimitViolations: events?.filter((e: any) => e.event_type === 'purchase_limit' && !e.compliance_result).length || 0,
      averageRiskScore: events?.reduce((sum: number, e: any) => sum + (e.risk_score || 0), 0) / (events?.length || 1),
      complianceRate: (events?.filter((e: any) => e.compliance_result).length || 0) / (events?.length || 1) * 100
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
