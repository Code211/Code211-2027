# Code211 Hackathon

The Code211 website is a React/Vite site for the District 211 student hackathon on Saturday, January 23, 2027, at Hoffman Estates High School in the Media Center.

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/code211 run dev
```

The frontend uses the API server for registration submissions and event content. The configured workflows in Replit start these services for you.

Useful checks:

```bash
pnpm run typecheck
PORT=4173 BASE_PATH=/code211/ pnpm --filter @workspace/code211 run build
```

## Edit event content

- `artifacts/code211/src/App.tsx` contains the page copy, event date, location, countdown, contact links, theme bar, FAQ, and registration form.
- `artifacts/code211/src/index.css` contains the visual tokens and responsive styling.
- `artifacts/api-server/src/lib/seed.ts` contains initial announcements and schedule records for the preview API. The public site currently displays schedule and workshop details as `TBD` until organizers finalize them.
- `artifacts/api-server/src/routes/announcements.ts` contains organizer-protected announcement editing endpoints.
- `lib/api-spec/openapi.yaml` is the API contract. If you change an API shape, run:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Registration and teams

The registration form sends this JSON payload through the app API:

```json
{
  "school": "Hoffman Estates High School",
  "name": "Example Student",
  "email": "student@example.com",
  "teamId": 12,
  "experience": "Just getting started",
  "tShirtSize": "Adult M",
  "dietaryNeeds": ""
}
```

Registrations and teams are stored in PostgreSQL, and each successful registration is also forwarded server-side to the configured Google Apps Script web app so it continues to arrive in Google Sheets. The `teams` table owns the case-insensitive team name, capacity (1–4), and four-digit deletion PIN. A registration references its team with a cascading foreign key, so deleting a team also deletes its registrations. Team capacity is checked while the team row is locked to prevent over-capacity races.

Students can create a team from the registration form, save the one-time PIN, or select an open existing team. The `/manage-team` page deletes a team only after its PIN is verified. PINs are never returned by the public team list or dashboard.

After changing the OpenAPI contract, regenerate clients and validators:

## Netlify

Netlify builds the static frontend with:

```bash
pnpm --filter @workspace/code211 run build
```

`netlify.toml` publishes `artifacts/code211/dist/public`, rewrites `/api/*` to the serverless function, and provides SPA fallback routing. See `NETLIFY_SETUP.md` for production configuration details.

## Railway setup

Railway is the recommended deployment for the full Postgres-backed app. The simplest setup is one Railway web service that serves both the built React frontend and Express API, plus one Railway PostgreSQL service:

1. Create a Railway project and add a PostgreSQL service.
2. Add this repository as a web service. Use the repository root as its working directory.
3. Set the web service build command to:

   ```bash
   pnpm install --frozen-lockfile && pnpm run build
   ```

4. Set the web service start command to:

   ```bash
   pnpm --filter @workspace/api-server run start
   ```

   The API server serves `artifacts/code211/dist/public` when `NODE_ENV=production`, so this single service handles the website and `/api/*`.
5. Add the PostgreSQL reference variable described below. Railway supplies `PORT`; the server already binds to it.
6. Apply the schema from a controlled Railway migration/deploy step with `pnpm --filter @workspace/db run push`. Review Drizzle's proposed changes before accepting legacy-column removals.
7. Generate a Railway public domain for the web service. Use that domain for the website; do not hard-code it into the repository.

The exact Railway service names and public domains are project-specific, so they should be copied from the Railway dashboard rather than hard-coded in this repository.

### Railway environment variables

Set these on the **API service**:

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_SOURCE` | Yes | `replit` for the current Replit database, or `railway` when switching to Railway |
| `RAILWAY_DATABASE_URL` | When `DATABASE_SOURCE=railway` | Railway PostgreSQL connection/reference variable; keep it server-side |
| `GOOGLE_APPS_SCRIPT_URL` | Yes | The Google Apps Script Web App `/exec` URL that writes to the Sheet; keep it private |
| `SESSION_SECRET` | Yes | A long random secret used for server-side session/admin fallback |
| `ORGANIZER_ADMIN_KEY` | Optional | Separate long random secret for organizer announcement writes; if omitted, the API falls back to `SESSION_SECRET` |
| `NODE_ENV` | Recommended | `production` |

Railway supplies `PORT` automatically. Do not manually set `PORT`, `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, or `PGPASSWORD`. The frontend does not need database or Google credentials. If it is deployed separately, set only the build-time `BASE_PATH` when hosting it below a subpath; configure `/api` to proxy to the Railway API service.

For the current Replit setup, `DATABASE_SOURCE=replit` is configured. The app then uses Replit's managed `DATABASE_URL`. To switch later, set `DATABASE_SOURCE=railway` and provide `RAILWAY_DATABASE_URL`; no source-code change is needed.

When `GOOGLE_APPS_SCRIPT_URL` is missing in production, the API refuses to report a successful registration even though the Postgres record is retained. If Sheets is temporarily unavailable, the API likewise reports the sync failure and asks organizers to avoid duplicate resubmission.

## Event details

- Event: Saturday, January 23, 2027
- Registration closes: Wednesday, January 20, 2027
- Location: Hoffman Estates High School, Media Center
- Theme: TBD
- Previous theme: Level Up
- Email: hackathon.d211@gmail.com
- Discord: https://discord.com/invite/ZEvmePbwHZ
- Instagram: https://www.instagram.com/official_code211/