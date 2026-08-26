import { defineConfig } from "drizzle-kit";
import path from "path";
import { getDatabaseUrl } from "./src/database-config";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
