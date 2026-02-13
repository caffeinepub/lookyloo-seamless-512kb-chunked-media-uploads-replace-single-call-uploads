# Specification

## Summary
**Goal:** Replace single-call media uploads with a seamless 512 KB chunked upload flow (frontend + Motoko backend) while keeping posts and viewing behavior the same, and apply a consistent LookyLoo theme with the provided logo in the header.

**Planned changes:**
- Implement a backend chunked-upload lifecycle in the single Motoko main actor: start upload, accept chunk N (512 KB max), finalize into a single stored media Blob, and abort/cleanup; enforce authentication/“user” role, per-caller upload ownership, chunk index/order validation, and resume-safe state tracking.
- Update the React upload flow (UploadButton → UploadComposer) to slice files into 512 KB chunks, upload sequentially (or controlled concurrency) with total progress, retry failed chunk uploads, and support cancel (calling abort).
- Remove/stop using the old UI path that uploads the full media Blob in a single update call.
- Ensure post APIs support lightweight feed pagination (summaries only) and fetching a single post with full media by ID; keep share-by-URL (?postId=) and delete behaviors working for finalized posts.
- Add a coherent, distinct visual theme (non blue/purple-dominant) across landing, header, feed, upload composer, and viewer; use the provided LookyLoo-Logo.png centered in the header as a static frontend asset.

**User-visible outcome:** Users can select an image/video and upload it as a normal single action with a single progress indicator; uploads are chunked invisibly in the background, can be retried or canceled, and completed posts appear in the feed and can be viewed/shared/deleted as before.
