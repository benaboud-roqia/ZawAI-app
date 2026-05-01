import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

export const captionsRouter = Router();

const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "",
});

captionsRouter.post("/captions/generate", async (req, res) => {
  const {
    platforms = ["instagram"],
    topic = "Capture cinématographique réalisée avec ZawyaAI",
    language = "fr",
    tone = "inspirant",
  } = req.body ?? {};

  const prompt = `Tu es un expert en marketing de contenu pour réseaux sociaux. Génère des légendes optimisées pour chaque plateforme demandée.

Sujet du contenu : "${topic}"
Langue : ${language}
Ton : ${tone}
Plateformes : ${platforms.join(", ")}

Règles :
- Instagram : 1-2 phrases percutantes + emoji subtils, max 2200 caractères
- TikTok : très court (max 150 chars), accrocheur, hook fort
- Snapchat : ultra court, jeune et fun
- YouTube Shorts : phrase d'accroche claire qui invite au visionnage
- Facebook : ton conversationnel, peut être plus long (2-3 phrases)
- X (Twitter) : punchy, max 280 chars, 1 idée forte

Pour chaque plateforme, fournis aussi 5 hashtags pertinents.

Réponds UNIQUEMENT en JSON valide, sans markdown :
{"results":[{"platform":"instagram","caption":"...","hashtags":["#x","#y"]}]}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";

    let parsed: { results?: unknown[] } | null = null;
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      }
    } catch {
      parsed = null;
    }

    if (!parsed?.results || !Array.isArray(parsed.results)) {
      return res.status(502).json({ error: "invalid_ai_response", raw: text.slice(0, 400) });
    }

    return res.json({ results: parsed.results });
  } catch (err) {
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});
