# SecureWeb Plugin

A comprehensive security solution for web applications that can be integrated with a single line of JavaScript. Provides invisible backend protection against XSS, CSRF, injection attacks, and more.

## Features

- **XSS Protection**: Automatic sanitization of HTML content and dangerous JavaScript patterns
- **CSRF Protection**: Token-based validation for all form submissions and API requests
- **Rate Limiting**: Configurable request rate limiting per endpoint
- **Header Security**: Automatic security headers on all requests
- **Threat Detection**: Real-time analysis and blocking of suspicious activities
- **Security Monitoring**: Continuous monitoring and reporting of security events
- **Zero-Visibility**: Completely invisible to end users

## Quick Start

### 1. Installation

Install the dependencies:

```bash
npm run install:all
```

### 2. Build the project:

```bash
npm run build:all
```

### 3. Start the backend server:

```bash
npm start
```

The backend server will start on port 3000 by default.

## Integration

Add this single line to your website's HTML:

```html
<script src="https://cdn.yourdomain.com/secureweb.js" data-api-key="your-api-key"></script>
```

That's it! The plugin will automatically initialize and start protecting your website.

### Advanced Configuration

You can customize the behavior with additional attributes:

```html
<script 
  src="https://cdn.yourdomain.com/secureweb.js" 
  data-api-key="your-api-key"
  data-endpoint="https://your-api-endpoint.com"
  data-debug="true">
</script>
```

### Configuration Options

- `data-api-key` (required): Your unique API key for authentication
- `data-endpoint` (optional): Custom backend endpoint URL
- `data-debug` (optional): Enable debug logging (true/false)

## Architecture

### Client-Side SDK (`/sdk`)

The client-side SDK provides:
- Automatic XSS protection by sanitizing HTML content
- CSRF token generation and injection into forms
- Request interception for security validation
- Rate limiting per endpoint
- Security event reporting

### Backend Service (`/backend`)

The backend service provides:
- Real-time threat analysis
- Security metrics processing
- Threat database and reporting
- API key validation
- Webhook signature verification

## Security Features

### XSS Protection

- Sanitizes all `innerHTML` assignments
- Blocks dangerous `eval()` calls
- Detects and prevents script injection attempts
- Monitors for suspicious JavaScript patterns

### CSRF Protection

- Generates unique CSRF tokens for each session
- Automatically injects tokens into all forms
- Validates tokens on all API requests
- Configurable token expiration

### Rate Limiting

- Per-endpoint request tracking
- Configurable rate limits (default: 100 requests/minute)
- Automatic blocking of excessive requests
- Sliding window implementation

### Header Security

- Automatic security headers on all requests
- Request timestamping
- Protected request identification
- Custom header support

## API Endpoints

### POST /api/security/validate-csrf
Validate CSRF tokens

### POST /api/security/metrics
Submit security metrics for analysis

### POST /api/security/events
Report security events

### POST /api/security/webhook
Process security webhooks

### GET /api/security/threats/:apiKey
Retrieve recent threats for an API key

### GET /api/security/report/:apiKey
Generate security report for a time period

## Development

### Project Structure

```
secureweb-plugin/
├── sdk/                    # Client-side SDK
│   ├── src/
│   │   └── index.ts       # Main SDK implementation
│   ├── package.json
│   └── tsconfig.json
├── backend/                # Backend service
│   ├── src/
│   │   ├── server.ts      # Express server
│   │   ├── security-analyzer.ts
│   │   └── threat-database.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Documentation
├── examples/              # Integration examples
└── package.json           # Root package.json
```

### Building

```bash
# Build SDK only
cd sdk && npm run build

# Build backend only
cd backend && npm run build

# Build all
npm run build:all
```

### Development Mode

```bash
# Run both SDK and backend in watch mode
npm run dev
```

## Examples

See the `/examples` directory for complete integration examples:
- Basic HTML integration
- React integration
- Vue.js integration
- TypeScript integration

## Security Best Practices

1. **Keep API Keys Secret**: Never expose your API key in client-side code
2. **Use HTTPS**: Always serve the plugin over HTTPS
3. **Monitor Reports**: Regularly review security reports
4. **Update Regularly**: Keep the plugin updated for latest security patches
5. **Configure Appropriately**: Adjust security settings based on your needs

## License

MIT

## Support

For issues and questions, please open an issue on the repository.