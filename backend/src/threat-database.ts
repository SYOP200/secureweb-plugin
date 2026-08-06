/**
 * Threat Database - Storage and analysis of security threats
 * In production, this would use a real database (PostgreSQL, MongoDB, etc.)
 */

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
  threatType?: string;
  severity?: string;
}

interface SecurityReport {
  apiKey: string;
  period: { start: number; end: number };
  summary: {
    totalEvents: number;
    totalThreats: number;
    blockedRequests: number;
    uniqueIPs: number;
  };
  threats: ThreatSummary[];
  recommendations: string[];
}

interface ThreatSummary {
  type: string;
  count: number;
  severity: string;
  lastOccurrence: number;
}

export class ThreatDatabase {
  private metrics: Map<string, SecurityMetrics[]> = new Map();
  private events: Map<string, SecurityEvent[]> = new Map();
  private threats: Map<string, SecurityEvent[]> = new Map();
  private blockedRequests: Map<string, number> = new Map();
  private uniqueIPs: Map<string, Set<string>> = new Map();

  async storeMetrics(metrics: SecurityMetrics): Promise<void> {
    const apiKey = metrics.apiKey;
    if (!this.metrics.has(apiKey)) {
      this.metrics.set(apiKey, []);
    }
    
    const storedMetrics = this.metrics.get(apiKey)!;
    storedMetrics.push(metrics);
    
    // Keep only last 1000 metrics per API key
    if (storedMetrics.length > 1000) {
      storedMetrics.shift();
    }
  }

  async storeEvent(event: SecurityEvent): Promise<void> {
    const apiKey = event.apiKey;
    if (!this.events.has(apiKey)) {
      this.events.set(apiKey, []);
    }
    
    const storedEvents = this.events.get(apiKey)!;
    storedEvents.push(event);
    
    // Keep only last 5000 events per API key
    if (storedEvents.length > 5000) {
      storedEvents.shift();
    }
  }

  async recordThreat(threat: SecurityEvent): Promise<void> {
    const apiKey = threat.apiKey;
    if (!this.threats.has(apiKey)) {
      this.threats.set(apiKey, []);
    }
    
    const storedThreats = this.threats.get(apiKey)!;
    storedThreats.push(threat);
    
    // Keep only last 1000 threats per API key
    if (storedThreats.length > 1000) {
      storedThreats.shift();
    }
  }

  async getRecentThreats(apiKey: string, limit: number = 50): Promise<SecurityEvent[]> {
    const threats = this.threats.get(apiKey) || [];
    return threats.slice(-limit).reverse();
  }

  async getMetrics(apiKey: string, limit: number = 100): Promise<SecurityMetrics[]> {
    const metrics = this.metrics.get(apiKey) || [];
    return metrics.slice(-limit).reverse();
  }

  async getEvents(apiKey: string, limit: number = 100): Promise<SecurityEvent[]> {
    const events = this.events.get(apiKey) || [];
    return events.slice(-limit).reverse();
  }

  async recordBlockedRequest(apiKey: string, ip: string): Promise<void> {
    const current = this.blockedRequests.get(apiKey) || 0;
    this.blockedRequests.set(apiKey, current + 1);
    
    if (!this.uniqueIPs.has(apiKey)) {
      this.uniqueIPs.set(apiKey, new Set());
    }
    this.uniqueIPs.get(apiKey)!.add(ip);
  }

  async generateSecurityReport(apiKey: string, days: number): Promise<SecurityReport> {
    const now = Date.now();
    const start = now - (days * 24 * 60 * 60 * 1000);
    
    const events = this.events.get(apiKey) || [];
    const threats = this.threats.get(apiKey) || [];
    
    const filteredEvents = events.filter(e => e.timestamp >= start);
    const filteredThreats = threats.filter(t => t.timestamp >= start);
    
    // Group threats by type
    const threatGroups = new Map<string, { count: number; severity: string; lastOccurrence: number }>();
    
    filteredThreats.forEach(threat => {
      const type = threat.threatType || 'UNKNOWN';
      const existing = threatGroups.get(type) || { count: 0, severity: threat.severity || 'LOW', lastOccurrence: 0 };
      existing.count++;
      existing.lastOccurrence = Math.max(existing.lastOccurrence, threat.timestamp);
      threatGroups.set(type, existing);
    });
    
    const threatSummaries: ThreatSummary[] = Array.from(threatGroups.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      severity: data.severity,
      lastOccurrence: data.lastOccurrence
    }));
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredThreats, filteredEvents);
    
    return {
      apiKey,
      period: { start, end: now },
      summary: {
        totalEvents: filteredEvents.length,
        totalThreats: filteredThreats.length,
        blockedRequests: this.blockedRequests.get(apiKey) || 0,
        uniqueIPs: this.uniqueIPs.get(apiKey)?.size || 0
      },
      threats: threatSummaries,
      recommendations
    };
  }

  private generateRecommendations(threats: SecurityEvent[], events: SecurityEvent[]): string[] {
    const recommendations: string[] = [];
    
    const threatTypes = new Set(threats.map(t => t.threatType));
    
    if (threatTypes.has('INJECTION_ATTEMPT')) {
      recommendations.push('Review input validation and sanitization on all forms');
      recommendations.push('Implement parameterized queries for database operations');
    }
    
    if (threatTypes.has('XSS_ATTEMPT')) {
      recommendations.push('Implement Content Security Policy (CSP) headers');
      recommendations.push('Sanitize all user-generated content before rendering');
    }
    
    if (threatTypes.has('CSRF_ATTEMPT')) {
      recommendations.push('Ensure all state-changing requests include CSRF tokens');
      recommendations.push('Implement SameSite cookie attribute');
    }
    
    const errorCount = events.filter(e => e.eventType === 'error').length;
    if (errorCount > 100) {
      recommendations.push('Investigate high error rate - may indicate stability issues');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('No significant security issues detected');
      recommendations.push('Continue monitoring and maintain current security posture');
    }
    
    return recommendations;
  }

  async cleanupOldData(retentionDays: number = 30): Promise<void> {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    for (const [apiKey, metrics] of this.metrics.entries()) {
      this.metrics.set(apiKey, metrics.filter(m => m.timestamp > cutoff));
    }
    
    for (const [apiKey, events] of this.events.entries()) {
      this.events.set(apiKey, events.filter(e => e.timestamp > cutoff));
    }
    
    for (const [apiKey, threats] of this.threats.entries()) {
      this.threats.set(apiKey, threats.filter(t => t.timestamp > cutoff));
    }
  }

  getStats(): { totalMetrics: number; totalEvents: number; totalThreats: number; activeApiKeys: number } {
    let totalMetrics = 0;
    let totalEvents = 0;
    let totalThreats = 0;
    
    for (const metrics of this.metrics.values()) {
      totalMetrics += metrics.length;
    }
    
    for (const events of this.events.values()) {
      totalEvents += events.length;
    }
    
    for (const threats of this.threats.values()) {
      totalThreats += threats.length;
    }
    
    return {
      totalMetrics,
      totalEvents,
      totalThreats,
      activeApiKeys: this.metrics.size
    };
  }
}