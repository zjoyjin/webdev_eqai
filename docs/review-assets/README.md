# EQAI MVP Review Assets

Captured from the local production build on June 7, 2026.

## Captured Screenshots

- `screenshots/desktop-en-review.png` - English review pack route at `/en/review`.
- `screenshots/desktop-en-assessments.png` - English demo catalog route at `/en/assessments`.
- `screenshots/desktop-en-contact.png` - English contact intake route at `/en/contact`.

## Verification Notes

- The local production build generated `/en/review` and `/zh/review`.
- The floating assessment guide now starts collapsed, so it does not cover review content by default.
- The desktop review, catalog, and contact screenshots were visually inspected and are nonblank.
- `npm test`, `npm run lint`, and `npm run build` were run after the source changes.

## Remaining Review Assets

- Homepage screenshots still need a reliable capture pass. Chrome headless shortcut and CDP attempts produced blank homepage captures even though the server-rendered HTML contains the expected content.
- Mobile screenshots should be recaptured with a stable browser surface before using them in an external package.
- A short walkthrough recording is still pending.
