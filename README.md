# EQAI - Emotional Intelligence Meets AI

A modern, professional landing page and assessment platform for EQAIGlobal. Built with Next.js 14 and TailwindCSS, featuring full internationalization support for English and Chinese.

## Features

- **Professional Landing Page**: Hero section, mission statement, and feature highlights
- **Clean, Google-inspired Design**: Minimal UI with excellent typography and spacing
- **Full Internationalization**: Complete English/Chinese support with next-intl
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Multiple Pages**:
  - Homepage with hero, features, and assessment cards
  - About Us page with mission, vision, and values
  - Donate page with impact information
  - Contact page with form (placeholder)
  - Four assessment pages: Work, Personal, Kid, and Pet
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
- `/en/donate` - Donate page (English)
- `/zh/donate` - Donate page (Chinese)
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

## Customizing the Hero Image

The homepage hero section currently has a placeholder for an image. To add your custom banner:

1. Place your image in the `public/` directory (e.g., `public/hero-banner.jpg`)
2. Open `src/components/HeroSection.tsx`
3. Uncomment the `<Image>` component at the bottom of the file
4. Update the `src` prop to match your image filename

Example:
```tsx
<Image
  src="/hero-banner.jpg"
  alt={t('imageAlt')}
  fill
  className="object-cover"
  priority
/>
```

## Adding Assessment Questions

Assessment questions can be added to the placeholder sections in:

- `src/app/[locale]/work/page.tsx`
- `src/app/[locale]/personal/page.tsx`
- `src/app/[locale]/kid/page.tsx`
- `src/app/[locale]/pet/page.tsx`

Replace the placeholder `<div>` with your assessment logic and components.

## Building for Production

Create an optimized production build:

```bash
npm run build
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

No environment variables are required for the base application. If you add any in the future:

1. Create a `.env.local` file locally (not committed to git)
2. Add variables to Vercel via Project Settings > Environment Variables

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
