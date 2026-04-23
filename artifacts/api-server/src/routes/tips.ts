import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type TipsRequest = {
  context?: {
    recentLuts?: string[];
    recentPlatforms?: string[];
    avgScore?: number;
    publishedCount?: number;
  };
};

router.post("/tips/generate", async (req, res) => {
  const body = (req.body ?? {}) as TipsRequest;
  const ctx = body.context ?? {};

  const userPrompt = `Génère exactement 3 conseils créatifs et techniques courts pour un créateur de contenu utilisant l'application mobile ZawyaAI (caméra cinématographique + publication multi-plateformes).

Contexte du créateur :
- Publications totales : ${ctx.publishedCount ?? 0}
- Score viral moyen : ${ctx.avgScore ?? "—"}
- LUTs récemment utilisés : ${ctx.recentLuts?.join(", ") || "aucun"}
- Plateformes récentes : ${ctx.recentPlatforms?.join(", ") || "aucune"}

Retourne UNIQUEMENT du JSON strict, sans markdown ni texte autour, au format :
{
  "tips": [
    { "title": "Titre court (max 6 mots)", "body": "Conseil actionnable de 1-2 phrases.", "icon": "camera|sun|trending-up|edit-3|play|target|zap|aperture", "category": "Cadrage|Étalonnage|Audience|Timing|Performance" }
  ]
}

Les conseils doivent être concrets, en français, professionnels et adaptés au contexte ci-dessus.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleaned);
    return res.json(json);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: "ai_failed", message: error.message });
  }
});

export default router;
