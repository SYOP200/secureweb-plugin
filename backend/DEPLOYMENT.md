# Backend Deployment

This backend is deployed on Railway.

## Environment Variables Required
- NODE_ENV=production
- PORT=3000
- WEBHOOK_SECRET=your-secret-key

## Endpoints
- GET / - Service information
- GET /health - Health check
- POST /api/security/validate-csrf - CSRF validation
- POST /api/security/metrics - Security metrics
- POST /api/security/events - Security events
- GET /api/security/threats/:apiKey - Threat history
- GET /api/security/report/:apiKey - Security reports