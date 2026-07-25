import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, announcementsTable } from "@workspace/db";
import {
  CreateAnnouncementBody,
  CreateAnnouncementHeader,
  CreateAnnouncementResponse,
  DeleteAnnouncementHeader,
  DeleteAnnouncementParams,
  ListAnnouncementsResponse,
  UpdateAnnouncementBody,
  UpdateAnnouncementHeader,
  UpdateAnnouncementResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function organizerKeyIsValid(rawHeaders: unknown): boolean {
  const parsed = typeof rawHeaders === "object" && rawHeaders !== null
    ? rawHeaders as Record<string, unknown>
    : {};
  const requestKey = parsed["x-admin-key"];
  const configuredKey = process.env.ORGANIZER_ADMIN_KEY ?? process.env.SESSION_SECRET;
  return typeof requestKey === "string" && requestKey.length > 0 && Boolean(configuredKey) && requestKey === configuredKey;
}

function requireOrganizer(req: Parameters<Parameters<typeof router.post>[1]>[0], res: Parameters<Parameters<typeof router.post>[1]>[1]): boolean {
  if (!organizerKeyIsValid(req.headers)) {
    res.status(401).json({ error: "Organizer access required." });
    return false;
  }
  return true;
}

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.publishedAt));
  res.json(ListAnnouncementsResponse.parse(announcements));
});

router.post("/announcements", async (req, res): Promise<void> => {
  if (!requireOrganizer(req, res)) return;
  const header = CreateAnnouncementHeader.safeParse(req.headers);
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!header.success || !parsed.success) {
    res.status(400).json({ error: "Invalid announcement." });
    return;
  }

  const [announcement] = await db.insert(announcementsTable).values(parsed.data).returning();
  res.status(201).json(CreateAnnouncementResponse.parse(announcement));
});

router.patch("/announcements", async (req, res): Promise<void> => {
  if (!requireOrganizer(req, res)) return;
  const header = UpdateAnnouncementHeader.safeParse(req.headers);
  const parsed = UpdateAnnouncementBody.safeParse(req.body);
  if (!header.success || !parsed.success) {
    res.status(400).json({ error: "Announcement id and valid fields are required." });
    return;
  }

  const { id, ...update } = parsed.data;
  const [announcement] = await db
    .update(announcementsTable)
    .set(update)
    .where(eq(announcementsTable.id, id))
    .returning();
  if (!announcement) {
    res.status(404).json({ error: "Announcement not found." });
    return;
  }
  res.json(UpdateAnnouncementResponse.parse(announcement));
});

router.delete("/announcements/:id", async (req, res): Promise<void> => {
  if (!requireOrganizer(req, res)) return;
  const header = DeleteAnnouncementHeader.safeParse(req.headers);
  const params = DeleteAnnouncementParams.safeParse(req.params);
  if (!header.success || !params.success) {
    res.status(400).json({ error: "A valid announcement id is required." });
    return;
  }

  const deleted = await db
    .delete(announcementsTable)
    .where(eq(announcementsTable.id, params.data.id))
    .returning({ id: announcementsTable.id });
  if (deleted.length === 0) {
    res.status(404).json({ error: "Announcement not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;