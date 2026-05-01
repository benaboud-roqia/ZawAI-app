import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type AnalyzeRequest = {
  imageBase64?: string;   // base64 de la photo
  occasion?: string;      // selfie, wedding, etc.
  platform?: string;      // instagram, tiktok, etc.
};

router.post("/analyze/photo", async (req, res) => {
  const body = (req.body ?? {}) as AnalyzeRequest;

  if (!body.imageBase64) {
    return res.status(400).json({ error: "missing_image" });
  }

  const prompt = `Tu es un directeur photo professionnel. Analyse cette photo prise avec un smartphone.

Contexte : occasion="${body.occasion ?? "général"}", plateforme cible="${body.platform ?? "instagram"}"

Réponds UNIQUEMENT en JSON strict sans markdown :
{
  "score": 82,
  "lighting": { "score": 80, "state": "good|medium|bad", "message": "Message court en français" },
  "composition": { "score": 90, "state": "good|medium|bad", "message": "Message court en français" },
  "focus": { "score": 70, "state": "good|medium|bad", "message": "Message court en français" },
  "colors": { "score": 75, "state": "good|medium|bad", "message": "Message court en français" },
  "guidance": { "state": "good|medium|bad", "text": "Conseil principal en 1 phrase", "lightPct": 85 },
  "suggestions": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "angle": "Eye Level|High|Low|Top Shot",
  "iso": "200",
  "speed": "1/120",
  "wb": "5600K"
}

Sois précis et concis. Score global = moyenne pondérée des 4 critères.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: body.imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleaned);
    return res.json(json);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: "ai_failed", message: error.message ?? "unknown" });
  }
});

export default router;
