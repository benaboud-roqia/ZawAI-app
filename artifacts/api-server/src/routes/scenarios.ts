import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type ScenarioRequest = {
  niche?: string;
  topic?: string;
  duration?: number;
  platform?: string;
};

router.post("/scenarios/generate", async (req, res) => {
  const body = (req.body ?? {}) as ScenarioRequest;
  const niche = body.niche || "Lifestyle";
  const topic = body.topic || "";
  const duration = body.duration ?? 30;
  const platform = body.platform || "TikTok";

  const prompt = `Tu es directeur de la photographie. Génère un scénario de tournage cinématographique pour un créateur ZawyaAI.

Niche : ${niche}
Sujet précis : ${topic || "libre, choisis un angle accrocheur"}
Durée totale visée : ${duration} secondes
Plateforme : ${platform}

Retourne UNIQUEMENT du JSON strict (sans markdown ni \`\`\`), au format :
{
  "title": "Titre court accrocheur (max 8 mots)",
  "hook": "Phrase d'accroche pour les 2 premières secondes",
  "totalDuration": ${duration},
  "suggestedLut": "Teal & Orange|Cinema Noir|Golden Hour|Cyberpunk|Vintage 70s|Punch|Soft Pastel",
  "musicMood": "Description courte de la musique idéale (rythme, ambiance)",
  "shots": [
    {
      "n": 1,
      "duration": 3,
      "shotType": "Gros plan|Plan moyen|Plan large|Plan américain|Très gros plan|Plan d'ensemble",
      "angle": "Eye level|High angle|Low angle|Dutch angle|Top shot|Over shoulder|POV|Worm eye",
      "movement": "Statique|Travelling avant|Travelling arrière|Pano gauche|Pano droite|Tilt up|Tilt down|Handheld",
      "description": "Ce qu'on filme, action et cadrage en 1 phrase",
      "transition": "Cut|Fondu|Whip pan|Match cut|Snap zoom|Glitch"
    }
  ],
  "tips": ["3 conseils techniques courts pour réussir ce tournage"]
}

Le scénario doit avoir 4 à 7 plans qui totalisent environ ${duration} secondes. Chaque description en français, concrète et tournable.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
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

router.post("/schedule/optimal-times", async (req, res) => {
  const body = (req.body ?? {}) as { platforms?: string[]; timezone?: string };
  const platforms = body.platforms ?? ["instagram", "tiktok"];
  const timezone = body.timezone || "Africa/Algiers";

  const prompt = `Pour un créateur de contenu basé en ${timezone}, donne les 3 meilleurs créneaux horaires de publication aujourd'hui pour chacune des plateformes suivantes : ${platforms.join(", ")}.

Retourne UNIQUEMENT du JSON strict, sans markdown :
{
  "platforms": [
    {
      "id": "instagram",
      "name": "Instagram",
      "slots": [
        { "time": "12:30", "score": 92, "reason": "Pause déjeuner, fort scroll mobile" }
      ]
    }
  ]
}

Sois concis (raison en 6 mots max) et réaliste pour le fuseau horaire ${timezone}.`;

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

export default router;
