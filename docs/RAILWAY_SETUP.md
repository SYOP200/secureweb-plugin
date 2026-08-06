# Railway Backend Setup Guide

Your backend is currently building on Railway! Here's what to do next:

## Current Status

🔄 **Building:** Railway is creating a Docker image of your backend
⏳ **Estimated time:** 2-5 minutes

## Next Steps

### 1. Wait for Build to Complete

Monitor your Railway dashboard at:
https://railway.com/project/f3a622fc-52b2-46ed-9bea-3889fccdcaee/service/683b9d1d-611e-4978-8641-43e53173d645

Wait until you see:
- ✅ "Deployed" status
- ✅ Green indicator on your service
- ✅ A generated URL for your service

### 2. Get Your Backend URL

Once deployed, Railway will provide a URL like:
- `https://your-service-name.up.railway.app`
- `https://random-string.railway.app`

You'll find this in:
- The Railway dashboard (top of your service page)
- The "Domains" section in Railway settings

### 3. Test the Integration

I've created a test file for you: `examples/railway-test.html`

Open it in your browser and:
1. Enter your Railway backend URL
2. Click "Update Integration"
3. Submit the test form
4. Check the console output

### 4. Use in Your Website

Once you have your Railway URL, use this integration:

```html
<script 
  src="https://secureweb-eg4t3di36-syop200s-projects.vercel.app/secureweb.js" 
  data-api-key="test-key-123"
  data-endpoint="YOUR_RAILWAY_URL"
  data-debug="true">
</script>
```

Replace `YOUR_RAILWAY_URL` with your actual Railway service URL.

## Troubleshooting

### Build Fails

If the build fails on Railway:

1. Check the build logs in Railway dashboard
2. Make sure `backend/package.json` has correct scripts
3. Verify TypeScript compiles locally first:
   ```bash
   cd backend
   npm run build
   ```

### Service Won't Start

If the service builds but won't start:

1. Check environment variables in Railway settings
2. Add these if missing:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `WEBHOOK_SECRET=any-random-string`
3. Check service logs in Railway dashboard

### CORS Errors

If you get CORS errors in the browser:

1. The backend already has CORS enabled for all origins
2. If you still have issues, check Railway service logs
3. The error might be due to backend not being fully ready

### Backend URL Not Working

If your Railway URL doesn't work:

1. Make sure the service is "Deployed" (not building)
2. Try the health endpoint: `https://your-url.railway.app/health`
3. Check Railway service logs for errors

## Environment Variables

Add these in your Railway service settings:

```
NODE_ENV=production
PORT=3000
WEBHOOK_SECRET=generate-a-random-secret-key
```

## Railway CLI Alternative

If you prefer using the Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd /Users/syop200/secureweb-plugin/backend

# Initialize
railway init

# Deploy
railway up

# Get logs
railway logs

# Open dashboard
railway open
```

## Monitoring

Once deployed, you can monitor your backend:

- **Logs:** Railway dashboard → Logs tab
- **Metrics:** Railway dashboard → Metrics tab
- **Settings:** Railway dashboard → Settings tab

## Scaling

Railway automatically scales, but you can configure:

- **CPU/RAM:** Service settings → General
- **Replicas:** Service settings → General
- **Regions:** Service settings → General

## Next Steps After Successful Deployment

1. ✅ Test with `examples/railway-test.html`
2. ✅ Verify health endpoint works
3. ✅ Test metrics endpoint
4. ✅ Add to your actual website
5. ✅ Monitor Railway logs for issues
6. ✅ Set up custom domain (optional)

## Cost

Railway free tier includes:
- $5 credit/month
- Up to 512MB RAM
- Up to 1 vCPU
- Enough for development and small projects

## Support

If you encounter issues:
- Check Railway service logs
- Verify the build completed successfully
- Test the health endpoint
- Open an issue on GitHub