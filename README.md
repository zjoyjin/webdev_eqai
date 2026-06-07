# EQAI - Emotional Intelligence Meets AI

A modern, professional landing page and assessment platform for EQAIGlobal. Built with Next.js 14 and TailwindCSS, featuring full internationalization support for English and Chinese.

## Priority Focus

- Site security and anti-abuse protection are high priority.
- Assessment scale / measure content is a core product area and should be treated as important platform content.

## Features

- **Professional Landing Page**: Hero section, mission statement, and feature highlights
- **Clean, Google-inspired Design**: Minimal UI with excellent typography and spacing
- **Full Internationalization**: Complete English/Chinese support with next-intl
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Multiple Pages**:
  - Homepage with hero, features, and assessment cards
  - About Us page with mission, vision, and values
  - Four assessment pages: Work, Personal, Kid, and Pet
- **Assessment Directory API**:
  - Legacy-compatible full catalog response
  - Structured module, group, and measure endpoints
- **Modern Navigation**: Sticky header with mobile hamburger menu
- **Static Generation**: All pages pre-rendered for optimal performance
- **Built with**: Next.js 14 App Router, TypeScript, TailwindCSS

## Installation

1. Install dependencies:

```bash
npm install
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/en` (English) by default.

## Available Routes

### Main Pages
- `/en` - English homepage (with hero, features, mission)
- `/zh` - Chinese homepage
- `/en/about` - About Us page (English)
- `/zh/about` - About Us page (Chinese)
- `/en/contact` - Contact page (English)
- `/zh/contact` - Contact page (Chinese)

### Assessment Pages
- `/en/work` - Work assessment (English)
- `/en/personal` - Personal assessment (English)
- `/en/kid` - Kid assessment (English)
- `/en/pet` - Pet assessment (English)
- `/zh/work` - Work assessment (Chinese)
- `/zh/personal` - Personal assessment (Chinese)
- `/zh/kid` - Kid assessment (Chinese)
- `/zh/pet` - Pet assessment (Chinese)

### Assessment Directory API
- `/api/assessments` - Full catalog response compatible with the current frontend
- `/api/assessments/modules` - Compact module summaries
- `/api/assessments/groups` - Assessment group summaries
- `/api/assessments/groups?module=能力与发展` - Groups filtered by module
- `/api/assessments/measures` - Assessment measure summaries
- `/api/assessments/measures?group=MWI` - Measures filtered by group code

The API reads Supabase structured directory tables when configured, and falls back to `dataset/assessment_data.json` when Supabase is unavailable or not configured.

### MVP Auth + Scale Records
- `/en/login` / `/zh/login` - Email/password login and registration through Supabase Auth
- `/en/assessments` / `/zh/assessments` - Demo scale catalog scaffold
- `/en/assessments/[scaleCode]` / `/zh/assessments/[scaleCode]` - Demo scale detail and start action
- `/en/assessments/[scaleCode]/take` / `/zh/assessments/[scaleCode]/take` - Demo 1-5 item scoring flow
- `/en/assessments/[scaleCode]/result` / `/zh/assessments/[scaleCode]/result` - Demo saved-result page
- `/en/me/assessments` / `/zh/me/assessments` - Current user's started/completed demo scale records

Before testing the full record-saving flow, run `backend/ingestion/mvp_scale_records.sql` in the Supabase SQL Editor. The page can preview local demo scale data without that SQL, but creating user records requires the MVP tables and RLS policies.

To check whether the local app and Supabase project are ready for the full MVP auth smoke, run:

```bash
npm run check:mvp
```

To check the Supabase-backed MVP data path, run:

```bash
npm run smoke:mvp-auth
```

Without test credentials, the smoke script verifies that the public demo catalog and items are readable through the publishable key. To verify login and user-owned record writes, run:

```bash
MVP_SMOKE_EMAIL=your-test-email@your-domain.com MVP_SMOKE_PASSWORD=your-password npm run smoke:mvp-auth
```

With credentials, the script logs in, creates or reuses a smoke attempt, completes it, and reads back the expected total score under the signed-in user's RLS scope. To create a new public test account, add `MVP_SMOKE_CREATE=1`; repeated signup runs can hit Supabase email rate limits.

To verify two-user RLS isolation without creating persistent test data, run `backend/ingestion/mvp_rls_smoke.sql` through the Supabase SQL Editor or MCP after the MVP SQL has been applied. The expected result is:

```text
user_a_completed_visible = true
user_b_visible_attempts = 0
user_b_updated_attempts = 0
```

## Managing Translations

All translations are stored in JSON files in the `messages/` directory:

- `messages/en.json` - English translations
- `messages/zh.json` - Chinese translations

### Adding New Translations

1. Open the relevant language file (`en.json` or `zh.json`)
2. Add your new translation key and value
3. Use the translation in your component:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('yourSection');
  return <div>{t('yourKey')}</div>;
}
```

### Translation Structure

Translations are organized by section:

```json
{
  "common": {
    "appName": "Assessment Hub"
  },
  "home": {
    "title": "Welcome to Assessment Hub",
    "categories": {
      "work": {
        "title": "Work Assessment"
      }
    }
  }
}
```

## MVP Content Surfaces

The homepage uses the current `public/logo.jpeg` asset and routes visitors into the unified assessment directory. Category pages are explanation pages that link to filtered directory views:

- `/en/assessments?category=work`
- `/en/assessments?category=personal`
- `/en/assessments?category=kid`
- `/en/assessments?category=pet`

Demo scale prompts and user-owned records are defined in `backend/ingestion/mvp_scale_records.sql` and surfaced through `/[locale]/assessments`.

## Contact Submissions

The contact form posts to `/api/contact` and stores assessment inquiries in Supabase. Before using it in a Supabase-backed environment, run:

```bash
backend/ingestion/contact_submissions.sql
```

The `contact_submissions` table allows public inserts only. Public clients cannot read submitted rows; review messages in the Supabase Dashboard or with a privileged server-side/admin workflow.

## Building for Production

Create an optimized production build:

```bash
npm run build
```

Run the baseline tests:

```bash
npm test
```

Start the production server:

```bash
npm start
```

## Deploying to Vercel

### Method 1: Deploy via Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Follow the prompts to complete deployment

### Method 2: Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect Next.js and configure the build settings
6. Click "Deploy"

### Environment Variables

The frontend can run from bundled data without environment variables. To read from Supabase, configure:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

1. Create a `.env.local` file locally (not committed to git)
2. Add variables to Vercel via Project Settings > Environment Variables
3. For the MVP auth/record flow, enable Supabase Auth email/password and run `backend/ingestion/mvp_scale_records.sql`

## Project Structure

```
webdev_eqai/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Localized routes
│   │   │   ├── work/
│   │   │   ├── personal/
│   │   │   ├── kid/
│   │   │   ├── pet/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── lib/
│   │   └── assessmentDirectory.ts # Directory data service and fallbacks
│   ├── components/
│   │   ├── AssessmentCard.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── Navigation.tsx
│   ├── i18n/
│   │   └── request.ts          # i18n configuration
│   └── middleware.ts            # Locale detection/routing
├── messages/
│   ├── en.json                  # English translations
│   └── zh.json                  # Chinese translations
├── public/                      # Static assets
├── tests/                       # Frontend baseline tests
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Internationalization**: next-intl
- **Deployment**: Vercel (recommended)

## Browser Support

This application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### 404 Error on Vercel After Deployment

If you see a 404 error after deploying to Vercel:

1. **Clear Vercel Cache**: Go to your project settings on Vercel and redeploy
2. **Check Build Logs**: Ensure the build completed successfully
3. **Verify Routes**: The root `/` should redirect to `/en` automatically
4. **Test Locally First**: Run `npm run build && npm start` to verify production build works locally

### npm Deprecation Warnings

The deprecation warnings during installation are from dependencies and don't affect functionality:
- These are warnings, not errors
- They come from Next.js dependencies
- Your application will work perfectly fine
- Future versions of Next.js will update these dependencies

### Local Development Issues

If `npm run dev` fails:
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Try `npm run dev` again

## License

MIT
