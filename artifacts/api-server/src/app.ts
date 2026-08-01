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

// Resolve frontend dist directory robustly so it works when the server is running from
// artifacts/api-server/dist (compiled) or when running from source in development.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  // When running from source (ts): artifacts/api-server/src
  path.resolve(__dirname, "..", "..", "artifacts", "code211", "dist", "public"),
  // When running from compiled dist (js): artifacts/api-server/dist
  path.resolve(__dirname, "..", "artifacts", "code211", "dist", "public"),
  // Fallback to process.cwd()
  path.resolve(process.cwd(), "artifacts", "code211", "dist", "public"),
];

let clientDist: string | null = null;
let indexExists = false;
for (const c of candidates) {
  try {
    const indexPath = path.join(c, "index.html");
    if (fs.existsSync(indexPath)) {
      clientDist = c;
      indexExists = true;
      break;
    }
  } catch {
    // ignore
  }
}

logger.info({ clientDist, indexExists }, "Resolved frontend directory");

if (process.env.NODE_ENV === "production" && clientDist && indexExists) {
  app.use(express.static(clientDist));

  // SPA fallback: middleware-based, Express 5 compatible. Do not use path patterns that
  // involve path-to-regexp. This middleware will only respond to GET/HEAD requests that
  // accept HTML and will skip any path under /api so API routes are never swallowed.
  app.use((req, res, next) => {
    // Never handle API routes here
    if (req.path.startsWith("/api")) return next();

    // Only for navigation requests
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const accept = (req.headers.accept || "") as string;
    if (!accept.includes("text/html")) return next();

    const indexPath = path.join(clientDist!, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
} else {
  logger.warn({ clientDist, indexExists, nodeEnv: process.env.NODE_ENV }, "Frontend not served: production build not found or NODE_ENV!=production");
}

export default app;
