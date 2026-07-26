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

## Registration delivery

The registration form sends this JSON payload through the app API:

```json
{
  "school": "Hoffman Estates High School",
  "name": "Example Student",
  "email": "student@example.com",
  "teamName": "",
  "teamSize": 1,
  "experience": "Just getting started",
  "tShirtSize": "Adult M",
  "dietaryNeeds": ""
}
```

The API forwards those fields to the Google Apps Script web app configured in:

- `artifacts/api-server/src/routes/registrations.ts`
- `netlify/functions/api.ts`

The current endpoint can be overridden with `GOOGLE_APPS_SCRIPT_URL`. Registration data is not inserted into the local PostgreSQL database. A successful Apps Script response shows the confirmation screen; an upstream failure shows a retryable error message.

## Netlify

Netlify builds the static frontend with:

```bash
pnpm --filter @workspace/code211 run build
```

`netlify.toml` publishes `artifacts/code211/dist/public`, rewrites `/api/*` to the serverless function, and provides SPA fallback routing. See `NETLIFY_SETUP.md` for production configuration details.

## Event details

- Event: Saturday, January 23, 2027
- Registration closes: Wednesday, January 20, 2027
- Location: Hoffman Estates High School, Media Center
- Theme: TBD
- Previous theme: Level Up
- Email: hackathon.d211@gmail.com
- Discord: https://discord.com/invite/ZEvmePbwHZ
- Instagram: https://www.instagram.com/official_code211/