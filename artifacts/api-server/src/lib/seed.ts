import { db, announcementsTable, scheduleItemsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./logger";

export async function seedEventContent(): Promise<void> {
  const [{ total: announcementCount }] = await db
    .select({ total: count() })
    .from(announcementsTable);

  if (announcementCount === 0) {
    await db.insert(announcementsTable).values([
      {
        title: "Registration is open",
        body: "Bring a big idea or start with a blank page. Solo hackers and teams of up to four are welcome.",
        label: "NOW OPEN",
        isPinned: true,
      },
      {
        title: "Workshops are beginner-friendly",
        body: "You do not need prior hackathon experience. Pick a session, ask questions, and build alongside your peers.",
        label: "GOOD TO KNOW",
        isPinned: false,
      },
    ]);
  }

  const [{ total: scheduleCount }] = await db
    .select({ total: count() })
    .from(scheduleItemsTable);

  if (scheduleCount === 0) {
    await db.insert(scheduleItemsTable).values([
      {
        startTime: "08:00",
        endTime: "08:45",
        title: "Check-in + breakfast",
        description: "Grab your badge, meet your team, and get settled in.",
        kind: "event",
        location: "Main lobby",
      },
      {
        startTime: "09:00",
        endTime: "09:30",
        title: "Kickoff + idea sprint",
        description: "The clock starts. Hear the prompts, meet mentors, and choose your build.",
        kind: "event",
        location: "Auditorium",
      },
      {
        startTime: "10:00",
        endTime: "11:00",
        title: "Web dev from zero",
        description: "A friendly, practical introduction to HTML, CSS, JavaScript, and shipping a first page.",
        kind: "workshop",
        location: "Lab 1",
      },
      {
        startTime: "13:00",
        endTime: "14:00",
        title: "Game design lab",
        description: "Learn the building blocks of a playable prototype with guidance from student mentors.",
        kind: "workshop",
        location: "Lab 2",
      },
      {
        startTime: "16:30",
        endTime: "17:00",
        title: "Submissions close",
        description: "Polish your demo, submit your project, and prepare your story.",
        kind: "judging",
        location: "Project portal",
      },
      {
        startTime: "18:00",
        endTime: "19:00",
        title: "Demos + awards",
        description: "Share what you made and celebrate every team that shipped.",
        kind: "judging",
        location: "Auditorium",
      },
    ]);
  }

  logger.info("Event content seed check complete");
}