import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type CaptionRequest = {
  platforms?: string[];
  topic?: string;
  language?: string;
  tone?: string;
};

type CaptionResult = {
  platform: string;
  caption: string;
  hashtags: string[];
};

router.post("/captions/generate", async (req, res) => {
  const body = (req.body ?? {}) as CaptionRequest;
  const platforms =
    Array.isArray(body.platforms) && body.platforms.length > 0
      ? body.platforms
      : ["instagram"];
  const topic =
    typeof body.topic === "string" && body.topic.trim().length > 0
      ? body.topic.trim()
      : "Capture cinématographique réalisée avec ZawyaAI, directeur photo IA";
  const language =
    typeof body.language === "string" && body.language ? body.language : "fr";
  const tone =
    typeof body.tone === "string" && body.tone ? body.tone : "inspirant";

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

Pour chaque plateforme, fournis aussi 5 hashtags pertinents (sans duplicate du nom de plateforme).

Réponds UNIQUEMENT en JSON valide, sans markdown, sous cette forme exacte :
{"results":[{"platform":"instagram","caption":"...","hashtags":["#x","#y"]}]}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";

    let parsed: { results?: CaptionResult[] } | null = null;
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
      return res.status(502).json({
        error: "invalid_ai_response",
        raw: text.slice(0, 400),
      });
    }

    return res.json({ results: parsed.results });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: "ai_failed", message: error.message ?? "unknown" });
  }
});

export default router;
