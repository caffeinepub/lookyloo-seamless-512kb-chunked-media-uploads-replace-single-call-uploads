# Specification

## Summary
**Goal:** Refresh logged-out landing page branding and layout with a hero video, updated header/footer visuals, and a wired favicon.

**Planned changes:**
- Update `frontend/src/components/Landing.tsx` to replace the current camera icon/copy with a centered hero section containing: a large circular video element playing `LookyLoo-gif.mp4`, the title text `LookyLoo`, the subtitle text `A Li'l Media Share on ICP`, and three uniform hero cards with the provided exact marketing copy.
- Update the Landing Card C to display `GeekGoat-e8cRlk9m.png` in a circle, centered above the Card C text.
- Update `frontend/src/components/Header.tsx` to remove references to `/assets/LookyLoo-Logo.png` and render `lookyloo-logo.png` centered in the header in a circular frame without layout shift.
- Update the footer in `frontend/src/App.tsx` to replace the existing content with two centered rows: (1) `2026 LookyLoo. A GeekDice dApp built with caffeine.ai` and (2) a single line containing (in order) circular `GeekGoat-e8cRlk9m.png`, the text `Follow me on`, and the `X Logo Transparent.png` icon.
- Install and reference the provided `favicon.ico` in the HTML entry point so it appears in the browser tab.

**User-visible outcome:** When logged out, users see a refreshed landing page with a circular hero video, updated title/subtitle, three consistent marketing cards (including a GeekGoat badge on Card C), an updated centered circular header logo, a two-line footer with GeekGoat + X icon, and the app favicon visible in the browser tab.
