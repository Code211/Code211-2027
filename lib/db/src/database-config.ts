export type DatabaseSource = "replit" | "railway";

/**
 * Select the database connection without changing application code.
 * Replit is the safe default for preview and local development.
 */
export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const source = env.DATABASE_SOURCE ?? "replit";

  if (source !== "replit" && source !== "railway") {
    throw new Error(`Invalid DATABASE_SOURCE "${source}". Use "replit" or "railway".`);
  }

  const url = source === "railway" ? env.RAILWAY_DATABASE_URL : env.DATABASE_URL;
  if (!url) {
    const variable = source === "railway" ? "RAILWAY_DATABASE_URL" : "DATABASE_URL";
    throw new Error(`${variable} must be set when DATABASE_SOURCE=${source}.`);
  }

  return url;
}