#!/bin/bash

# SecureWeb Plugin Deployment Script
# This script helps deploy both backend and SDK to various platforms

set -e

echo "🚀 SecureWeb Plugin Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the secureweb-plugin root directory"
    exit 1
fi

# Build everything
echo "📦 Building project..."
npm run build:all

echo "✅ Build complete!"
echo ""
echo "Choose deployment option:"
echo "1) Deploy backend to Heroku"
echo "2) Deploy backend to Railway"
echo "3) Deploy SDK to Vercel"
echo "4) Deploy SDK to Netlify"
echo "5) Full deployment (backend + SDK)"
echo "6) Exit"
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo "📝 Deploying backend to Heroku..."
        cd backend
        heroku create secureweb-backend || true
        heroku config:set NODE_ENV=production
        heroku config:set WEBHOOK_SECRET=$(openssl rand -hex 32)
        git add .
        git commit -m "Deploy to Heroku" || true
        git push heroku main || true
        echo "✅ Backend deployed to Heroku!"
        heroku open
        ;;
    2)
        echo "📝 Deploying backend to Railway..."
        cd backend
        railway init
        railway up
        echo "✅ Backend deployed to Railway!"
        ;;
    3)
        echo "📝 Deploying SDK to Vercel..."
        cd sdk/dist
        vercel --prod
        echo "✅ SDK deployed to Vercel!"
        ;;
    4)
        echo "📝 Deploying SDK to Netlify..."
        cd sdk/dist
        netlify deploy --prod
        echo "✅ SDK deployed to Netlify!"
        ;;
    5)
        echo "📝 Full deployment..."
        
        # Deploy backend
        echo "Deploying backend to Heroku..."
        cd backend
        heroku create secureweb-backend || true
        heroku config:set NODE_ENV=production
        heroku config:set WEBHOOK_SECRET=$(openssl rand -hex 32)
        git add .
        git commit -m "Deploy to Heroku" || true
        git push heroku main || true
        BACKEND_URL=$(heroku info -j | grep -o '"web_url":"[^"]*"' | cut -d'"' -f4)
        
        # Deploy SDK
        echo "Deploying SDK to Vercel..."
        cd ../sdk/dist
        vercel --prod
        SDK_URL=$(vercel ls --prod 2>/dev/null | head -n 1 | awk '{print $2}')
        
        cd ../..
        
        echo "✅ Full deployment complete!"
        echo "Backend URL: $BACKEND_URL"
        echo "SDK URL: $SDK_URL"
        echo ""
        echo "Add this to your website:"
        echo "<script src=\"$SDK_URL/index.js\" data-api-key=\"your-api-key\" data-endpoint=\"$BACKEND_URL\"></script>"
        ;;
    6)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac