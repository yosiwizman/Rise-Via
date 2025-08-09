import { complianceService } from '../services/ComplianceService';
import { wishlistAnalytics } from './wishlistAnalytics';
import { cartAnalytics } from './cartAnalytics';

export class ComplianceAnalyticsService {
  private static instance: ComplianceAnalyticsService;

  public static getInstance(): ComplianceAnalyticsService {
    if (!ComplianceAnalyticsService.instance) {
      ComplianceAnalyticsService.instance = new ComplianceAnalyticsService();
    }
    return ComplianceAnalyticsService.instance;
  }

  async trackComplianceWithAnalytics(eventType: string, sessionId: string, data: Record<string, unknown>): Promise<void> {
    await complianceService.trackAgeVerification(
      sessionId, 
      data.birthDate as Date | undefined, 
      data.userAgent as string | undefined
    );

    if (eventType === 'age_verification' && data.verified) {
      wishlistAnalytics.trackWishlistEvent('conversion', undefined, { 
        compliance_verified: true,
        age_verification: true 
      });
    }

    if (eventType === 'purchase_limit_check') {
      cartAnalytics.trackCartEvent('checkout_start', undefined, {
        purchase_amount: data.amount,
        within_limits: data.withinLimits
      });
    }
  }

  async generateComplianceInsights(): Promise<{
    compliance: {
      totalEvents: number;
      ageVerifications: number;
      stateBlocks: number;
      purchaseLimitViolations: number;
      averageRiskScore: number;
      complianceRate: number;
    };
    userEngagement: {
      wishlistConversions: number;
      cartAbandonment: number;
    };
    riskFactors: {
      highRiskSessions: boolean;
      stateBlockRate: number;
    };
  }> {
    const report = await complianceService.getComplianceReport(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    );

    const wishlistMetrics = wishlistAnalytics.getMetrics();
    const cartEvents: Array<{ action: string }> = [];

    return {
      compliance: report,
      userEngagement: {
        wishlistConversions: wishlistMetrics.conversionEvents,
        cartAbandonment: cartEvents.filter((e: { action: string }) => e.action === 'clear').length
      },
      riskFactors: {
        highRiskSessions: report.averageRiskScore > 0.7,
        stateBlockRate: (report.stateBlocks / report.totalEvents) * 100
      }
    };
  }
}

export const complianceAnalytics = ComplianceAnalyticsService.getInstance();
