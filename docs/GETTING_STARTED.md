# Getting Started Guide

## Prerequisites

- Node.js 16+ and npm
- Basic understanding of web development
- An API key from SecureWeb (contact us to get one)

## Installation

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/secureweb-plugin.git
cd secureweb-plugin
```

### 2. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for both the SDK and backend.

### 3. Build the Project

```bash
npm run build:all
```

This compiles the TypeScript code to JavaScript.

## Running the Backend

### Development Mode

```bash
cd backend
npm run dev
```

### Production Mode

```bash
npm start
```

The backend server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Integrating the SDK

### Step 1: Host the SDK

After building, the compiled SDK will be in `sdk/dist/index.js`. Host this file on your CDN or server.

### Step 2: Add to Your Website

Add this single line to your HTML `<head>` section:

```html
<script src="https://cdn.yourdomain.com/secureweb.js" data-api-key="your-api-key"></script>
```

Replace:
- `https://cdn.yourdomain.com/secureweb.js` with your SDK URL
- `your-api-key` with your actual API key

### Step 3: That's It!

The SDK will automatically:
- Initialize when the page loads
- Start protecting against XSS attacks
- Generate and inject CSRF tokens
- Monitor for suspicious activity
- Report security events to your backend

## Verification

### Check if SDK is Loaded

Open your browser's console and run:

```javascript
console.log(window.SecureWeb);
```

You should see the SecureWeb object with methods like `getCSRFToken()`.

### Test CSRF Protection

1. Open a form on your protected page
2. Inspect the form elements
3. You should see a hidden input with `name="secureweb_csrf_token"`

### Test XSS Protection

Try to inject JavaScript into an input field:

```javascript
// In the browser console
document.getElementById('some-input').value = '<script>alert("XSS")</script>';
```

The SDK will sanitize this input.

## Configuration

### Basic Configuration

```html
<script 
  src="https://cdn.yourdomain.com/secureweb.js" 
  data-api-key="your-api-key">
</script>
```

### Advanced Configuration

```html
<script 
  src="https://cdn.yourdomain.com/secureweb.js" 
  data-api-key="your-api-key"
  data-endpoint="https://your-api.com/security"
  data-debug="true">
</script>
```

### Runtime Configuration

You can also configure the SDK at runtime:

```javascript
if (window.SecureWeb) {
  window.SecureWeb.updateConfig({
    debug: true,
    enableRateLimiting: false,
    enableXSSProtection: true
  });
}
```

## Backend Integration

If you want to validate requests on your backend:

### Option 1: Manual Validation

```typescript
import fetch from 'node-fetch';

async function validateRequest(csrfToken: string, apiKey: string) {
  const response = await fetch('https://api.yourdomain.com/security/validate-csrf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: csrfToken, apiKey })
  });
  
  const result = await response.json();
  return result.valid;
}
```

### Option 2: Middleware

See `examples/typescript-backend.ts` for a complete middleware implementation.

## Testing

### Test Locally

1. Start the backend server
2. Open `examples/simple-integration.html` in your browser
3. Check the browser console for SecureWeb logs
4. Try submitting the form

### Test with Your Website

1. Add the SDK script to your website
2. Enable debug mode: `data-debug="true"`
3. Open browser console to see security logs
4. Test various scenarios (form submission, API calls, etc.)

## Troubleshooting

### SDK Not Loading

**Problem:** `window.SecureWeb` is undefined

**Solutions:**
- Check that the script URL is correct
- Verify the script tag has `data-api-key` attribute
- Check browser console for errors
- Ensure the script is not blocked by CSP

### CSRF Validation Failing

**Problem:** Forms are not being protected

**Solutions:**
- Check that the SDK is loaded
- Verify API key is valid
- Check backend server is running
- Enable debug mode to see logs

### High Threat Level

**Problem:** Requests are being blocked

**Solutions:**
- Review security reports in dashboard
- Check if your IP is blocked
- Verify request patterns are legitimate
- Contact support if needed

## Next Steps

1. **Customize Configuration**: Adjust security settings for your needs
2. **Set Up Monitoring**: Configure webhook alerts for threats
3. **Review Reports**: Check security reports regularly
4. **Scale Up**: Consider dedicated infrastructure for high-traffic sites

## Support

- Documentation: See `/docs` folder
- Examples: See `/examples` folder
- Issues: Open an issue on GitHub
- Email: support@secureweb.com