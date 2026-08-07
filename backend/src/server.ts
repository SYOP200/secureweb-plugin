/**
 * SecureWeb Backend Service
 * Handles security monitoring, threat detection, and attack prevention
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { SecurityAnalyzer } from './security-analyzer';
import { ThreatDatabase } from './threat-database';
import authRoutes from './auth';
import { Database } from './database';

const app = express();
const PORT = process.env.PORT || 3000;
const database = new Database();
const securityAnalyzer = new SecurityAnalyzer(database);
const threatDatabase = new ThreatDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any origin with the SDK
    callback(null, true);
  },
  credentials: true
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', apiLimiter);
app.use(express.json({ limit: '10kb' }));

// Request logging and analysis
app.use(async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent');
  
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'SecureWeb Backend',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      validateCsrf: '/api/security/validate-csrf',
      metrics: '/api/security/metrics',
      events: '/api/security/events',
      threats: '/api/security/threats/:apiKey',
      report: '/api/security/report/:apiKey'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Serve static web interface
app.use(express.static(path.join(__dirname, '../../web')));

// CSRF token validation endpoint
app.post('/api/security/validate-csrf', async (req, res) => {
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
app.post('/api/security/metrics', async (req, res) => {
  try {
    const metrics = req.body;
    
    // Validate API key
    if (!await securityAnalyzer.validateApiKey(metrics.apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Store metrics for analysis
    await threatDatabase.storeMetrics(metrics);
    
    // Analyze for patterns
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
app.post('/api/security/events', async (req, res) => {
  try {
    const event = req.body;
    
    if (!await securityAnalyzer.validateApiKey(event.apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Store event
    await threatDatabase.storeEvent(event);
    
    // Analyze event for threats
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

// Webhook security endpoint
app.post('/api/security/webhook', async (req, res) => {
  try {
    const { apiKey, payload, signature } = req.body;
    
    if (!await securityAnalyzer.validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Verify webhook signature
    const isValid = await securityAnalyzer.verifyWebhookSignature(payload, signature);
    
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Process webhook
    await securityAnalyzer.processWebhook(payload);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Security] Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Threat intelligence endpoint
app.get('/api/security/threats/:apiKey', async (req, res) => {
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
app.get('/api/security/report/:apiKey', async (req, res) => {
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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only if not running in serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SecureWeb backend server running on port ${PORT}`);
    console.log(`Security monitoring active`);
  });
}

export default app;