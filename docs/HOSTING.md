# Hosting Guide for SecureWeb Plugin

This guide explains how to host both the backend service and the client-side SDK for production use.

## Overview

SecureWeb requires two components to be hosted:

1. **Backend Service**: Node.js/Express server that handles security analysis and threat detection
2. **Client SDK**: JavaScript file that gets loaded by websites using the plugin

## Backend Hosting Options

### Option 1: VPS/Cloud Server (Recommended for Production)

#### Popular Providers:
- **DigitalOcean** ($5-40/month)
- **AWS EC2** (Free tier available)
- **Google Cloud Compute Engine** (Free tier available)
- **Linode** ($5-80/month)
- **Heroku** ($7-500/month)

#### Steps:

1. **Choose a provider and create a server**
   - Ubuntu 20.04 or 22.04 LTS recommended
   - Minimum 1GB RAM, 1 CPU core

2. **Connect to your server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone your repository**
   ```bash
   git clone https://github.com/SYOP200/secureweb-plugin.git
   cd secureweb-plugin/backend
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Build the project**
   ```bash
   npm run build
   ```

7. **Set up environment variables**
   ```bash
   # Create .env file
   echo "PORT=3000" > .env
   echo "NODE_ENV=production" >> .env
   echo "WEBHOOK_SECRET=your-secret-key" >> .env
   ```

8. **Install PM2 for process management**
   ```bash
   sudo npm install -g pm2
   ```

9. **Start the service with PM2**
   ```bash
   pm2 start dist/server.js --name secureweb-backend
   pm2 save
   pm2 startup
   ```

10. **Set up Nginx as reverse proxy (optional but recommended)**
    ```bash
    sudo apt install nginx
    sudo nano /etc/nginx/sites-available/secureweb
    ```

    Add this configuration:
    ```nginx
    server {
        listen 80;
        server_name api.yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

    ```bash
    sudo ln -s /etc/nginx/sites-available/secureweb /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Set up SSL with Let's Encrypt (free)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

### Option 2: Platform as a Service (Easiest)

#### Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create app**
   ```bash
   cd /Users/syop200/secureweb-plugin/backend
   heroku create your-app-name
   ```

4. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set WEBHOOK_SECRET=your-secret-key
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize project**
   ```bash
   cd /Users/syop200/secureweb-plugin/backend
   railway init
   ```

3. **Deploy**
   ```bash
   railway up
   ```

#### Render

1. **Create account at render.com**
2. **Connect your GitHub repository**
3. **Create new Web Service**
4. **Select your repository**
5. **Configure build and start commands**
   - Build: `npm install && npm run build`
   - Start: `npm start`

### Option 3: Serverless Functions

#### AWS Lambda + API Gateway

1. **Package your backend for Lambda**
2. **Set up API Gateway**
3. **Configure Lambda function**
4. **Deploy using AWS CLI or Serverless Framework**

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd /Users/syop200/secureweb-plugin/backend
   vercel
   ```

## Client SDK Hosting Options

### Option 1: CDN (Recommended for Performance)

#### Cloudflare CDN

1. **Upload compiled SDK to Cloudflare**
2. **Enable caching**
3. **Set up custom domain**

#### AWS CloudFront

1. **Upload SDK to S3 bucket**
2. **Create CloudFront distribution**
3. **Configure origin and behaviors**

#### Fastly CDN

1. **Create Fastly account**
2. **Upload SDK files**
3. **Configure caching rules**

### Option 2: Static File Hosting

#### GitHub Pages

1. **Create a separate repository for the SDK**
2. **Upload compiled SDK files**
3. **Enable GitHub Pages**
4. **Access via: https://username.github.io/sdk-repo/secureweb.js`

#### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   cd /Users/syop200/secureweb-plugin/sdk/dist
   netlify deploy --prod
   ```

#### Vercel

```bash
cd /Users/syop200/secureweb-plugin/sdk/dist
vercel --prod
```

### Option 3: Your Own Server

If you're already hosting the backend, you can serve the SDK from the same server:

1. **Copy compiled SDK to web root**
   ```bash
   cp /Users/syop200/secureweb-plugin/sdk/dist/index.js /var/www/html/secureweb.js
   ```

2. **Configure Nginx to serve the file**
   ```nginx
   location /secureweb.js {
       root /var/www/html;
       add_header Cache-Control "public, max-age=3600";
   }
   ```

## Quick Start Hosting (Free Options)

### Backend: Render.com (Free tier)

1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Click "New +" → "Web Service"
4. Select your `secureweb-plugin` repository
5. Configure:
   - Name: `secureweb-backend`
   - Region: Oregon (free tier)
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Click "Create Web Service"

### SDK: GitHub Pages (Free)

1. Create a new repository: `secureweb-sdk`
2. Copy `sdk/dist/index.js` to the repository
3. Go to repository Settings → Pages
4. Enable GitHub Pages from main branch
5. Access at: `https://yourusername.github.io/secureweb-sdk/index.js`

## Production Checklist

- [ ] Backend deployed with HTTPS
- [ ] SDK hosted on CDN for fast loading
- [ ] Environment variables configured
- [ ] Process manager (PM2) set up
- [ ] Monitoring and logging configured
- [ ] Database persistence added (if needed)
- [ ] Rate limiting configured
- [ ] API key management system
- [ ] Backup strategy in place
- [ ] Load balancing for high traffic

## Custom Domain Setup

### For Backend (api.yourdomain.com)

1. **Point DNS to your hosting provider**
   ```
   A    api    your-server-ip
   ```

2. **Configure SSL certificate**
   - Use Let's Encrypt (free) or purchase SSL

### For SDK (cdn.yourdomain.com)

1. **Point DNS to your CDN**
   ```
   CNAME    cdn    your-cdn-provider.com
   ```

2. **Configure CDN to serve the SDK file**

## Updating Your Integration

Once hosted, update your integration code:

```html
<!-- Replace with your actual hosted URLs -->
<script 
  src="https://cdn.yourdomain.com/secureweb.js" 
  data-api-key="your-api-key"
  data-endpoint="https://api.yourdomain.com/security">
</script>
```

## Cost Estimates

### Low Traffic (< 10k requests/day)
- Backend: Free (Render, Railway free tiers)
- SDK: Free (GitHub Pages, Cloudflare free tier)
- **Total: $0/month**

### Medium Traffic (10k-100k requests/day)
- Backend: $5-20/month (DigitalOcean, AWS)
- SDK: $0-5/month (Cloudflare, AWS CloudFront)
- **Total: $5-25/month**

### High Traffic (100k+ requests/day)
- Backend: $20-100/month (AWS, Google Cloud)
- SDK: $5-20/month (Cloudflare enterprise)
- **Total: $25-120/month**

## Monitoring and Analytics

### Recommended Tools:
- **Sentry**: Error tracking
- **Datadog**: Infrastructure monitoring
- **LogRocket**: Session replay
- **Google Analytics**: Traffic analysis

## Support

For hosting issues:
- Check backend logs: `pm2 logs secureweb-backend`
- Monitor server resources: `htop`
- Test API endpoints: `curl https://api.yourdomain.com/health`