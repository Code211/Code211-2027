import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseUrl = process.env.RAILWAY_DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or RAILWAY_DATABASE_URL must be set; ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
