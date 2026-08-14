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
  "https://script.google.com/macros/s/AKfycbyHUJl9xrFjoGc3D_3iCTK4_XwIQhgtN7ELDo0YC_RVL-qpKEVKggu-r7APsTjeYFqM5A/exec";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
    "cache-control": "no-store",
  },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  try {
    /*
     * Normalize the path so both:
     *
     * /api/registrations
     *
     * and:
     *
     * /.netlify/functions/api/registrations
     *
     * become:
     *
     * registrations
     */

    const rawPath = event.path.replace(/^\/+/, "").replace(/\/+$/, "");

    let path = rawPath;

    const functionPrefix = ".netlify/functions/api/";
    const apiPrefix = "api/";

    if (path.startsWith(functionPrefix)) {
      path = path.slice(functionPrefix.length);
    } else if (path.startsWith(apiPrefix)) {
      path = path.slice(apiPrefix.length);
    }

    const method = event.httpMethod.toUpperCase();

    /*
     * POST /api/registrations
     *
     * This matches the working Replit registration endpoint.
     */
    if (path === "registrations" && method === "POST") {
      let body: RegistrationInput;

      try {
        body = JSON.parse(event.body ?? "{}") as RegistrationInput;
      } catch {
        return json(400, {
          error: "Please check the highlighted registration fields.",
        });
      }

      /*
       * Basic validation matching the Replit API.
       */
      if (
        !body.school ||
        !body.name ||
        !body.email ||
        !body.teamSize ||
        !body.experience ||
        !body.tShirtSize
      ) {
        return json(400, {
          error: "Please check the highlighted registration fields.",
        });
      }

      /*
       * Create the exact payload expected by Google Apps Script.
       */
      const payload = {
        school: body.school,
        name: body.name,
        email: body.email,
        teamName: body.teamName ?? "",
        teamSize: body.teamSize,
        experience: body.experience,
        tShirtSize: body.tShirtSize,
        dietaryNeeds: body.dietaryNeeds ?? "",
      };

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        let responseBody: {
          success?: boolean;
          message?: string;
        } = {};

        try {
          responseBody = responseText ? JSON.parse(responseText) : {};
        } catch {
          /*
           * Apps Script may return a non-JSON success page
           * after accepting the request.
           */
        }

        if (!response.ok || responseBody.success === false) {
          console.error(
            "Google Apps Script rejected registration:",
            response.status,
          );

          return json(502, {
            error:
              "Registration could not be sent to the event organizers. Please try again.",
          });
        }

        return json(201, {
          success: true,
          message:
            responseBody.message ?? "Registration submitted successfully.",
        });
      } catch (error) {
        console.error("Google Apps Script registration request failed:", error);

        return json(502, {
          error:
            "Registration could not be sent right now. Please try again in a moment.",
        });
      }
    }

    /*
     * The registration endpoint is the only backend endpoint
     * we need to implement here for now.
     *
     * Dashboard, announcements, and schedule can continue
     * using the existing production data adapter.
     */

    return json(404, {
      error: "Not found.",
    });
  } catch (error) {
    console.error("Netlify API error:", error);

    return json(500, {
      error:
        error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
};
