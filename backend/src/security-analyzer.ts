/**
 * Security Analyzer - Core security analysis and threat detection
 */

import crypto from 'crypto';

interface SecurityRequest {
  ip: string;
  userAgent?: string;
  path: string;
  method: string;
  headers: any;
}

interface SecurityMetrics {
  apiKey: string;
  timestamp: number;
  url: string;
  userAgent: string;
  requestCount: number;
  csrfToken: string;
}

interface SecurityEvent {
  apiKey: string;
  eventType: string;
  timestamp: number;
  url: string;
  data?: any;
}

interface ThreatAnalysis {
  isThreat: boolean;
  threatType?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
}

export class SecurityAnalyzer {
  private apiKeys: Map<string, { domain: string; createdAt: number }> = new Map();
  private csrfTokens: Map<string, { apiKey: string; expiresAt: number }> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [
    /<script[^>]*>.*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
    /document\.write/gi,
    /innerHTML\s*=/gi,
    /fromCharCode/gi,
    /\.exec\s*\(/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /<iframe[^>]*>/gi
  ];

  constructor() {
    this.initializeKnownThreats();
  }

  private initializeKnownThreats(): void {
    // Initialize with known malicious patterns
    // In production, this would load from a database
  }

  async analyzeRequest(request: SecurityRequest): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
    let threatScore = 0;

    // Check IP against blocklist
    if (this.blockedIPs.has(request.ip)) {
      return 'HIGH';
    }

    // Analyze user agent
    if (this.isSuspiciousUserAgent(request.userAgent)) {
      threatScore += 30;
    }

    // Analyze path for injection attempts
    if (this.containsInjectionPatterns(request.path)) {
      threatScore += 40;
    }

    // Check headers for suspicious patterns
    if (this.hasSuspiciousHeaders(request.headers)) {
      threatScore += 20;
    }

    // Rate limiting check
    const requestRate = await this.getRequestRate(request.ip);
    if (requestRate > 100) { // More than 100 requests per minute
      threatScore += 25;
    }

    if (threatScore >= 70) return 'HIGH';
    if (threatScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true;

    const suspiciousUA = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /perl/i,
      /java/i
    ];

    return suspiciousUA.some(pattern => pattern.test(userAgent));
  }

  private containsInjectionPatterns(input: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  private hasSuspiciousHeaders(headers: any): boolean {
    const suspicious = [
      headers['x-forwarded-for']?.includes('127.0.0.1'),
      headers['user-agent']?.length < 10,
      headers['referer']?.includes('javascript:'),
      headers['cookie']?.includes('<script')
    ];

    return suspicious.some(Boolean);
  }

  private async getRequestRate(ip: string): Promise<number> {
    // In production, this would check Redis or a database
    // For now, return a random value for demonstration
    return Math.floor(Math.random() * 150);
  }

  async validateCSRFToken(token: string, apiKey: string): Promise<boolean> {
    const storedToken = this.csrfTokens.get(token);
    
    if (!storedToken) {
      return false;
    }

    if (storedToken.apiKey !== apiKey) {
      return false;
    }

    if (Date.now() > storedToken.expiresAt) {
      this.csrfTokens.delete(token);
      return false;
    }

    return true;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    // In production, validate against database
    // For demo, accept any non-empty key
    return Boolean(apiKey && apiKey.length > 0);
  }

  async analyzeMetrics(metrics: SecurityMetrics): Promise<{ threatLevel: string; issues: string[] }> {
    const issues: string[] = [];
    let threatLevel = 'LOW';

    // Check for abnormal request patterns
    if (metrics.requestCount > 1000) {
      issues.push('Unusually high request count');
      threatLevel = 'MEDIUM';
    }

    // Check URL for suspicious patterns
    if (this.containsInjectionPatterns(metrics.url)) {
      issues.push('Suspicious patterns in URL');
      threatLevel = 'HIGH';
    }

    // Validate CSRF token format
    if (!/^[a-f0-9]{64}$/.test(metrics.csrfToken)) {
      issues.push('Invalid CSRF token format');
      threatLevel = 'MEDIUM';
    }

    return { threatLevel, issues };
  }

  async analyzeEvent(event: SecurityEvent): Promise<ThreatAnalysis> {
    const analysis: ThreatAnalysis = {
      isThreat: false,
      severity: 'LOW',
      confidence: 0
    };

    switch (event.eventType) {
      case 'error':
        if (event.data?.message?.includes('security')) {
          analysis.isThreat = true;
          analysis.threatType = 'SECURITY_ERROR';
          analysis.severity = 'MEDIUM';
          analysis.confidence = 0.7;
        }
        break;

      case 'page_visible':
        // Normal event, no threat
        break;

      default:
        if (this.containsInjectionPatterns(JSON.stringify(event.data))) {
          analysis.isThreat = true;
          analysis.threatType = 'INJECTION_ATTEMPT';
          analysis.severity = 'HIGH';
          analysis.confidence = 0.9;
        }
    }

    return analysis;
  }

  async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    // In production, verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || 'secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }

  async processWebhook(payload: any): Promise<void> {
    // Process webhook payload
    console.log('[Security] Processing webhook:', payload.type);
  }

  registerApiKey(apiKey: string, domain: string): void {
    this.apiKeys.set(apiKey, {
      domain,
      createdAt: Date.now()
    });
  }

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  addSuspiciousPattern(pattern: RegExp): void {
    this.suspiciousPatterns.push(pattern);
  }
}