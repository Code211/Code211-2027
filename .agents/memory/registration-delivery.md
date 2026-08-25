---
name: Registration delivery
description: Durable decision for where Code211 registration submissions are sent.
---

Code211 registrations and teams use PostgreSQL as the source of truth. Registration requests go through the app API, reference a team by ID, and are capacity-checked transactionally. Team deletion cascades to its registrations; deletion PINs stay server-side.

**Why:** The organizer explicitly changed the registration system to Postgres so team creation, joining, capacity, and PIN-protected deletion can be consistent and race-safe.

**How to apply:** Treat the Postgres API as canonical for the full app. Netlify may host the static frontend, but Railway should host the API/database for team management unless its serverless adapter is brought up to the same contract.