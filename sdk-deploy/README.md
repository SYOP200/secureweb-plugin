# SecureWeb SDK - GitHub Pages Deployment

## Quick Setup for GitHub Pages

### Step 1: Create a new repository
1. Go to GitHub and create a new public repository called `secureweb-sdk`
2. Initialize it with a README

### Step 2: Upload the SDK file
1. Copy the file: `/Users/syop200/secureweb-plugin/sdk/dist/secureweb.js`
2. Upload it to your new `secureweb-sdk` repository
3. Rename it to `index.js` (GitHub Pages serves index files by default)

### Step 3: Enable GitHub Pages
1. Go to your repository Settings
2. Click on "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"

### Step 4: Get your URL
After a few minutes, your SDK will be available at:
```
https://yourusername.github.io/secureweb-sdk/index.js
```

## Update Your Integration

Replace the SDK URL in your integration:
```html
<script 
  src="https://yourusername.github.io/secureweb-sdk/index.js" 
  data-api-key="test-key-123"
  data-endpoint="https://secureweb-backend-production.up.railway.app">
</script>
```