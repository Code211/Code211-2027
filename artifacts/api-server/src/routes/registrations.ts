import { Router, type IRouter } from "express";
import { db, registrationsTable } from "@workspace/db";
import { CreateRegistrationBody, CreateRegistrationResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid registration submission");
    res.status(400).json({ error: "Please check the highlighted registration fields." });
    return;
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      ...parsed.data,
      teamName: parsed.data.teamName ?? null,
      projectIdea: parsed.data.projectIdea ?? null,
      dietaryNeeds: parsed.data.dietaryNeeds ?? null,
    })
    .returning();

  res.status(201).json(CreateRegistrationResponse.parse(registration));
});

export default router;