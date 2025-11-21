# Vercel Deployment Guide

## Quick Deploy

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Next.js
6. Click "Deploy"

### Step 3: Wait for Deployment
Vercel will automatically:
- Install dependencies
- Run `npm run build`
- Deploy your application

## After Deployment

### Expected URLs
- `your-app.vercel.app/` → Redirects to `/en`
- `your-app.vercel.app/en` → English homepage
- `your-app.vercel.app/zh` → Chinese homepage
- `your-app.vercel.app/en/work` → English work assessment
- `your-app.vercel.app/zh/work` → Chinese work assessment
- (Same pattern for /personal, /kid, /pet)

## Troubleshooting 404 Errors

### If you get a 404 error:

1. **Check Build Logs**
   - Go to your project on Vercel
   - Click on the deployment
   - Check "Build Logs" - it should show "✓ Generating static pages (13/13)"

2. **Verify Middleware is Working**
   - The build logs should show: "ƒ Middleware" with size
   - This means the locale redirect middleware is active

3. **Test Specific Routes First**
   - Instead of just `/`, try visiting `/en` directly
   - If `/en` works but `/` doesn't, there may be a middleware issue

4. **Force Redeploy**
   - Go to Deployments tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache" is OFF

5. **Check Framework Preset**
   - Go to Project Settings → General
   - Ensure Framework Preset is "Next.js"
   - Ensure Node.js Version is 18.x or higher

## Common Issues

### Issue: Root path shows 404
**Solution**: The middleware should redirect `/` to `/en`. If not:
- Check that `src/middleware.ts` exists in the deployment
- Verify the build logs show middleware was compiled
- Try accessing `/en` directly

### Issue: All routes show 404
**Solution**:
- Ensure the build completed successfully
- Check that all pages are in `src/app/[locale]/` structure
- Verify `generateStaticParams` is present in the layout

### Issue: Build succeeds but pages don't load
**Solution**:
- Check if you have a custom `vercel.json` with wrong config
- Remove `vercel.json` and let Vercel auto-detect

## Environment Variables

This project doesn't require any environment variables by default.

If you add environment variables later:
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy for changes to take effect

## Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow Vercel's DNS instructions
4. Your site will be available at both `your-domain.com` and `your-domain.com/en`

## Performance

The build output shows all pages are static (●):
- Fast loading times
- Served from Vercel's global CDN
- No server-side rendering overhead

Expected First Load JS: ~87-110 KB (excellent performance)
