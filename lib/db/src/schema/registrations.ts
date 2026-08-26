import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  school: text("school").notNull(),
  // Retained for compatibility with existing databases. New registrations do
  // not collect these legacy fields.
  grade: text("grade"),
  teamName: text("team_name"),
  teamSize: integer("team_size"),
  teamId: integer("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
  experience: text("experience").notNull(),
  tShirtSize: text("t_shirt_size").notNull().default("Adult M"),
  dietaryNeeds: text("dietary_needs"),
  projectIdea: text("project_idea"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;