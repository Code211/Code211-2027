import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import { db, registrationsTable, teamsTable } from "@workspace/db";
import {
  CreateRegistrationBody,
  CreateRegistrationResponse,
  CreateTeamBody,
  CreateTeamResponse,
  DeleteTeamBody,
  ListTeamsResponse,
} from "@workspace/api-zod";
import { randomInt } from "node:crypto";

const router: IRouter = Router();

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid registration submission");
    res.status(400).json({ error: "Please check the highlighted registration fields." });
    return;
  }
  if (parsed.data.teamId === null) {
    res.status(400).json({ error: "Choose a team before submitting your registration." });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      const [team] = await tx
        .select({ id: teamsTable.id, maxMembers: teamsTable.maxMembers })
        .from(teamsTable)
        .where(eq(teamsTable.id, parsed.data.teamId as number))
        .for("update");
      if (!team) {
        throw Object.assign(new Error("Team not found."), { statusCode: 404 });
      }
      const [{ memberCount }] = await tx
        .select({ memberCount: count() })
        .from(registrationsTable)
        .where(eq(registrationsTable.teamId, team.id));
      if (Number(memberCount) >= team.maxMembers) {
        throw Object.assign(new Error("That team is already full."), { statusCode: 409 });
      }
      await tx.insert(registrationsTable).values({
        name: parsed.data.name,
        email: parsed.data.email,
        school: parsed.data.school,
        teamId: team.id,
        experience: parsed.data.experience,
        tShirtSize: parsed.data.tShirtSize,
        dietaryNeeds: parsed.data.dietaryNeeds ?? null,
      });
    });
    res.status(201).json(CreateRegistrationResponse.parse({
      success: true,
      message: "Registration submitted successfully.",
    }));
  } catch (error) {
    const statusCode = typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
    if (statusCode >= 500) req.log.error({ error }, "Registration database request failed");
    res.status(statusCode).json({ error: statusCode === 500 ? "Registration could not be saved right now. Please try again in a moment." : error instanceof Error ? error.message : "Registration could not be completed." });
  }
});

router.get("/teams", async (_req, res): Promise<void> => {
  const teams = await db
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      maxMembers: teamsTable.maxMembers,
      memberCount: count(registrationsTable.id),
    })
    .from(teamsTable)
    .leftJoin(registrationsTable, eq(registrationsTable.teamId, teamsTable.id))
    .groupBy(teamsTable.id)
    .orderBy(teamsTable.name);
  res.json(ListTeamsResponse.parse(teams.map((team) => ({
    ...team,
    memberCount: Number(team.memberCount),
    available: Number(team.memberCount) < team.maxMembers,
  }))));
});

router.post("/teams", async (req, res): Promise<void> => {
  const parsed = CreateTeamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Team names must be 3–25 characters and use only letters, numbers, spaces, and hyphens. Choose a capacity from 1 to 4." });
    return;
  }
  const name = parsed.data.name.replace(/\s+/g, " ").trim();
  if (!/^[A-Za-z0-9 -]{3,25}$/.test(name)) {
    res.status(400).json({ error: "Team names must be 3–25 characters and use only letters, numbers, spaces, and hyphens." });
    return;
  }
  try {
    const [team] = await db.insert(teamsTable).values({
      name,
      maxMembers: parsed.data.maxMembers,
      deletionPin: String(randomInt(0, 10000)).padStart(4, "0"),
    }).returning();
    res.status(201).json(CreateTeamResponse.parse({
      id: team.id,
      name: team.name,
      maxMembers: team.maxMembers,
      memberCount: 0,
      available: true,
      deletionPin: team.deletionPin,
    }));
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      res.status(409).json({ error: "That team name is already taken. Choose another name." });
      return;
    }
    req.log.error({ error }, "Team creation failed");
    res.status(500).json({ error: "We could not create that team right now. Please try again." });
  }
});

router.delete("/teams/:id", async (req, res): Promise<void> => {
  const teamId = Number(req.params.id);
  const parsed = DeleteTeamBody.safeParse(req.body);
  if (!Number.isInteger(teamId) || !parsed.success) {
    res.status(400).json({ error: "Enter the team's four-digit deletion PIN." });
    return;
  }
  const [team] = await db.select({ id: teamsTable.id, deletionPin: teamsTable.deletionPin }).from(teamsTable).where(eq(teamsTable.id, teamId));
  if (!team) {
    res.status(404).json({ error: "Team not found." });
    return;
  }
  if (team.deletionPin !== parsed.data.deletionPin) {
    res.status(401).json({ error: "That deletion PIN is incorrect." });
    return;
  }
  await db.delete(teamsTable).where(eq(teamsTable.id, teamId));
  res.status(204).send();
});

export default router;
