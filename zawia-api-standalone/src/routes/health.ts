import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "ZawIA API", version: "1.0.0", timestamp: new Date().toISOString() });
});

healthRouter.get("/healthz", (_req, res) => {
  res.json({ status: "ok", app: "ZawIA API", version: "1.0.0" });
});
