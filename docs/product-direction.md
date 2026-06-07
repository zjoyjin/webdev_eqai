# Product Direction Notes

Source: extracted from upstream commit `4f75ce7 docs: expand EQAIGlobal README`.

This document keeps product planning material out of the root README. Treat these notes as direction and review material, not as a complete statement of current implementation. The local working tree already has newer assessment API and Supabase-related work than the upstream README described.

## What Upstream Added

The upstream README expansion added:

- A fuller description of the project as a bilingual EQ/AI assessment discovery platform.
- A recommended product direction centered on one unified assessment directory.
- Suggested roles for the existing Work, Personal, Kid, and Pet pages.
- Three launch-readiness levels: minimum launch, product launch, and review launch.
- Contact form recommendations for qualified assessment demand and lead collection.
- A suggested Supabase-first flow for viewing contact submissions.
- A recommendation to defer Donate unless the donation strategy is confirmed.
- A review package proposal: review page, screenshots, and a short recording.
- A route inventory and file/function guide.
- Environment variable notes for frontend/backend work.
- Recommended new files for assessment directory, contact handling, and review routes.
- Implementation priorities and a launch checklist.
- A short GitHub profile summary.

## Potentially New Decisions

These are the items most likely to matter strategically:

- Use one canonical directory route: `/[locale]/assessments`.
- Let category entry points link into filtered directory views:
  - `/[locale]/assessments?category=work`
  - `/[locale]/assessments?category=personal`
  - `/[locale]/assessments?category=kid`
  - `/[locale]/assessments?category=pet`
- Keep `/[locale]/work`, `/[locale]/personal`, `/[locale]/kid`, and `/[locale]/pet` as category explanation pages for now, not four separate directory systems.
- Rename CTAs away from "Start Assessment" until there is a real assessment-start workflow. Safer labels include "Explore Assessments" or "View Category".
- Use the contact form to collect assessment interest, qualified leads, partnership interest, and review feedback.
- Store contact submissions in Supabase first, add email notifications second, and postpone an admin page until the workflow is clearer.
- Defer Donate unless payment, compliance, and public-benefit positioning are ready.
- Prepare external review material through a review route plus screenshots and a short walkthrough recording.

## Cautions Worth Keeping

- Kid-related experiences should avoid diagnostic or medical claims and should account for privacy, consent, and child data handling.
- Pet-related experiences should avoid implying veterinary diagnosis.
- Assessment discovery and chat should be framed as guidance/discovery, not clinical advice.
- Public copy should avoid overclaiming medical, psychological, or diagnostic capabilities.
- Privacy and terms should exist before collecting form submissions.
- Placeholder image/text should not be visible in production.
- English and Chinese content both need review, including mobile text fit.

## Items Already Partly Addressed Locally

The upstream README described `/api/assessments` as a static JSON endpoint. The local working tree is ahead of that in several ways:

- `/api/assessments` is documented locally as legacy-compatible full catalog output.
- Additional structured endpoints exist or are being added:
  - `/api/assessments/modules`
  - `/api/assessments/groups`
  - `/api/assessments/measures`
- The local README says the API can read Supabase structured directory tables when configured and fall back to `dataset/assessment_data.json`.
- `npm test` exists locally and runs Node test files under `tests/*.test.mjs`.

Because of that, the upstream README should not be merged as-is without reconciling these newer local facts.

## Recommended Implementation Priorities

1. Make assessment discovery real:
   - Add `/[locale]/assessments`.
   - Render directory cards from the assessment catalog.
   - Add filters for Work, Personal, Kid, Pet, and All.
   - Connect category pages to filtered directory views.

2. Replace placeholder category pages:
   - Add meaningful copy for Work, Personal, Kid, and Pet.
   - Link to filtered directory views.
   - Use non-overclaiming language.

3. Make contact useful:
   - Add real submission handling.
   - Store submissions in Supabase.
   - Add inquiry type, interested category, audience type, and consent.
   - Add loading, success, and error states.

4. Prepare review materials:
   - Add `/[locale]/review` or a static review note.
   - Capture screenshots.
   - Record a short walkthrough.
   - List known limitations and open product questions.

## Launch Checklist Extract

Product decisions:

- [ ] Confirm one unified assessment directory.
- [ ] Confirm category pages as explanation pages.
- [ ] Decide whether Donate remains deferred.
- [ ] Confirm contact form purpose.
- [ ] Confirm submission destination.
- [ ] Confirm review material format.

Frontend:

- [ ] `/en` and `/zh` load.
- [ ] Homepage has no production-visible placeholder text.
- [ ] Category pages contain real copy.
- [ ] Unified assessment directory exists.
- [ ] Category filters work.
- [ ] Chat guide loads assessment data.
- [ ] Contact form has real submission behavior.
- [ ] Mobile navigation works.
- [ ] Language switch works on all routes.

Backend/data:

- [ ] Dataset source versions are cleaned up.
- [ ] `assessment_data.json` is reviewed.
- [ ] Supabase schema is applied if backend ingestion is used.
- [ ] Ingestion pipeline runs successfully.
- [ ] Embeddings are generated and stored.
- [ ] Vector search RPC works.

Accessibility/review:

- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Form labels and errors are accessible.
- [ ] Motion does not block usability.
- [ ] English and Chinese text fit on mobile.
- [ ] Color contrast is acceptable.
- [ ] Review page or note exists.
- [ ] Screenshot set exists.
- [ ] Screen recording exists.
- [ ] Open product questions are documented.

## Bottom Line

The useful upstream material is product strategy, launch framing, and review/readiness guidance. The risky part is the large file/function guide because it can drift quickly and already misses some local Supabase/API work. Keep the strategic content here, and keep the root README focused on current setup, routes, and verified implementation facts.
