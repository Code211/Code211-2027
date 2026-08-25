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

Registrations and teams are stored in PostgreSQL. The `teams` table owns the case-insensitive team name, capacity (1–4), and four-digit deletion PIN. A registration references its team with a cascading foreign key, so deleting a team also deletes its registrations. Team capacity is checked while the team row is locked to prevent over-capacity races.

Students can create a team from the registration form, save the one-time PIN, or select an open existing team. The `/manage-team` page deletes a team only after its PIN is verified. PINs are never returned by the public team list or dashboard.

After changing the OpenAPI contract, regenerate clients and validators:

## Netlify

Netlify builds the static frontend with:

```bash
pnpm --filter @workspace/code211 run build
```

`netlify.toml` publishes `artifacts/code211/dist/public`, rewrites `/api/*` to the serverless function, and provides SPA fallback routing. See `NETLIFY_SETUP.md` for production configuration details.

## Railway setup

Railway is the recommended deployment for the full Postgres-backed app:

1. Create a Railway project with a PostgreSQL service and an API service.
2. Set the API service's `DATABASE_URL` to the reference variable from the Railway PostgreSQL service. Do not commit it or paste it into source files.
3. Set the API service start command to the built API server command used by this workspace. Railway supplies `PORT`; the server already binds to it.
4. Apply the schema from the API service's deployment process with `pnpm --filter @workspace/db run push` in a controlled migration step. Review Drizzle's proposed changes before accepting legacy-column removals.
5. Deploy the frontend as its own Railway service (or static host) using `pnpm --filter @workspace/code211 run build`. Configure its API base/path to the deployed API service according to the existing Railway routing setup; do not invent a domain in code.
6. Configure `SESSION_SECRET` and any organizer/admin secret as Railway environment variables. Never commit these values.

The exact Railway service names and public domains are project-specific, so they should be copied from the Railway dashboard rather than hard-coded in this repository.

## Event details

- Event: Saturday, January 23, 2027
- Registration closes: Wednesday, January 20, 2027
- Location: Hoffman Estates High School, Media Center
- Theme: TBD
- Previous theme: Level Up
- Email: hackathon.d211@gmail.com
- Discord: https://discord.com/invite/ZEvmePbwHZ
- Instagram: https://www.instagram.com/official_code211/