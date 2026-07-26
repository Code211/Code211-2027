import { Router, type IRouter } from "express";
import { CreateRegistrationBody, CreateRegistrationResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const GOOGLE_APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxR9lESLI40p-KXvIxzJZl4Js8CmbMkEys94S_NTPcn6SS5HHk2ZwKUAxhJ2H-LxJM/exec";

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid registration submission");
    res.status(400).json({ error: "Please check the highlighted registration fields." });
    return;
  }

  const payload = {
    school: parsed.data.school,
    name: parsed.data.name,
    email: parsed.data.email,
    teamName: parsed.data.teamName ?? "",
    teamSize: parsed.data.teamSize,
    experience: parsed.data.experience,
    tShirtSize: parsed.data.tShirtSize,
    dietaryNeeds: parsed.data.dietaryNeeds ?? "",
  };

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    let responseBody: { success?: boolean; message?: string } = {};
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      // Apps Script may return a non-JSON success page after accepting the request.
    }

    if (!response.ok || responseBody.success === false) {
      req.log.error({ status: response.status }, "Google Apps Script rejected registration");
      res.status(502).json({ error: "Registration could not be sent to the event organizers. Please try again." });
      return;
    }

    res.status(201).json(
      CreateRegistrationResponse.parse({
        success: true,
        message: responseBody.message ?? "Registration submitted successfully.",
      }),
    );
  } catch (error) {
    req.log.error({ error }, "Google Apps Script registration request failed");
    res.status(502).json({ error: "Registration could not be sent right now. Please try again in a moment." });
  }
});

export default router;