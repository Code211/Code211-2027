---
name: Netlify data adapter
description: Production deployment uses a serverless Supabase REST adapter while the Replit preview uses the shared PostgreSQL API.
---

The app intentionally has two runtime data paths: the Replit preview uses the shared Express API and PostgreSQL, while the Netlify static deployment uses `netlify/functions/api.ts` and Supabase REST. Both paths translate the same registration, announcement, schedule, and dashboard shapes, so the frontend stays provider-agnostic.

**Why:** Netlify serves the frontend statically and cannot run the workspace Express server as-is, while the preview environment already provides a managed API and database.

**How to apply:** Keep changes to these public API shapes synchronized across the Express routes and Netlify function, and keep all Supabase service-role access inside the serverless function.