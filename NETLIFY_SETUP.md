# Netlify setup

The site is configured to build from the repository root with:

```bash
pnpm --filter @workspace/code211 run build
```

## Registration delivery

Registration data is not stored in PostgreSQL or Supabase. The frontend posts to `/api/registrations`, and the preview API or Netlify function forwards the request to the Google Apps Script web app.

The default Apps Script URL is configured in:

- `artifacts/api-server/src/routes/registrations.ts` for Replit preview
- `netlify/functions/api.ts` for Netlify

To override it without editing code, set `GOOGLE_APPS_SCRIPT_URL` in the target environment. The Apps Script endpoint should accept a JSON `POST` containing exactly:

```json
{
  "school": "...",
  "name": "...",
  "email": "...",
  "teamName": "...",
  "teamSize": 1,
  "experience": "...",
  "tShirtSize": "Adult M",
  "dietaryNeeds": "..."
}
```

The endpoint should return HTTP 2xx and preferably JSON such as:

```json
{ "success": true, "message": "Registration submitted successfully." }
```

The site shows a confirmation only when the Apps Script request succeeds. If the Apps Script endpoint rejects the request or is unavailable, the form shows a retryable error and no local registration record is created.

## Other production data

Announcements and schedule content can continue using the existing Netlify data adapter. Add the required Supabase configuration only if those live content features are used in production.

The preview API's organizer write endpoints are protected by `ORGANIZER_ADMIN_KEY` (falling back to the existing server session secret for local use). The Netlify function exposes the same announcement write behavior.