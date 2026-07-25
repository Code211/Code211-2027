import { createInsertSchema } from "drizzle-zod";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  label: text("label").notNull().default("UPDATE"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  isPinned: boolean("is_pinned").notNull().default(false),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({
  id: true,
  publishedAt: true,
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;