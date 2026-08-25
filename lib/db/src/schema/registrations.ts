import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  school: text("school").notNull(),
  teamId: integer("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
  experience: text("experience").notNull(),
  tShirtSize: text("t_shirt_size").notNull().default("Adult M"),
  dietaryNeeds: text("dietary_needs"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;