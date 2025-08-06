export interface ComplianceResult {
  isValid: boolean;
  riskScore: number;
  reasons: string[];
}

export interface AgeVerificationData {
  birthDate?: Date;
  userAgent: string;
  ipAddress?: string;
  timestamp: number;
}

export class ComplianceManager {
  private static readonly RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8
  };

  /**
   * Enhanced age verification with risk scoring
   */
  static verifyAge(data: AgeVerificationData): ComplianceResult {
    const reasons: string[] = [];
    let riskScore = 0;

    if (data.birthDate) {
      const age = this.calculateAge(data.birthDate);
      if (age < 21) {
        return {
          isValid: false,
          riskScore: 1.0,
          reasons: ['User is under 21 years old']
        };
      }
      
      if (age < 25) {
        riskScore += 0.2;
        reasons.push('Young adult - increased verification scrutiny');
      }
    } else {
      riskScore += 0.4;
      reasons.push('No birth date provided');
    }

    const userAgentRisk = this.analyzeUserAgent(data.userAgent);
    riskScore += userAgentRisk.score;
    if (userAgentRisk.reasons.length > 0) {
      reasons.push(...userAgentRisk.reasons);
    }

    const timingRisk = this.analyzeTimingPatterns(data.timestamp);
    riskScore += timingRisk.score;
    if (timingRisk.reasons.length > 0) {
      reasons.push(...timingRisk.reasons);
    }

    if (riskScore > this.RISK_THRESHOLDS.HIGH) {
      this.logFraudAttempt(data, riskScore, reasons);
    }

    return {
      isValid: riskScore < this.RISK_THRESHOLDS.HIGH,
      riskScore: Math.min(riskScore, 1.0),
      reasons
    };
  }

  /**
   * Check state compliance with IP geolocation fallback
   */
  static checkStateCompliance(userState?: string, ipAddress?: string): ComplianceResult {
    const reasons: string[] = [];
    let riskScore = 0;

    const BLOCKED_STATES = [
      "ID", "SD", "MS", "OR", "AK", "AR", "CO", "DE", "HI", "IN", 
      "IA", "KS", "KY", "LA", "MD", "MT", "NH", "NY", "NC", "RI", 
      "UT", "VT", "VA"
    ];

    if (userState) {
      if (BLOCKED_STATES.includes(userState.toUpperCase())) {
        return {
          isValid: false,
          riskScore: 1.0,
          reasons: [`Shipping to ${userState} is not permitted`]
        };
      }
    } else {
      riskScore += 0.3;
      reasons.push('No state information provided');
      
      if (ipAddress) {
        const geoResult = this.performIPGeolocation(ipAddress);
        if (geoResult.state && BLOCKED_STATES.includes(geoResult.state)) {
          return {
            isValid: false,
            riskScore: 1.0,
            reasons: [`IP geolocation indicates blocked state: ${geoResult.state}`]
          };
        }
        riskScore += geoResult.uncertainty;
      }
    }

    return {
      isValid: true,
      riskScore: Math.min(riskScore, 1.0),
      reasons
    };
  }

  /**
   * Calculate age from birth date
   */
  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Analyze user agent for suspicious patterns
   */
  private static analyzeUserAgent(userAgent: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!userAgent || userAgent.length < 10) {
      score += 0.3;
      reasons.push('Suspicious or missing user agent');
    }

    const botPatterns = /bot|crawler|spider|scraper|automated/i;
    if (botPatterns.test(userAgent)) {
      score += 0.4;
      reasons.push('Automated browser detected');
    }

    if (userAgent.includes('MSIE') || userAgent.includes('Internet Explorer')) {
      score += 0.2;
      reasons.push('Outdated browser detected');
    }

    return { score: Math.min(score, 0.5), reasons };
  }

  /**
   * Analyze timing patterns for rapid submissions
   */
  private static analyzeTimingPatterns(timestamp: number): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const lastAttempt = localStorage.getItem('last_age_verification');
    if (lastAttempt) {
      const timeDiff = timestamp - parseInt(lastAttempt);
      if (timeDiff < 5000) { // Less than 5 seconds
        score += 0.3;
        reasons.push('Rapid successive verification attempts');
      }
    }

    localStorage.setItem('last_age_verification', timestamp.toString());
    return { score, reasons };
  }

  /**
   * Perform IP geolocation (mock implementation)
   */
  private static performIPGeolocation(_ipAddress: string): { state?: string; uncertainty: number } {
    return {
      state: undefined,
      uncertainty: 0.2
    };
  }

  /**
   * Log fraud attempts for monitoring
   */
  private static logFraudAttempt(data: AgeVerificationData, riskScore: number, reasons: string[]): void {
    const fraudLog = {
      timestamp: data.timestamp,
      userAgent: data.userAgent,
      riskScore,
      reasons,
      ipAddress: data.ipAddress || 'unknown'
    };

    console.warn('High-risk age verification attempt:', fraudLog);
    
    const existingLogs = JSON.parse(localStorage.getItem('fraud_logs') || '[]');
    existingLogs.push(fraudLog);
    
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('fraud_logs', JSON.stringify(existingLogs));
  }
}
