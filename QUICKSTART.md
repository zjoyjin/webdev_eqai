# Quick Start Guide

## Setup and Run

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit:
   - [http://localhost:3000](http://localhost:3000) - Will redirect to /en
   - [http://localhost:3000/en](http://localhost:3000/en) - English version
   - [http://localhost:3000/zh](http://localhost:3000/zh) - Chinese version

## Available Routes

### English
- `/en` - Homepage
- `/en/work` - Work Assessment
- `/en/personal` - Personal Assessment
- `/en/kid` - Kid Assessment
- `/en/pet` - Pet Assessment

### Chinese
- `/zh` - Homepage
- `/zh/work` - Work Assessment
- `/zh/personal` - Personal Assessment
- `/zh/kid` - Kid Assessment
- `/zh/pet` - Pet Assessment

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Using Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

That's it! Vercel will automatically detect Next.js and configure everything.

## Customization

### Add New Translations
Edit `messages/en.json` and `messages/zh.json`

### Add Assessment Questions
Edit the placeholder sections in:
- `src/app/[locale]/work/page.tsx`
- `src/app/[locale]/personal/page.tsx`
- `src/app/[locale]/kid/page.tsx`
- `src/app/[locale]/pet/page.tsx`

### Change App Name
Edit the `appName` key in both translation files:
- `messages/en.json` - Change "Assessment Hub"
- `messages/zh.json` - Change "评估中心"
