# Specification

## Summary
**Goal:** Replace the broken/missing `.ico` favicon setup with a stable 64×64 PNG favicon derived from the LookyLoo logo.

**Planned changes:**
- Add the generated `favicon-64.png` to frontend static assets (preferably under `frontend/public/assets/generated/`) so it is served at a stable URL.
- Update `frontend/index.html` to reference the PNG favicon via a `<link rel="icon" type="image/png">` tag instead of `/favicon.ico`.
- Verify favicon rendering works in both local dev and production build outputs without relying on a `.ico` upload.

**User-visible outcome:** The browser tab displays the LookyLoo-derived PNG favicon consistently in dev and production.
