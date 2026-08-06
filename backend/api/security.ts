import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SecurityAnalyzer } from '../src/security-analyzer';
import { ThreatDatabase } from '../src/threat-database';

const app = express();
const securityAnalyzer = new SecurityAnalyzer();
const threatDatabase = new ThreatDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for serverless
  hsts: false
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Request logging and analysis
app.use(async (req: any, res: any, next: any) => {
  const clientIP = req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || 'unknown';
  const userAgent = req.headers['user-agent'] as string;
  
  const threatLevel = await securityAnalyzer.analyzeRequest({
    ip: clientIP,
    userAgent,
    path: req.path,
    method: req.method,
    headers: req.headers
  });

  if (threatLevel === 'HIGH') {
    console.warn(`[Security] High threat detected from ${clientIP}`);
    return res.status(403).json({ error: 'Request blocked due to high threat level' });
  }

  next();
});

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// CSRF token validation endpoint
app.post('/api/security/validate-csrf', async (req: any, res: any) => {
  try {
    const { token, apiKey } = req.body;
    
    if (!token || !apiKey) {
      return res.status(400).json({ error: 'Missing token or API key' });
    }

    const isValid = await securityAnalyzer.validateCSRFToken(token, apiKey);
    
    res.json({ valid: isValid });
  } catch (error) {
    console.error('[Security] CSRF validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Security metrics endpoint
app.post('/api/security/metrics', async (req: any, res: any) => {
  try {
    const metrics = req.body;
    
    if (!await securityAnalyzer.validateApiKey(metrics.apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    await threatDatabase.storeMetrics(metrics);
    const analysis = await securityAnalyzer.analyzeMetrics(metrics);
    
    res.json({ 
      success: true, 
      analysis,
      threatLevel: analysis.threatLevel 
    });
  } catch (error) {
    console.error('[Security] Metrics processing error:', error);
    res.status(500).json({ error: 'Failed to process metrics' });
  }
});

// Security events endpoint
app.post('/api/security/events', async (req: any, res: any) => {
  try {
    const event = req.body;
    
    if (!await securityAnalyzer.validateApiKey(event.apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    await threatDatabase.storeEvent(event);
    const threatAnalysis = await securityAnalyzer.analyzeEvent(event);
    
    if (threatAnalysis.isThreat) {
      console.warn(`[Security] Threat detected: ${threatAnalysis.threatType}`);
      await threatDatabase.recordThreat({
        ...event,
        threatType: threatAnalysis.threatType,
        severity: threatAnalysis.severity
      });
    }
    
    res.json({ success: true, threatDetected: threatAnalysis.isThreat });
  } catch (error) {
    console.error('[Security] Event processing error:', error);
    res.status(500).json({ error: 'Failed to process event' });
  }
});

// Threat intelligence endpoint
app.get('/api/security/threats/:apiKey', async (req: any, res: any) => {
  try {
    const { apiKey } = req.params;
    
    if (!await securityAnalyzer.validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const threats = await threatDatabase.getRecentThreats(apiKey);
    
    res.json({ threats });
  } catch (error) {
    console.error('[Security] Threat retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve threats' });
  }
});

// Security report endpoint
app.get('/api/security/report/:apiKey', async (req: any, res: any) => {
  try {
    const { apiKey } = req.params;
    const { days = 7 } = req.query;
    
    if (!await securityAnalyzer.validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const report = await threatDatabase.generateSecurityReport(apiKey, Number(days));
    
    res.json(report);
  } catch (error) {
    console.error('[Security] Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
export default app;