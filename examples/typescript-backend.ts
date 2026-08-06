/**
 * TypeScript Backend Integration Example
 * 
 * This shows how to integrate SecureWeb backend validation
 * into your existing TypeScript/Node.js application
 */

import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// SecureWeb backend configuration
const SECUREWEB_ENDPOINT = 'https://api.yourdomain.com/security';
const API_KEY = 'your-api-key';

interface SecureWebValidationResult {
  valid: boolean;
  threatLevel?: string;
  issues?: string[];
}

/**
 * Middleware to validate SecureWeb tokens
 */
async function validateSecureWebToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const csrfToken = req.headers['x-secureweb-csrf-token'] as string;
  const protectedHeader = req.headers['x-secureweb-protected'] as string;

  // Skip validation for health checks
  if (req.path === '/health') {
    return next();
  }

  // Check if request has SecureWeb headers
  if (!protectedHeader || protectedHeader !== 'true') {
    console.warn('[Security] Request missing SecureWeb protection header');
    return res.status(403).json({ error: 'Request must be protected by SecureWeb' });
  }

  // Validate CSRF token with backend
  try {
    const response = await fetch(`${SECUREWEB_ENDPOINT}/validate-csrf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: csrfToken,
        apiKey: API_KEY
      })
    });

    const result: SecureWebValidationResult = await response.json();

    if (!result.valid) {
      console.warn('[Security] Invalid CSRF token');
      return res.status(403).json({ error: 'Invalid security token' });
    }

    // Check threat level
    if (result.threatLevel === 'HIGH') {
      console.warn('[Security] High threat level detected');
      return res.status(403).json({ error: 'Request blocked due to high threat level' });
    }

    next();
  } catch (error) {
    console.error('[Security] Validation error:', error);
    return res.status(500).json({ error: 'Security validation failed' });
  }
}

// Apply validation middleware to all routes
app.use(validateSecureWebToken);

// Your existing routes
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Process the contact form
  // SecureWeb has already validated the request
  
  res.json({ 
    success: true, 
    message: 'Contact form submitted successfully' 
  });
});

app.post('/api/users', async (req, res) => {
  const { username, email } = req.body;
  
  // Create user
  // SecureWeb has already validated the request
  
  res.json({ 
    success: true, 
    user: { id: 1, username, email } 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SecureWeb integration active`);
});

export default app;