# SecureWeb API Documentation

## Overview

SecureWeb provides both client-side SDK and backend API endpoints for comprehensive security protection.

## Client-Side SDK

### Installation

Add this single line to your HTML:

```html
<script src="https://cdn.yourdomain.com/secureweb.js" data-api-key="your-api-key"></script>
```

### Configuration

The SDK accepts configuration via data attributes:

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-api-key` | Yes | Your unique API key |
| `data-endpoint` | No | Custom backend endpoint (default: https://api.yourdomain.com/security) |
| `data-debug` | No | Enable debug logging (true/false) |

### JavaScript API

When loaded, the SDK exposes a global `window.SecureWeb` object:

```javascript
// Get current CSRF token
const token = window.SecureWeb.getCSRFToken();

// Update configuration
window.SecureWeb.updateConfig({
  debug: true,
  enableRateLimiting: false
});
```

## Backend API

### Base URL

```
https://api.yourdomain.com/security
```

### Authentication

All requests require an API key:
- Include in request body as `apiKey`
- Or include in header as `X-API-Key`

### Endpoints

#### POST /validate-csrf

Validate a CSRF token.

**Request:**
```json
{
  "token": "string",
  "apiKey": "string"
}
```

**Response:**
```json
{
  "valid": true
}
```

#### POST /metrics

Submit security metrics for analysis.

**Request:**
```json
{
  "apiKey": "string",
  "timestamp": 1234567890,
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0...",
  "requestCount": 100,
  "csrfToken": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "threatLevel": "LOW",
    "issues": []
  },
  "threatLevel": "LOW"
}
```

#### POST /events

Report security events.

**Request:**
```json
{
  "apiKey": "string",
  "eventType": "error",
  "timestamp": 1234567890,
  "url": "https://example.com/page",
  "data": {
    "message": "Error message",
    "filename": "script.js",
    "lineno": 42
  }
}
```

**Response:**
```json
{
  "success": true,
  "threatDetected": false
}
```

#### POST /webhook

Process security webhooks with signature verification.

**Request:**
```json
{
  "apiKey": "string",
  "payload": {},
  "signature": "hmac-signature"
}
```

**Response:**
```json
{
  "success": true
}
```

#### GET /threats/:apiKey

Retrieve recent threats for an API key.

**Response:**
```json
{
  "threats": [
    {
      "apiKey": "string",
      "eventType": "error",
      "threatType": "INJECTION_ATTEMPT",
      "severity": "HIGH",
      "timestamp": 1234567890,
      "url": "https://example.com/page"
    }
  ]
}
```

#### GET /report/:apiKey

Generate security report for a time period.

**Query Parameters:**
- `days`: Number of days to include (default: 7)

**Response:**
```json
{
  "apiKey": "string",
  "period": {
    "start": 1234567890,
    "end": 1234567890
  },
  "summary": {
    "totalEvents": 1000,
    "totalThreats": 5,
    "blockedRequests": 50,
    "uniqueIPs": 100
  },
  "threats": [
    {
      "type": "INJECTION_ATTEMPT",
      "count": 3,
      "severity": "HIGH",
      "lastOccurrence": 1234567890
    }
  ],
  "recommendations": [
    "Review input validation and sanitization",
    "Implement Content Security Policy headers"
  ]
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (threat detected, rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited:
- Default: 1000 requests per 15 minutes per IP
- Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Webhook Configuration

Configure webhooks to receive real-time security alerts:

1. Set webhook URL in your dashboard
2. Configure secret for signature verification
3. Receive POST requests with security events

**Webhook Payload:**
```json
{
  "event": "threat.detected",
  "data": {
    "threatType": "INJECTION_ATTEMPT",
    "severity": "HIGH",
    "ip": "1.2.3.4",
    "url": "https://example.com/page",
    "timestamp": 1234567890
  }
}
```

## Security Best Practices

1. **API Key Security**
   - Never expose API keys in client-side code
   - Use environment variables for backend integration
   - Rotate API keys regularly

2. **HTTPS Only**
   - Always use HTTPS for API calls
   - Enable HSTS on your domain

3. **Input Validation**
   - Validate all user input on your server
   - Never trust client-side validation alone

4. **Monitor Reports**
   - Review security reports regularly
   - Set up alerts for high-severity threats

5. **Keep Updated**
   - Keep SDK and backend updated
   - Monitor for security advisories