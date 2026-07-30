import type { Handler } from "@netlify/functions";

type RegistrationInput = {
  name: string;
  email: string;
  school: string;
  teamName?: string | null;
  teamSize: number;
  experience: string;
  tShirtSize: string;
  dietaryNeeds?: string | null;
};

const GOOGLE_APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxR9lESLI40p-KXvIxzJZl4Js8CmbMkEys94S_NTPcn6SS5HHk2ZwKUAxhJ2H-LxJM/exec";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body),
});

function requireSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for Netlify Functions.");
  }
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const { url, key } = requireSupabase();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
      ...init?.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(typeof data?.message === "string" ? data.message : "Supabase request failed.");
  return data;
}

function organizerAuthorized(event: Parameters<Handler>[0]) {
  const configuredKey = process.env.ORGANIZER_ADMIN_KEY;
  const requestKey = event.headers["x-admin-key"] ?? event.headers["X-Admin-Key"];
  return Boolean(configuredKey && requestKey && requestKey === configuredKey);
}

export const handler: Handler = async (event) => {
  try {
    const path = event.path.replace(/^\/?\.netlify\/functions\/api\/?/, "").replace(/^api\/?/, "");
    const method = event.httpMethod.toUpperCase();

    if (path === "registrations" && method === "POST") {
      const body = JSON.parse(event.body ?? "{}") as RegistrationInput;
      if (!body.name || !body.email || !body.school || !body.teamSize || !body.experience || !body.tShirtSize) {
        return json(400, { error: "Please complete all required fields." });
      }

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "content-type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            school: body.school,
            name: body.name,
            email: body.email,
            teamName: body.teamName ?? "",
            teamSize: body.teamSize,
            experience: body.experience,
            tShirtSize: body.tShirtSize,
            dietaryNeeds: body.dietaryNeeds ?? "",
          }),
          redirect: "follow",
        });

        const responseText = await response.text();
        let responseBody: { result?: string; success?: boolean; message?: string } = {};

        try {
          responseBody = responseText ? JSON.parse(responseText) : {};
        } catch {
          // Google Apps Script often responds with an HTML page after following redirects; 
          // If response.ok is true, we consider the execution successful.
        }

        // Check for explicit error responses
        if (!response.ok || responseBody.result === "error" || responseBody.success === false) {
          return json(502, { 
            error: responseBody.message ?? "Registration could not be sent to the event organizers. Please try again." 
          });
        }

        return json(201, { 
          success: true, 
          message: responseBody.message ?? "Registration submitted successfully." 
        });
      } catch (err) {
        console.error("Google Apps Script Fetch Error:", err);
        return json(500, { error: "Failed to connect to registration service. Please try again." });
      }
    }

    if (path === "announcements" && method === "GET") {
      const announcements = await supabaseRequest("announcements?select=*&order=is_pinned.desc,published_at.desc");
      return json(200, announcements.map((item: Record<string, unknown>) => ({
        ...item,
        publishedAt: item.published_at,
        isPinned: item.is_pinned,
      })));
    }

    if (path === "announcements" && ["POST", "PATCH"].includes(method)) {
      if (!organizerAuthorized(event)) return json(401, { error: "Organizer access required." });
      const body = JSON.parse(event.body ?? "{}") as {
        id?: number;
        title?: string;
        body?: string;
        label?: string;
        isPinned?: boolean;
      };

      if (!body.title || !body.body || !body.label || typeof body.isPinned !== "boolean") {
        return json(400, { error: "Title, body, label, and pin status are required." });
      }

      const payload = {
        title: body.title,
        body: body.body,
        label: body.label,
        is_pinned: body.isPinned,
      };

      if (method === "POST") {
        const [announcement] = await supabaseRequest("announcements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return json(201, {
          ...announcement,
          publishedAt: announcement.published_at,
          isPinned: announcement.is_pinned,
        });
      }

      if (!body.id || !Number.isInteger(body.id)) return json(400, { error: "A valid announcement id is required." });
      const [announcement] = await supabaseRequest(`announcements?id=eq.${body.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!announcement) return json(404, { error: "Announcement not found." });
      return json(200, {
        ...announcement,
        publishedAt: announcement.published_at,
        isPinned: announcement.is_pinned,
      });
    }

    if (path.startsWith("announcements/") && method === "DELETE") {
      if (!organizerAuthorized(event)) return json(401, { error: "Organizer access required." });
      const id = Number(path.split("/")[1]);
      if (!Number.isInteger(id)) return json(400, { error: "A valid announcement id is required." });
      const deleted = await supabaseRequest(`announcements?id=eq.${id}`, { method: "DELETE" });
      if (!deleted?.length) return json(404, { error: "Announcement not found." });
      return { statusCode: 204, body: "" };
    }

    if (path === "schedule" && method === "GET") {
      const schedule = await supabaseRequest("schedule_items?select=*&order=start_time.asc");
      return json(200, schedule.map((item: Record<string, unknown>) => ({
        ...item,
        startTime: item.start_time,
        endTime: item.end_time,
      })));
    }

    if (path === "dashboard" && method === "GET") {
      const [registrations, announcements, schedule] = await Promise.all([
        supabaseRequest("registrations?select=team_name"),
        supabaseRequest("announcements?select=id"),
        supabaseRequest("schedule_items?select=*&order=start_time.asc&limit=1"),
      ]);
      const teams = new Set(registrations.map((item: { team_name?: string | null }) => item.team_name?.trim()).filter(Boolean));
      const next = schedule[0];
      return json(200, {
        registrationCount: registrations.length,
        teamCount: teams.size,
        announcementCount: announcements.length,
        nextEvent: next ? { ...next, startTime: next.start_time, endTime: next.end_time } : null,
      });
    }

    return json(404, { error: "Not found." });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
};