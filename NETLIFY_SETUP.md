# Netlify setup

The site is configured to build from the repository root with:

```bash
pnpm --filter @workspace/code211 run build
```

## Full app deployment

The preview API and Railway deployment use PostgreSQL for teams and registrations, and forward successful registrations to Google Sheets through `GOOGLE_APPS_SCRIPT_URL`. Netlify can still host the static frontend and SPA shell, but its legacy serverless adapter does not provide the complete Postgres-backed team-management API. Use Railway for the API when deploying registration, team capacity, deletion, and Google Sheets delivery features.

The frontend posts to `/api/registrations`, `/api/teams`, and `/api/teams/:id`. If Netlify is used as the frontend host, configure its API rewrite to the deployed Railway API service and enable CORS for the frontend origin. Do not put `DATABASE_URL`, `SESSION_SECRET`, or organizer secrets in the frontend environment.

The full Railway setup is documented in `README.md`. The API service must receive:

```json
{
  "school": "...",
  "name": "...",
  "email": "...",
  "teamId": 12,
  "experience": "...",
  "tShirtSize": "Adult M",
  "dietaryNeeds": "..."
}
```

## Other production data

Announcements and schedule content can continue using the existing Netlify data adapter. Add the required Supabase configuration only if those live content features are used in production.

The preview API's organizer write endpoints are protected by `ORGANIZER_ADMIN_KEY` (falling back to the existing server session secret for local use). The Netlify function exposes the same announcement write behavior.