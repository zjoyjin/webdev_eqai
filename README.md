# EQAIGlobal Website and Assessment Platform

EQAIGlobal is a bilingual English/Chinese web platform for emotional intelligence and AI-supported assessment discovery. The current application combines a public marketing site, four assessment entry pages, an assessment guide chat interface, a JSON-backed assessment API, and a Python/Supabase ingestion pipeline for future RAG-powered assessment search.

This README is intentionally detailed. It is meant to help product reviewers, developers, and future maintainers understand what each file does, what decisions are still open, and what "ready to launch" should mean for this project.

## Current Product State

The site currently supports:

- English and Chinese locale routes through `next-intl`.
- A homepage with hero content, mission content, feature cards, four assessment cards, and an inline assessment guide chat.
- Four category-style assessment pages: Work, Personal, Kid, and Pet.
- A contact page with a placeholder client-side form.
- An assessment API endpoint that serves `dataset/assessment_data.json`.
- A chat component that reads the assessment API and helps users browse or search assessment groups.
- Backend ingestion code that can load Excel/CSV assessment source data, normalize it, generate embeddings, and upsert records to Supabase.

The product direction is moving from a simple landing page toward an assessment directory platform.

## Recommended Product Direction

### Formal Page Adoption

Recommendation: **use one unified assessment directory page, with existing category entry points leading into the same directory filtering experience.**

Recommended canonical routes:

```text
/[locale]/assessments
/[locale]/assessments?category=work
/[locale]/assessments?category=personal
/[locale]/assessments?category=kid
/[locale]/assessments?category=pet
```

The current routes `/[locale]/work`, `/[locale]/personal`, `/[locale]/kid`, and `/[locale]/pet` should not become four separate directory systems yet. They should become category explanation pages that introduce the use case and then send users into the unified assessment directory with the correct filter applied.

Why:

- One directory keeps search, filtering, card data, loading states, and future API integration in one place.
- The current assessment data already behaves like a shared catalog, not four separate products.
- Reviewers get one clear place to evaluate the product experience.
- The four category pages can still provide tailored narrative and audience framing.

### Four Assessment Pages

The product role of Work, Personal, Kid, and Pet is not fully confirmed. Recommended role for the next launch:

| Page | Current State | Recommended Role Now | Future Role |
| --- | --- | --- | --- |
| Work | Placeholder page | Category explanation page plus filtered directory entry | Workplace assessment landing page or enterprise lead path |
| Personal | Placeholder page | Category explanation page plus filtered directory entry | Personal assessment start page |
| Kid | Placeholder page | Category explanation page plus filtered directory entry | Parent/school-facing child development assessment entry |
| Pet | Placeholder page | Category explanation page plus filtered directory entry | Pet wellness assessment entry |

Recommended CTA targets:

```text
Work     -> /[locale]/assessments?category=work
Personal -> /[locale]/assessments?category=personal
Kid      -> /[locale]/assessments?category=kid
Pet      -> /[locale]/assessments?category=pet
```

### Launch Standard

"Ready to launch" should be split into three levels.

#### Minimum Launch

The public site is minimally launchable when:

- `/en` and `/zh` load successfully.
- Homepage content is real and does not show placeholder image text in production.
- Work, Personal, Kid, and Pet pages either contain useful explanation content or are removed from primary navigation.
- Assessment discovery works through cards, chat, or a directory page.
- Contact form has a real submission destination or clearly avoids collecting data.
- Mobile layout works.
- Keyboard navigation and focus states work.
- Basic SEO metadata is in place.

#### Product Launch

The product is launchable when:

- A full user path works from homepage to assessment discovery to contact or assessment start.
- Assessment data shown to users is real, reviewed, and understandable.
- Contact submissions are stored or delivered reliably.
- Privacy/data handling text matches the information collected.
- English and Chinese content are both reviewed.

#### Review Launch

The project is ready for external review when:

- Reviewers have a stable URL or preview deployment.
- There is an accessible review page or review note explaining the intended flow.
- Screenshots or a short screen recording are available.
- Open product decisions are listed clearly.

### Contact Form Content

Recommendation: **the contact form should collect assessment demand and qualified leads, not only general inquiries.**

The current `ContactForm` has name, email, subject, and message fields, with placeholder submission behavior. For the assessment directory platform, it should evolve to include:

- Name
- Email
- Organization, optional
- Role, optional
- Inquiry type: general inquiry, assessment interest, partnership, enterprise/school inquiry
- Interested category: Work, Personal, Kid, Pet, General
- Audience type: individual, enterprise, school, parent, partner, other
- Message
- Consent checkbox for follow-up

Recommended form purpose:

```text
Collect early demand, partnership leads, assessment interest, and reviewer feedback.
```

### How Form Submissions Are Viewed

Recommendation: **Supabase first, email notification second, future admin page later.**

Best phased approach:

1. Store submissions in a Supabase table such as `contact_submissions`.
2. Send an email notification after storage succeeds.
3. Build an admin page only after the review workflow and submission volume are clear.
4. Use a WPS multidimensional sheet only if the team needs a manual operations view.

Suggested `contact_submissions` fields:

```text
id
created_at
name
email
organization
role
inquiry_type
interested_category
audience_type
message
locale
source_path
status
notes
```

### Whether Donate Is Still Needed

Recommendation: **defer Donate for the current launch unless there is a confirmed donation strategy.**

The current product focus is assessment discovery. Donate can confuse the user journey if the primary goal is to explore assessments, request information, join a pilot, or contact the team.

Keep Donate only if:

- EQAIGlobal has a clear public-benefit or nonprofit explanation.
- Payment processing and compliance are ready.
- The donation use case is transparent.

Otherwise:

- Remove Donate from primary navigation.
- Keep it out of the launch-critical path.
- Revisit it after assessment directory positioning is stable.

### Product Review Material Format

Recommendation: **use an accessible review page plus screenshots and a short recording.**

Best review package:

- A review route such as `/[locale]/review`.
- Screenshot set covering homepage, category entry, assessment discovery, chat, and contact.
- 2-4 minute screen recording showing the intended user path.

The review page should include:

- Product summary.
- Target audiences.
- Current launch level.
- Links to key pages.
- Known open decisions.
- Questions for reviewers.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- next-intl
- Python backend ingestion tools
- Supabase for future knowledge base and vector search
- OpenAI embeddings for backend ingestion
- Vercel deployment target

## Quick Start

Install frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/en
http://localhost:3000/zh
```

Build for production:

```bash
npm run build
```

Start production build:

```bash
npm start
```

Run lint:

```bash
npm run lint
```

## Routes

### Frontend Routes

| Route | Purpose | Launch Notes |
| --- | --- | --- |
| `/` | Redirects or routes users into a locale experience | Confirm behavior before deploy |
| `/en` | English homepage | Main public entry |
| `/zh` | Chinese homepage | Main Chinese entry |
| `/en/about`, `/zh/about` | About page | Mission, vision, values |
| `/en/contact`, `/zh/contact` | Contact page | Form currently needs real submission handling |
| `/en/work`, `/zh/work` | Work assessment page | Currently placeholder |
| `/en/personal`, `/zh/personal` | Personal assessment page | Currently placeholder |
| `/en/kid`, `/zh/kid` | Kid assessment page | Currently placeholder |
| `/en/pet`, `/zh/pet` | Pet assessment page | Currently placeholder |

### API Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/api/assessments` | `src/app/api/assessments/route.ts` | Returns `dataset/assessment_data.json` as JSON |

Recommended new route:

| Route | Purpose |
| --- | --- |
| `/[locale]/assessments` | Unified assessment directory with category filters |
| `/api/contact` | Contact form submission endpoint |

## File and Function Guide

### Root Documentation

#### `README.md`

This file. It explains product direction, architecture, routes, files, launch standards, and open decisions.

#### `FEATURES.md`

Describes the current visible site features, pages, design direction, and suggested next steps. Use it as a feature inventory, but keep this README as the source of product launch decisions.

#### `UPDATES.md`

Historical update summary for changes made to the site, including page additions and content changes.

#### `QUICKSTART.md`

Short setup guide for local development.

#### `VERCEL_DEPLOYMENT.md`

Deployment instructions for Vercel.

#### `DEPLOYMENT_CHECKLIST.md`

Checklist for pre-deployment verification.

### Frontend App Files

#### `src/app/layout.tsx`

Global root layout. Defines top-level metadata and wraps all routes.

Important responsibilities:

- Global HTML shell.
- Site metadata.
- Shared app-level structure.

Launch notes:

- Make sure metadata matches EQAIGlobal positioning.
- Confirm the description does not overclaim medical, psychological, or diagnostic capabilities.

#### `src/app/globals.css`

Global stylesheet and Tailwind base styles.

Important responsibilities:

- Global typography.
- Base colors and layout behavior.
- Focus and responsive behavior.

Launch notes:

- Check color contrast.
- Ensure translated text does not overflow on mobile.

#### `src/middleware.ts`

Locale routing middleware.

Important responsibilities:

- Handles locale detection/routing.
- Supports English and Chinese URL structure.

Launch notes:

- Test `/`, `/en`, `/zh`, and deep links directly.

#### `src/app/[locale]/layout.tsx`

Localized route layout.

Important responsibilities:

- Calls locale setup for `next-intl`.
- Wraps localized pages.
- Provides consistent page shell for `/en/*` and `/zh/*`.

Launch notes:

- All public pages must work in both locales.

#### `src/app/[locale]/page.tsx`

Localized homepage.

Important responsibilities:

- Renders `HeroSection`.
- Shows mission content.
- Renders feature cards.
- Renders four `AssessmentCard` entries.
- Renders inline `ChatBox`.
- Renders `Footer`.

Current behavior:

- Category cards link to `/work`, `/personal`, `/kid`, and `/pet`.
- Some visual sections still contain image placeholder text.

Recommended changes:

- Replace placeholder image sections with real product imagery or remove them.
- Decide whether cards go to category explanation pages or directly to `/assessments?category=...`.
- Move hardcoded English labels into `messages/en.json` and `messages/zh.json`.

#### `src/app/[locale]/about/page.tsx`

Localized About page.

Important responsibilities:

- Explains mission, vision, values, and approach.

Launch notes:

- Should align with the assessment platform direction.
- Should avoid claims that require clinical validation unless that evidence is ready.

#### `src/app/[locale]/contact/page.tsx`

Localized Contact page.

Important responsibilities:

- Renders intro content.
- Renders `ContactForm`.
- Provides contact/support context.

Current behavior:

- Form is visible, but submission is placeholder-only.

Recommended changes:

- Add real submission handling through `/api/contact` or a server action.
- Include inquiry type and interested assessment category.
- Store submissions in Supabase.

#### `src/app/[locale]/work/page.tsx`

Current Work assessment page.

Current behavior:

- Displays a translated title.
- Displays a translated placeholder.

Recommended role:

- Become a Work category explanation page.
- Link to `/[locale]/assessments?category=work`.

Content should cover:

- Workplace emotional intelligence.
- Communication.
- Leadership.
- Stress and conflict.
- Team behavior.
- Enterprise or professional use cases.

#### `src/app/[locale]/personal/page.tsx`

Current Personal assessment page.

Current behavior:

- Displays a translated title.
- Displays a translated placeholder.

Recommended role:

- Become a Personal category explanation page.
- Link to `/[locale]/assessments?category=personal`.

Content should cover:

- Self-awareness.
- Emotional regulation.
- Motivation.
- Relationships.
- Personal growth.

#### `src/app/[locale]/kid/page.tsx`

Current Kid assessment page.

Current behavior:

- Displays a translated title.
- Displays a translated placeholder.

Recommended role:

- Become a parent/school-oriented category explanation page.
- Link to `/[locale]/assessments?category=kid`.

Important caution:

- Do not make diagnostic or medical claims.
- Review privacy, consent, and child-related data handling before collecting child information.

#### `src/app/[locale]/pet/page.tsx`

Current Pet assessment page.

Current behavior:

- Displays a translated title.
- Displays a translated placeholder.

Recommended role:

- Become a pet emotional wellness category explanation page.
- Link to `/[locale]/assessments?category=pet`.

Important caution:

- Do not imply veterinary diagnosis.
- Frame guidance around observation, routines, environment, and care.

#### `src/app/api/assessments/route.ts`

Assessment API endpoint.

Current code:

```ts
import { NextResponse } from 'next/server';
import data from '../../../../dataset/assessment_data.json';

export async function GET() {
  return NextResponse.json(data);
}
```

Current behavior:

- Serves the static assessment dataset to the frontend.
- Used by `ChatBox`.

Recommended changes:

- Add response typing.
- Add basic caching headers if the dataset is stable.
- Consider replacing static JSON with a database query after the directory matures.

### Frontend Components

#### `src/components/Navigation.tsx`

Main sticky navigation.

Current behavior:

- Shows Home, About, Contact.
- Includes `LanguageToggle`.
- Includes mobile hamburger menu.

Product notes:

- Donate is not currently in this navigation, which matches the recommendation to defer Donate.
- Add Assessments once `/[locale]/assessments` exists.

Recommended navigation:

```text
Home
Assessments
About
Contact
```

Optional later:

```text
Work
Personal
Kid
Pet
```

#### `src/components/LanguageToggle.tsx`

Language switcher.

Important responsibilities:

- Allows switching between English and Chinese.
- Preserves or changes route locale.

Launch notes:

- Test from homepage and deep routes.
- Confirm it does not break query filters on future assessment directory pages.

#### `src/components/HeroSection.tsx`

Homepage hero section.

Important responsibilities:

- Introduces EQAIGlobal.
- Links users toward assessment discovery.

Launch notes:

- Ensure hero copy explains the product in plain language.
- CTA should lead to either `#assessments` or the unified assessment directory.

#### `src/components/FeatureCard.tsx`

Reusable feature card.

Current role:

- Displays feature explanations on homepage.

Launch notes:

- Keep feature copy aligned with what the product can actually do today.

#### `src/components/AssessmentCard.tsx`

Reusable card for Work, Personal, Kid, and Pet entry points.

Current behavior:

- Accepts `title`, `description`, `href`, and color.
- Prefixes `href` with the active locale.
- Renders an icon and "Start Assessment" label.

Recommended changes:

- Rename CTA if the target page is not a real assessment start.
- Use labels such as “Explore Assessments” or “View Category” until full assessment flows exist.
- Support future links to `/assessments?category=...`.

#### `src/components/ChatBox.tsx`

Assessment guide chat component.

Current behavior:

- Fetches `/api/assessments`.
- Loads `original`, `adopted`, and `all_groups` assessment groups.
- Offers guided browsing by module and group.
- Supports keyword matching for topics such as anxiety, mood, sleep, school, attention, emotion regulation, social stress, parenting, intelligence, academics, and opposition.
- Can render as inline or floating UI.

Important internal structures:

- `Message`: chat message model.
- `Option`: selectable chat option.
- `AssessmentGroup`: assessment group data model.
- `AssessmentData`: response shape from `assessment_data.json`.
- `KEYWORD_MAP`: maps natural language queries to assessment codes.
- `findByKeywords`: returns assessment matches from user text.

Launch notes:

- Some chat strings are hardcoded in English and should be localized.
- The chat currently behaves as discovery support, not clinical guidance.
- Add disclaimers if sensitive wellbeing or child-related topics remain in keyword matching.

#### `src/components/ContactForm.tsx`

Contact form component.

Current behavior:

- Client component.
- Uses `contact.form` translations.
- Fields: name, email, subject, message.
- `handleSubmit` prevents default and shows a placeholder alert.

Recommended changes:

- Replace alert with real submission.
- Add inquiry type, category interest, audience type, and consent.
- Add loading, success, and error states.
- Send to `/api/contact` or a server action.

#### `src/components/Footer.tsx`

Footer navigation and secondary links.

Current role:

- Provides footer links and assessment links.

Launch notes:

- Ensure footer links match real routes.
- Add Privacy and Terms before collecting form submissions.

### Internationalization

#### `messages/en.json`

English translation file.

Current role:

- Stores navigation, homepage, features, donate, contact, and assessment copy.

Recommended changes:

- Add assessment directory labels.
- Add contact form inquiry/category fields.
- Move hardcoded homepage/chat strings into translations.

#### `messages/zh.json`

Chinese translation file.

Current role:

- Chinese equivalent of the English messages.

Recommended changes:

- Review for natural Chinese product language, not only literal translation.
- Add all new assessment directory and contact fields.

#### `src/i18n/request.ts`

`next-intl` request configuration.

Important responsibilities:

- Loads locale messages.
- Supports server-side i18n behavior.

Launch notes:

- Make sure missing translation keys fail visibly during development.

### Configuration

#### `next.config.mjs`

Next.js configuration.

Important responsibilities:

- Framework configuration.
- Internationalization/plugin integration if configured there.

#### `tailwind.config.ts`

Tailwind theme configuration.

Important responsibilities:

- Theme colors.
- Responsive design tokens.
- Custom color families used by cards and sections.

Launch notes:

- Check color contrast for primary, teal, lavender, and rose variants.

#### `tsconfig.json`

TypeScript configuration.

Important responsibilities:

- TypeScript compiler settings.
- Path aliases such as `@/components`.

#### `package.json`

Frontend scripts and dependencies.

Available scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Dependencies:

- `next`
- `next-intl`
- `react`
- `react-dom`

Dev dependencies:

- TypeScript
- Tailwind CSS
- ESLint
- PostCSS
- React/Node types

### Dataset Files

#### `dataset/assessment_data.json`

Frontend-consumable assessment data.

Current role:

- Served by `/api/assessments`.
- Read by `ChatBox`.

Expected shape:

```text
original
adopted
all_groups
```

Launch notes:

- This is currently the most important product data source for assessment discovery.
- Keep it reviewed and synchronized with source spreadsheets.

#### `dataset/测评总览 (ZF Feb 25 2026).xlsx`

Excel source dataset.

Current role:

- Source assessment/measurement data.

#### `dataset/测评总览 (ZF Feb 25 2026).csv`

CSV source dataset.

Current role:

- CSV version of the assessment source data.
- Useful for ingestion and debugging.

#### `dataset/测评总览 (ZF Feb 25 2026) (1).xlsx`

Additional Excel copy.

Recommended action:

- Confirm whether this duplicate is needed.
- Keep only clearly named source versions before launch.

### Backend and Ingestion

The backend code is not a running web API yet. It is a data ingestion and retrieval foundation for a Supabase-backed RAG knowledge system.

#### `backend/requirements.txt`

Python dependencies for ingestion and Supabase/RAG work.

Important packages include:

- Supabase client
- pandas/openpyxl for dataset loading
- OpenAI for embeddings
- Pydantic settings

#### `backend/app/config.py`

Central backend configuration.

Important settings:

- `supabase_url`
- `supabase_service_key`
- `openai_api_key`
- `embedding_model`
- `embedding_dimensions`
- `anthropic_api_key`
- `chat_model`
- retrieval and ingestion parameters

Launch notes:

- Service keys must never be exposed to the frontend.
- Backend `.env` should not be committed.

#### `backend/app/db/supabase_client.py`

Supabase client singleton.

Important responsibilities:

- Creates a Supabase client using backend service credentials.
- Reuses the client for ingestion and retrieval.

#### `backend/app/db/queries.py`

Database query layer.

Important functions:

- `upsert_knowledge_entry`: writes normalized assessment records to `knowledge_entries`.
- `upsert_embedding`: writes language-specific embeddings to `entry_embeddings`.
- `log_ingestion_run`: records ingestion audit information.
- `vector_search`: calls Supabase RPC function `match_knowledge_entries`.
- `get_entry_by_id`: fetches one knowledge entry.

Launch notes:

- All database access should stay centralized here.
- Supabase RPC functions must exist before vector search works.

#### `backend/ingestion/pipeline.py`

Main ingestion orchestrator.

Flow:

1. Load Excel or CSV dataset.
2. Normalize rows into `KnowledgeRecord` objects.
3. Upsert knowledge entries to Supabase.
4. Build English and Chinese embedding inputs.
5. Generate embeddings with OpenAI.
6. Upsert embeddings to Supabase.
7. Log ingestion run.

Run pattern:

```bash
cd backend
python -m ingestion.pipeline --file ../dataset/测评总览\ \(ZF\ Feb\ 25\ 2026\).csv
```

#### `backend/ingestion/loaders/dataset_loader.py`

Dataset loader.

Important functions:

- `load_dataset`: reads `.xlsx`, `.xls`, or `.csv`.
- `_validate_required_columns`: verifies required dataset columns.
- `_coerce_types`: converts booleans, integers, and text fields.

Important behavior:

- Skips the first 7 header rows.
- Renames source columns to internal snake_case names.
- Forward-fills item definitions within measure groups.
- Filters to `scheduled == True`.

#### `backend/ingestion/transformers/normalizer.py`

Transforms raw dataset rows into validated records.

Important structures/functions:

- `KnowledgeRecord`: dataclass for one measurement dimension row.
- `normalize_row`: converts one DataFrame row.
- `normalize_dataframe`: converts all rows and collects failures.
- `_build_embedding_text_en`: builds English embedding text.
- `_build_embedding_text_zh`: builds Chinese embedding text.

Launch notes:

- This is the core bridge from spreadsheet data into searchable knowledge data.

#### `backend/ingestion/embedder_batch.py`

Embedding generation.

Expected role:

- Batch embedding input text.
- Call the configured embedding model.
- Return vectors for database storage.

#### `backend/ingestion/schema.sql`

Supabase schema.

Current role:

- Defines database tables for knowledge entries, embeddings, ingestion logs, and related structures.

Launch notes:

- Run this before ingestion.
- Review row-level security policies before exposing any frontend read/write features.

#### `backend/ingestion/supabase_functions.sql`

Supabase SQL functions for vector search.

Current role:

- Defines RPC functions such as `match_knowledge_entries`.

Launch notes:

- Required for `vector_search`.
- Should be applied after `schema.sql`.

#### `backend/tests/test_ingestion.py`

Backend ingestion tests.

Recommended use:

```bash
cd backend
pytest
```

## Environment Variables

### Frontend

The current frontend does not require environment variables for the base site.

Future frontend variables may include:

```env
NEXT_PUBLIC_SITE_URL=https://eqaiglobal.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend

Backend ingestion requires a `.env` file in the backend working context or environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
CHAT_MODEL=claude-3-5-haiku-20241022
```

Do not commit real secrets.

## Recommended New Files

To complete the assessment directory platform:

```text
src/app/[locale]/assessments/page.tsx
src/app/api/contact/route.ts
src/components/AssessmentDirectory.tsx
src/components/AssessmentFilters.tsx
src/components/AssessmentDirectoryCard.tsx
src/lib/assessments.ts
src/lib/contact.ts
src/types/assessment.ts
src/types/contact.ts
```

Recommended future review route:

```text
src/app/[locale]/review/page.tsx
```

## Recommended User Flow

Current flow:

```text
Homepage
  -> Assessment cards
  -> Work / Personal / Kid / Pet placeholder pages

Homepage
  -> Inline chat guide
  -> /api/assessments
  -> Assessment group recommendations

Homepage / Navigation
  -> Contact page
  -> Placeholder form alert
```

Recommended launch flow:

```text
Homepage
  -> Assessment category card
  -> Category explanation page
  -> Unified assessment directory filtered by category
  -> Assessment detail, contact, or future assessment start
```

Recommended review flow:

```text
Review page
  -> Homepage
  -> Assessment directory
  -> Chat guide
  -> Contact form
```

## Implementation Priorities

### Priority 1: Make Assessment Discovery Real

- Add `/[locale]/assessments`.
- Render cards from `dataset/assessment_data.json` or a typed helper.
- Add filters for Work, Personal, Kid, Pet, and All.
- Connect category pages to filtered directory views.

### Priority 2: Replace Placeholder Pages

- Replace Work, Personal, Kid, and Pet placeholder boxes with meaningful explanation content.
- Rename CTAs to "Explore Assessments" unless a real assessment flow exists.
- Remove visible placeholder image text from homepage before production launch.

### Priority 3: Make Contact Useful

- Add real submission handling.
- Store submissions in Supabase.
- Add inquiry type and category interest.
- Add privacy/consent language.

### Priority 4: Prepare Review Materials

- Add `/[locale]/review` or a review note.
- Capture screenshots.
- Record a short walkthrough.
- List known limitations.

## Launch Checklist

### Product Decisions

- [ ] Confirm one unified assessment directory.
- [ ] Confirm Work, Personal, Kid, and Pet as category explanation pages.
- [ ] Decide whether Donate remains deferred.
- [ ] Confirm contact form purpose.
- [ ] Confirm submission destination.
- [ ] Confirm review material format.

### Frontend

- [ ] `/en` and `/zh` load.
- [ ] Homepage has no production-visible placeholder text.
- [ ] Category pages contain real copy.
- [ ] Unified assessment directory exists.
- [ ] Category filters work.
- [ ] Chat guide loads assessment data.
- [ ] Contact form has real submission behavior.
- [ ] Mobile navigation works.
- [ ] Language switch works on all routes.

### Backend/Data

- [ ] Dataset source versions are cleaned up.
- [ ] `assessment_data.json` is reviewed.
- [ ] Supabase schema is applied if backend ingestion is used.
- [ ] Ingestion pipeline runs successfully.
- [ ] Embeddings are generated and stored.
- [ ] Vector search RPC works.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Form labels and errors are accessible.
- [ ] Motion does not block usability.
- [ ] English and Chinese text fit on mobile.
- [ ] Color contrast is acceptable.

### Review

- [ ] Review page or note exists.
- [ ] Screenshot set exists.
- [ ] Screen recording exists.
- [ ] Open product questions are documented.

## GitHub Profile Summary

For the public GitHub profile, this project can be summarized as:

```md
I'm building EQAIGlobal, a bilingual Emotional Intelligence x Artificial Intelligence assessment platform.

Current focus:
- Next.js and TypeScript product architecture
- English/Chinese internationalized web experiences
- Assessment discovery and directory design
- AI-assisted assessment search
- Supabase-backed knowledge ingestion and retrieval
- Human-centered, accessible product design
```

## Final Recommended Answers

| Question | Recommended Answer |
| --- | --- |
| Formal page adoption | Use one unified assessment directory page |
| Existing category entry points | Keep them, but make them lead into filtered directory views |
| Four assessment pages | Treat as category explanation pages now, future assessment-start pages later |
| Launch standard | Use Minimum Launch, Product Launch, and Review Launch |
| Contact form content | Use for assessment demand collection, qualified leads, and general inquiries |
| How submissions are viewed | Supabase first, email notification second, admin page later |
| Donate | Defer or remove from current launch scope |
| Review material format | Accessible review page plus screenshots and short screen recording |

## Repository

GitHub remote:

```text
https://github.com/zjoyjin/webdev_eqai.git
```

Primary app directory:

```text
webdev_eqai
```
