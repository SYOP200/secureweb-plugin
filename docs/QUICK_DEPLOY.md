# Quick Deployment Guide

You've already deployed the SDK to Vercel! Here's how to complete the setup:

## Current Status

✅ **SDK Deployed:** https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js

⏳ **Backend:** Needs deployment

## Next Steps: Deploy Backend

### Option 1: Render.com (Recommended - Free)

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Select `secureweb-plugin` repository
5. Configure:
   - **Name:** `secureweb-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `WEBHOOK_SECRET`: (generate random string)
7. Click "Create Web Service"

### Option 2: Railway (Free)

```bash
npm install -g @railway/cli
railway login
cd /Users/syop200/secureweb-plugin/backend
railway init
railway up
```

### Option 3: Heroku (Free tier)

```bash
cd /Users/syop200/secureweb-plugin/backend
heroku create secureweb-backend
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
git push heroku main
```

## After Backend Deployment

Once your backend is deployed, you'll get a URL like:
- `https://secureweb-backend.onrender.com`
- `https://secureweb-backend.railway.app`
- `https://secureweb-backend.herokuapp.com`

## Update Your Integration

Use these URLs in your website:

```html
<script 
  src="https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js" 
  data-api-key="your-api-key"
  data-endpoint="YOUR_BACKEND_URL">
</script>
```

Replace `YOUR_BACKEND_URL` with your actual backend URL.

## Test the Integration

1. Open `examples/simple-integration.html` in your browser
2. Update the script tag with your URLs
3. Check browser console for SecureWeb logs
4. Submit the test form

## Need API Keys?

For now, you can use any non-empty string as your API key for testing:
```html
data-api-key="test-key-123"
```

For production, you'll want to implement proper API key management in your backend.

## Quick Test

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SecureWeb Test</title>
    <script 
      src="https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js" 
      data-api-key="test-key-123"
      data-endpoint="YOUR_BACKEND_URL"
      data-debug="true">
    </script>
</head>
<body>
    <h1>SecureWeb Test</h1>
    <form>
        <input type="text" name="test" placeholder="Test input">
        <button type="submit">Submit</button>
    </form>
    
    <script>
        setTimeout(() => {
            console.log('SecureWeb loaded:', window.SecureWeb);
            if (window.SecureWeb) {
                console.log('CSRF Token:', window.SecureWeb.getCSRFToken());
            }
        }, 1000);
    </script>
</body>
</html>
```

Replace `YOUR_BACKEND_URL` with your deployed backend URL.