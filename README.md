# Assessment Hub

A modern, professional assessment platform built with Next.js 14 and TailwindCSS. Features full internationalization support for English and Chinese.

## Features

- Clean, minimal design inspired by Google's design principles
- Full internationalization (English/Chinese)
- Responsive design for desktop and mobile
- Four assessment categories: Work, Personal, Kid, and Pet
- Built with Next.js 14 App Router
- TypeScript for type safety
- TailwindCSS for styling

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

- `/en` - English homepage
- `/zh` - Chinese homepage
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

## License

MIT
