# Code211 Hackathon

Student-run District 211 hackathon site with registration, schedule, FAQ, and a live announcements dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/code211/src/App.tsx` — routed frontend pages and shared navigation/footer
- `artifacts/code211/src/index.css` — Code211 visual tokens and responsive styles
- `lib/api-spec/openapi.yaml` — source of truth for backend contracts
- `lib/db/src/schema/` — PostgreSQL schema for registrations, announcements, and schedule
- `artifacts/api-server/src/routes/` — API handlers
- `netlify.toml` and `netlify/functions/api.ts` — Netlify static hosting and production function adapter

## Architecture decisions

- Preview uses the shared API server and Replit PostgreSQL; Netlify uses the function adapter backed by Supabase REST.
- Public dashboard endpoints expose aggregate registration data only; participant records are never listed publicly.
- OpenAPI is the contract source and generated client/Zod packages are used by both frontend and backend.

## Product

Visitors can learn about the hackathon, view the live schedule and workshops, search FAQs, register individually or with a team, and monitor public event updates and aggregate participation totals.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
