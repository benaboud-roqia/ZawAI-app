import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

export const tipsRouter = Router();

const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "",
});

tipsRouter.post("/tips/generate", async (req, res) => {
  const { context = {} } = req.body ?? {};

  const prompt = `Génère exactement 3 conseils créatifs et techniques courts pour un créateur de contenu utilisant l'application mobile ZawyaAI (caméra cinématographique + publication multi-plateformes).

Contexte du créateur :
- Publications totales : ${context.publishedCount ?? 0}
- Score viral moyen : ${context.avgScore ?? "—"}
- LUTs récemment utilisés : ${context.recentLuts?.join(", ") || "aucun"}
- Plateformes récentes : ${context.recentPlatforms?.join(", ") || "aucune"}

Retourne UNIQUEMENT du JSON strict, sans markdown :
{
  "tips": [
    { "title": "Titre court (max 6 mots)", "body": "Conseil actionnable de 1-2 phrases.", "icon": "camera|sun|trending-up|edit-3|play|target|zap|aperture", "category": "Cadrage|Étalonnage|Audience|Timing|Performance" }
  ]
}

Les conseils doivent être concrets, en français, professionnels et adaptés au contexte.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleaned);
    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});
