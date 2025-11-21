# Vercel Deployment Checklist

## Pre-Deployment Checklist

- [ ] All files are committed to Git
- [ ] Repository is pushed to GitHub/GitLab/Bitbucket
- [ ] `npm run build` completes successfully locally
- [ ] `npm start` works and shows content at http://localhost:3000

## Vercel Deployment Steps

### Initial Setup
1. [ ] Go to [vercel.com](https://vercel.com) and sign in
2. [ ] Click "Add New Project"
3. [ ] Import your repository
4. [ ] **Important**: Verify these settings:
   - [ ] Framework Preset: **Next.js** (should auto-detect)
   - [ ] Root Directory: `./` (leave as default)
   - [ ] Build Command: `next build` (default)
   - [ ] Output Directory: `.next` (default)
   - [ ] Install Command: `npm install` (default)
   - [ ] Node.js Version: **18.x or higher**

5. [ ] Click "Deploy"

### Post-Deployment Verification

After deployment completes:

1. [ ] Check build logs show: "✓ Generating static pages (13/13)"
2. [ ] Check build logs show: "ƒ Middleware"
3. [ ] Visit your deployment URL
4. [ ] Test these routes:
   - [ ] `/` → Should redirect to `/en`
   - [ ] `/en` → Should show English homepage
   - [ ] `/zh` → Should show Chinese homepage
   - [ ] `/en/work` → Should show Work Assessment
   - [ ] `/en/personal` → Should show Personal Assessment
   - [ ] `/en/kid` → Should show Kid Assessment
   - [ ] `/en/pet` → Should show Pet Assessment
   - [ ] Language toggle button works (top-right)
   - [ ] Clicking assessment cards navigates correctly
   - [ ] Logo link returns to homepage

## If You Get 404 Errors

### Quick Fixes
- [ ] Try accessing `/en` instead of just `/`
- [ ] Check if build completed successfully in deployment logs
- [ ] Redeploy without using build cache:
  1. Go to Deployments tab
  2. Click (...) on latest deployment
  3. Click "Redeploy"
  4. **Uncheck** "Use existing Build Cache"

### Advanced Troubleshooting
- [ ] Verify `src/middleware.ts` exists in your repository
- [ ] Confirm all pages are in `src/app/[locale]/` directory
- [ ] Check Framework Preset is "Next.js" in project settings
- [ ] Ensure no custom `vercel.json` is conflicting (you can delete it)

## Common Issues & Solutions

### Issue: "404: NOT_FOUND" at root path
**Cause**: Middleware not running or misconfigured
**Fix**:
- Ensure `src/middleware.ts` is committed
- Check middleware config matcher includes `'/'`
- Try `/en` directly to verify app works

### Issue: Build fails with module errors
**Cause**: Dependencies not installed correctly
**Fix**:
- Check `package.json` is committed
- Verify all imports are correct
- Check Node.js version is 18.x+

### Issue: Pages load but translations don't work
**Cause**: Message files not found
**Fix**:
- Ensure `messages/en.json` and `messages/zh.json` are committed
- Check file paths in `src/i18n/request.ts`

## Success Criteria

Your deployment is successful when:
- ✅ Root path `/` redirects to `/en`
- ✅ Both `/en` and `/zh` show the homepage
- ✅ All 4 assessment pages load in both languages
- ✅ Language toggle switches between English and Chinese
- ✅ Navigation is smooth with no console errors
- ✅ Mobile responsive design works

## Deprecation Warnings

The following warnings are **NORMAL** and **DO NOT** affect your deployment:
```
npm warn deprecated rimraf@3.0.2
npm warn deprecated inflight@1.0.6
npm warn deprecated @humanwhocodes/object-schema@2.0.3
npm warn deprecated @humanwhocodes/config-array@0.13.0
npm warn deprecated glob@7.2.3
npm warn deprecated eslint@8.57.1
```

These come from Next.js dependencies and will be updated in future Next.js versions.

## Need Help?

If issues persist:
1. Check build logs carefully for actual errors (not warnings)
2. Test production build locally: `npm run build && npm start`
3. Compare local production with Vercel deployment
4. Check Vercel's deployment logs for specific error messages
