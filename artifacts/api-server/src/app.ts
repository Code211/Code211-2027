import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes MUST be mounted before static serving so /api/* is handled by Express
app.use("/api", router);

// Compute repo root relative to this file so the compiled artifact (in artifacts/api-server/dist)
// and the source file (artifacts/api-server/src) both resolve to the same repository root.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const clientDist = path.join(repoRoot, "artifacts", "code211", "dist", "public");
const indexPath = path.join(clientDist, "index.html");
const indexExists = fs.existsSync(indexPath);

logger.info({ repoRoot, clientDist, indexExists }, "Resolved frontend directory");

if (process.env.NODE_ENV === "production") {
  if (indexExists) {
    // Serve static assets
    app.use(express.static(clientDist));

    // SPA fallback middleware (Express 5 compatible). This will serve index.html for
    // navigation requests (GET/HEAD that accept text/html) while skipping /api routes.
    app.use((req, res, next) => {
      // Never handle API routes here
      if (req.path.startsWith("/api")) return next();

      // Only for navigation requests
      if (req.method !== "GET" && req.method !== "HEAD") return next();

      const accept = (req.headers.accept || "") as string;
      if (!accept.includes("text/html")) return next();

      res.sendFile(indexPath, (err) => {
        if (err) next(err);
      });
    });
  } else {
    logger.warn({ clientDist, indexPath }, "Production mode but frontend build not found; not serving SPA");
  }
} else {
  logger.info({ nodeEnv: process.env.NODE_ENV }, "Not in production; frontend not served by Express");
}

export default app;
