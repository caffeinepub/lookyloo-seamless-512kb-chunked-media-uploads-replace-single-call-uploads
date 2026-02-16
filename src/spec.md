# Specification

## Summary
**Goal:** Fix missing favicon behavior so browsers consistently load the app’s favicon instead of the default globe.

**Planned changes:**
- Add a valid `frontend/public/favicon.ico` so requests to `/favicon.ico` return HTTP 200.
- Update `frontend/index.html` favicon `<link>` declarations to reference only favicon assets that are actually deployed, including `/favicon.ico` (optionally as `rel="shortcut icon"`).
- Ensure cache-busted PNG favicon assets exist under `frontend/public/assets/generated/` with the filenames referenced by `frontend/index.html` (`favicon-v2-16/32/48/64...png`).

**User-visible outcome:** After a hard refresh, the browser tab shows the correct app favicon (no default globe), and direct visits to `/favicon.ico` and the PNG favicon URLs return the expected icons.
