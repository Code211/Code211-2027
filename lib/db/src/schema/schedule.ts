import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const scheduleItemsTable = pgTable("schedule_items", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  kind: text("kind").notNull(),
  location: text("location").notNull(),
});

export const insertScheduleItemSchema = createInsertSchema(scheduleItemsTable).omit({
  id: true,
});
export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;
export type ScheduleItem = typeof scheduleItemsTable.$inferSelect;