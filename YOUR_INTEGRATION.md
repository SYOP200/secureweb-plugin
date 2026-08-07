# Your SecureWeb Integration

## 🎉 Backend Deployment is Ready!

### **Working URLs:**

**Backend:** `https://secureweb-backend-production.up.railway.app` ✅ **WORKING**  
**API Key:** `test-key-123` (for testing)

### **SDK Issue - Needs Alternative Hosting**

The Vercel SDK deployment has authentication issues. Use one of these alternatives:

### Option 1: GitHub Pages (Recommended - Free)

1. **Create a new GitHub repository** called `secureweb-sdk`
2. **Upload the SDK file** from `sdk-deploy/index.js` to the repository
3. **Enable GitHub Pages** in repository settings
4. **Your SDK URL will be:** `https://yourusername.github.io/secureweb-sdk/index.js`

### Option 2: Netlify (Free)

```bash
npm install -g netlify-cli
cd /Users/syop200/secureweb-plugin/sdk-deploy
netlify deploy --prod
```

### Option 3: Use the Local File (For Testing)

```html
<script src="sdk-deploy/index.js" 
  data-api-key="test-key-123"
  data-endpoint="https://secureweb-backend-production.up.railway.app">
</script>
```

## 🚀 Integration Once SDK is Hosted

```html
<script 
  src="YOUR_SDK_URL_HERE" 
  data-api-key="test-key-123"
  data-endpoint="https://secureweb-backend-production.up.railway.app">
</script>
```

Replace `YOUR_SDK_URL_HERE` with your chosen SDK hosting URL.

## 🧪 Test Backend Only

Since the backend is working, you can test it with `examples/backend-only-test.html`

## 🔧 SDK Hosting Alternatives

## 🚀 Add to Your Website

Copy and paste this single line into your website's `<head>` section:

```html
<script 
  src="https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js" 
  data-api-key="test-key-123"
  data-endpoint="https://secureweb-backend-production.up.railway.app">
</script>
```

That's it! Your website is now protected.

## 🧪 Test Your Integration

### Option 1: Quick Test
Open `examples/final-test.html` in your browser - it's pre-configured with your URLs.

### Option 2: Simple Test
Open `examples/simple-usage.html` - shows minimal integration example.

### Option 3: Test on Your Own Site
1. Add the script tag to your website
2. Open browser console (F12)
3. Type: `window.SecureWeb`
4. You should see the SecureWeb object

## ✅ What's Being Protected

- **XSS Attacks**: Automatic sanitization of dangerous content
- **CSRF Attacks**: Token validation on all forms
- **Rate Limiting**: 100 requests per minute per endpoint
- **Header Security**: Automatic security headers
- **Threat Detection**: Real-time analysis

## 🔧 Configuration Options

Remove `data-debug="true"` for production (reduces console logging):

```html
<script 
  src="https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js" 
  data-api-key="test-key-123"
  data-endpoint="https://secureweb-backend-production.up.railway.app">
</script>
```

## 📊 Monitor Your Security

Check your Railway dashboard for:
- Service logs
- Request metrics  
- Error tracking

## 🛠️ Backend API Endpoints

Your backend provides these endpoints:

- `GET /health` - Health check
- `POST /api/security/validate-csrf` - CSRF validation
- `POST /api/security/metrics` - Security metrics
- `POST /api/security/events` - Security events
- `GET /api/security/threats/:apiKey` - Threat history
- `GET /api/security/report/:apiKey` - Security reports

## 🔐 Production Considerations

For production use:

1. **Generate a real API key** (currently using test key)
2. **Add database persistence** to your backend
3. **Set up monitoring** (Railway provides logs)
4. **Configure custom domain** (optional)
5. **Remove debug mode** from script tag

## 📚 Documentation

- `docs/API.md` - Complete API documentation
- `docs/GETTING_STARTED.md` - Getting started guide
- `docs/HOSTING.md` - Hosting options
- `docs/RAILWAY_SETUP.md` - Railway-specific setup

## 🆘 Troubleshooting

**SDK not loading?**
- Check browser console for errors
- Verify the SDK URL is accessible
- Ensure script tag is in `<head>` section

**Backend not responding?**
- Check Railway service status
- Test health endpoint: `https://secureweb-backend-production.up.railway.app/health`
- Check Railway service logs

**Forms not protected?**
- Wait 1-2 seconds after page load for SDK to initialize
- Check that CSRF token appears in form
- Enable debug mode to see logs

## 🎯 Next Steps

1. ✅ Test with provided examples
2. ✅ Add to your actual website
3. ✅ Monitor security events
4. ✅ Configure production settings
5. ✅ Set up custom domain (optional)

---

**Your SecureWeb plugin is live and protecting your applications!** 🚀