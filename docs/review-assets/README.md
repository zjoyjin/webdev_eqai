# EQAI MVP Review Assets

Captured from the local production build on June 7, 2026.

## Captured Screenshots

- `screenshots/desktop-en-home.png` - English homepage route at `/en`.
- `screenshots/desktop-en-review.png` - English review pack route at `/en/review`.
- `screenshots/desktop-en-assessments.png` - English demo catalog route at `/en/assessments`.
- `screenshots/desktop-en-contact.png` - English contact intake route at `/en/contact`.
- `screenshots/mobile-zh-home.png` - Chinese homepage route at `/zh` in a 390px mobile viewport.
- `screenshots/mobile-zh-review.png` - Chinese review pack route at `/zh/review` in a 390px mobile viewport.

## Captured Recordings

- `recordings/mvp-walkthrough.webm` - Short walkthrough covering review, demo catalog, contact, and return-to-review routes.

## Verification Notes

- The local production build generated `/en/review` and `/zh/review`.
- The floating assessment guide now starts collapsed, so it does not cover review content by default.
- The desktop and mobile screenshots were captured with `agent-browser`, visually inspected, and are nonblank.
- The walkthrough recording was captured with `agent-browser` and verified as a nonzero `.webm` file.
- Supabase MCP read access was rechecked: `assessment_scales` has 6 total rows and 6 active rows.
- `npm test`, `npm run lint`, and `npm run build` were run after the source changes.

## Remaining Review Assets

- No required MVP review media is currently pending.
