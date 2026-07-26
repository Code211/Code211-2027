---
name: Registration delivery
description: Durable decision for where Code211 registration submissions are sent.
---

Code211 registrations are delivered server-side to the configured Google Apps Script web app. The frontend posts to the app API, and both the preview API and Netlify function forward the same eight-field JSON contract: `school`, `name`, `email`, `teamName`, `teamSize`, `experience`, `tShirtSize`, and `dietaryNeeds`.

**Why:** The organizer wants the Google Apps Script web app and its connected Google Sheet to be the registration system of record instead of a project database.

**How to apply:** Keep the Apps Script URL server-side/configurable through `GOOGLE_APPS_SCRIPT_URL`; do not reintroduce a local registration insert unless the organizer explicitly changes the source of truth.