import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

export const analyzeRouter = Router();

const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "",
});

analyzeRouter.post("/analyze/photo", async (req, res) => {
  const { imageBase64, occasion = "général", platform = "instagram" } = req.body ?? {};

  if (!imageBase64) {
    return res.status(400).json({ error: "missing_image" });
  }

  const prompt = `Tu es un directeur photo professionnel. Analyse cette photo prise avec un smartphone.

Contexte : occasion="${occasion}", plateforme cible="${platform}"

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
}`;

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
              data: imageBase64,
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
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});

/**
 * POST /analyze/frame
 * Analyse en temps réel pour la caméra (input: frame caméra, output: conseils)
 * Body: { imageBase64: string }
 */
analyzeRouter.post("/analyze/frame", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    return res.status(400).json({ message: "imageBase64 requis" });
  }

  const prompt = `Tu es un directeur de la photographie expert. Analyse cette image de caméra en temps réel.

Réponds UNIQUEMENT en JSON strict, sans markdown :
{
  "composition": {
    "score": 85,
    "feedback": "Bon équilibre visuel, sujet bien placé"
  },
  "exposure": {
    "score": 70,
    "feedback": "Légèrement sous-exposé, augmente ISO"
  },
  "framing": {
    "score": 90,
    "feedback": "Cadrage serré efficace"
  },
  "ruleOfThirds": {
    "score": 95,
    "feedback": "Sujet sur ligne de force"
  },
  "quickTip": "Conseil rapide en 1 phrase"
}

Scores de 0 à 100. Feedback en français, max 8 mots. QuickTip en 1 phrase courte.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback si le parsing échoue
      parsed = {
        composition: { score: 75, feedback: "Analyse en cours..." },
        exposure: { score: 75, feedback: "Exposition correcte" },
        framing: { score: 75, feedback: "Cadrage standard" },
        ruleOfThirds: { score: 75, feedback: "Positionnement acceptable" },
        quickTip: "Continue comme ça !",
      };
    }

    return res.json(parsed);
  } catch (err) {
    console.error("[Analyze Frame]", err);
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});
