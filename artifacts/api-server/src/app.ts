import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// API routes must be mounted before the static/frontend fallback so /api/* is handled by Express
app.use("/api", router);

// Serve the built frontend in production. We resolve the client dist relative to this file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "..", "..", "code211", "dist", "public");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));

  // SPA fallback: serve index.html for any non-API route so client-side routing works on direct visits
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
