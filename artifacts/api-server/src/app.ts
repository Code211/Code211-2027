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

// API routes MUST be mounted before static serving so /api/* is handled by Express
app.use("/api", router);

// Serve production build of the Vite frontend when NODE_ENV=production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Vite build outputs to artifacts/code211/dist/public per vite.config.ts
const clientDist = path.resolve(__dirname, "..", "..", "artifacts", "code211", "dist", "public");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));

  // SPA fallback: for any non-API path, serve index.html so client-side routes work
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
