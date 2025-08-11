import DOMPurify from 'dompurify';

export class SecurityUtils {
  private static rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  private static csrfTokens = new Set<string>();

  /**
   * Sanitizes HTML content to prevent XSS attacks
   */
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div'],
      ALLOWED_ATTR: ['class', 'style'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    });
  }

  /**
   * Sanitizes user input by removing potentially dangerous characters
   */
  static sanitizeInput(input: unknown): string {
    console.log('🔐 SecurityUtils.sanitizeInput called with:', { 
      inputType: typeof input,
      inputValue: input,
      inputLength: typeof input === 'string' ? input.length : 'N/A'
    });
    
    if (input === null || input === undefined) {
      console.log('🔐 Input is null/undefined, returning empty string');
      return '';
    }
    
    if (typeof input !== 'string') {
      console.log('🔐 Input is not a string, converting', { originalType: typeof input });
      try {
        input = String(input);
      } catch (error) {
        console.log('🔐 String conversion failed', error);
        return '';
      }
    }
    
    if (typeof input !== 'string') {
      console.log('🔐 Input still not a string after conversion');
      return '';
    }
    
    try {
      let result = input;
      
      if (typeof result.trim === 'function') {
        result = result.trim();
      }
      
      if (typeof result.replace === 'function') {
        result = result.replace(/[<>]/g, '');
        result = result.replace(/javascript:/gi, '');
        result = result.replace(/on\w+=/gi, '');
        result = result.replace(/data:/gi, '');
      }
      
      if (typeof result.substring === 'function') {
        result = result.substring(0, 1000);
      }
      
      console.log('🔐 sanitizeInput successful', { 
        originalLength: input.length,
        resultLength: result.length 
      });
      
      return result;
    } catch (error) {
      console.log('🔐 Error in sanitizeInput', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      return '';
    }
  }

  /**
   * Rate limiting check - prevents spam and abuse
   */
  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record) {
      this.rateLimitMap.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    if (now - record.lastReset > windowMs) {
      record.count = 1;
      record.lastReset = now;
      return true;
    }

    if (record.count < maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  /**
   * Generates a CSRF token for form protection
   */
  static generateCSRFToken(): string {
    const token = crypto.randomUUID();
    this.csrfTokens.add(token);
    
    if (this.csrfTokens.size > 100) {
      try {
        const tokensArray = Array.from(this.csrfTokens);
        if (!Array.isArray(tokensArray)) {
          console.warn('⚠️ SecurityUtils.generateCSRFToken: tokensArray is not an array:', typeof tokensArray, tokensArray);
          return token;
        }
        this.csrfTokens.clear();
        tokensArray.slice(-50).forEach(t => this.csrfTokens.add(t));
      } catch (error) {
        console.error('❌ Error in SecurityUtils.generateCSRFToken slice operation:', error);
      }
    }
    
    return token;
  }

  /**
   * Validates a CSRF token
   */
  static validateCSRFToken(token: string): boolean {
    const isValid = this.csrfTokens.has(token);
    if (isValid) {
      this.csrfTokens.delete(token); // One-time use
    }
    return isValid;
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validates phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validates password strength with complexity requirements
   */
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    return { isValid: true };
  }

  /**
   * Generates a secure verification token
   */
  static generateVerificationToken(): string {
    return this.generateCSRFToken();
  }

  /**
   * Sanitizes and validates review content
   */
  static sanitizeReviewContent(content: string): { sanitized: string; isValid: boolean } {
    const sanitized = this.sanitizeInput(content);
    const isValid = sanitized.length >= 10 && sanitized.length <= 500;
    
    return {
      sanitized: this.sanitizeHTML(sanitized),
      isValid
    };
  }
}
