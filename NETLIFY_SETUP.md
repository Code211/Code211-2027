# Netlify setup

The site is configured to build from the repository root with:

```bash
pnpm --filter @workspace/code211 run build
```

## Production data

The Replit preview uses the shared API server and PostgreSQL database. Netlify runs the small adapter in `netlify/functions/api.ts`, which uses Supabase REST so registration and event content continue to work after a static deploy.

1. Create a Supabase project and create these tables:
   - `registrations`: `id`, `name`, `email`, `school`, `grade`, `team_name`, `team_size`, `experience`, `project_idea`, `dietary_needs`, `created_at`
   - `announcements`: `id`, `title`, `body`, `label`, `published_at`, `is_pinned`
   - `schedule_items`: `id`, `start_time`, `end_time`, `title`, `description`, `kind`, `location`
2. Enable the REST API for those tables and add appropriate row-level security policies. Use a service-role key only in Netlify environment variables; never commit it.
3. In Netlify, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Add `ORGANIZER_ADMIN_KEY` in Netlify environment variables. The same key is sent as the `x-admin-key` header for announcement create/update/delete actions.
5. Deploy. `netlify.toml` handles the `/api/*` function rewrite and SPA fallback for clean routes.

The preview API's organizer write endpoints are protected by `ORGANIZER_ADMIN_KEY` (falling back to the existing server session secret for local use). The Netlify function exposes the same announcement write behavior and keeps the Supabase service-role key server-side.