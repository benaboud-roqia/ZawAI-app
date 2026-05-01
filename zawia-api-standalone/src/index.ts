import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { scenariosRouter } from "./routes/scenarios.js";
import { captionsRouter } from "./routes/captions.js";
import { supportRouter } from "./routes/support.js";
import { tipsRouter } from "./routes/tips.js";
import { analyzeRouter } from "./routes/analyze.js";
import { authRouter } from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", healthRouter);
app.use("/api", scenariosRouter);
app.use("/api", captionsRouter);
app.use("/api", supportRouter);
app.use("/api", tipsRouter);
app.use("/api", analyzeRouter);
app.use("/", authRouter); // auth routes: /auth/tiktok/token

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`✅ ZawIA API running on port ${PORT}`);
});

export default app;
