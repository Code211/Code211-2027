import { Router, type IRouter } from "express";
import { asc, count, desc } from "drizzle-orm";
import { db, announcementsTable, registrationsTable, scheduleItemsTable } from "@workspace/db";
import { GetDashboardSummaryResponse, ListScheduleItemsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/schedule", async (_req, res): Promise<void> => {
  const schedule = await db
    .select()
    .from(scheduleItemsTable)
    .orderBy(asc(scheduleItemsTable.startTime));
  res.json(ListScheduleItemsResponse.parse(schedule));
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const [{ registrationCount }] = await db
    .select({ registrationCount: count() })
    .from(registrationsTable);
  const [{ announcementCount }] = await db
    .select({ announcementCount: count() })
    .from(announcementsTable);
  const registrations = await db
    .select({ teamName: registrationsTable.teamName })
    .from(registrationsTable);
  const teamNames = new Set(registrations.map(({ teamName }) => teamName?.trim()).filter(Boolean));
  const [nextEvent] = await db
    .select()
    .from(scheduleItemsTable)
    .orderBy(asc(scheduleItemsTable.startTime))
    .limit(1);

  res.json(GetDashboardSummaryResponse.parse({
    registrationCount: Number(registrationCount),
    teamCount: teamNames.size,
    announcementCount: Number(announcementCount),
    nextEvent,
  }));
});

export default router;