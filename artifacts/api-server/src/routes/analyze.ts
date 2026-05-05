import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type AnalyzeRequest = {
  imageBase64?: string;
  occasion?: string;
  platform?: string;
};

// ─── POST /analyze/photo ──────────────────────────────────────────────────────
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
            source: { type: "base64", media_type: "image/jpeg", data: body.imageBase64 },
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

// ─── POST /analyze/frame ──────────────────────────────────────────────────────
// Analyse en temps réel pour la caméra — retourne des conseils DOP immédiats
router.post("/analyze/frame", async (req, res) => {
  const { imageBase64, platform = "instagram", occasion = "selfie" } = (req.body ?? {}) as {
    imageBase64?: string;
    platform?: string;
    occasion?: string;
  };

  if (!imageBase64) {
    return res.status(400).json({ error: "missing_image" });
  }

  // Mapping occasion → description pour enrichir le prompt
  const occasionLabels: Record<string, string> = {
    selfie:   "selfie / portrait personnel",
    wedding:  "mariage / cérémonie",
    mukbang:  "mukbang / nourriture",
    travel:   "voyage / paysage",
    cooking:  "cuisine / recette vue du dessus",
    portrait: "portrait professionnel",
    product:  "photo produit",
    event:    "événement / soirée",
    sport:    "sport / action",
    fashion:  "mode / lookbook",
    nature:   "nature / extérieur",
    business: "professionnel / corporate",
  };
  const occasionLabel = occasionLabels[occasion] ?? occasion;

  const prompt = `Tu es un directeur de la photographie (DOP) expert en contenu pour réseaux sociaux.

CONTEXTE :
- Plateforme cible : ${platform}
- Type de contenu : ${occasionLabel}

Analyse cette image de caméra en temps réel et fournis des recommandations techniques précises et adaptées à ce contexte.

Réponds UNIQUEMENT en JSON strict, sans markdown :
{
  "angle": "Eye Level",
  "iso": "400",
  "speed": "1/120",
  "wb": "5600K",
  "shot_type": "MS",
  "lighting": "Good",
  "guidance": ["Conseil adapté au contexte 1", "Conseil adapté au contexte 2"],
  "lighting_pct": 75,
  "quality_score": 82
}

RÈGLES :
- angle: parmi ["Eye Level", "High Angle", "Low Angle", "Bird's Eye", "Dutch Angle", "Over Shoulder", "POV"]
- iso: parmi ["100", "200", "400", "800", "1600", "3200"]
- speed: parmi ["1/30", "1/60", "1/120", "1/250", "1/500", "1/1000"]
- wb: valeur Kelvin entre 2500K et 10000K (ex: "5600K")
- shot_type: parmi ["ECU", "CU", "MCU", "MS", "MLS", "LS"]
- lighting: parmi ["Excellent", "Good", "Fair", "Poor"]
- guidance: 2-3 conseils COURTS en français, SPÉCIFIQUES au type de contenu "${occasionLabel}" et à la plateforme "${platform}"
- lighting_pct: 0-100 (évalue la lumière réelle visible dans l'image)
- quality_score: 0-100 (score global tenant compte de l'adéquation avec le type de contenu)`;

  const FALLBACK = {
    angle: "Eye Level",
    iso: "400",
    speed: "1/120",
    wb: "5600K",
    shot_type: "MS",
    lighting: "Good" as const,
    guidance: ["Analyse en cours…", "Maintenez la position"],
    lighting_pct: 75,
    quality_score: 75,
  };

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    const block = message.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();

    let parsed: typeof FALLBACK;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.json(FALLBACK);
    }

    // Validation des valeurs — fallback champ par champ
    const validAngles = ["Eye Level", "High Angle", "Low Angle", "Bird's Eye", "Dutch Angle", "Over Shoulder", "POV"];
    const validISO    = ["100", "200", "400", "800", "1600", "3200"];
    const validSpeed  = ["1/30", "1/60", "1/120", "1/250", "1/500", "1/1000"];
    const validShots  = ["ECU", "CU", "MCU", "MS", "MLS", "LS"];
    const validLight  = ["Excellent", "Good", "Fair", "Poor"];

    if (!validAngles.includes(parsed.angle))    parsed.angle    = FALLBACK.angle;
    if (!validISO.includes(parsed.iso))         parsed.iso      = FALLBACK.iso;
    if (!validSpeed.includes(parsed.speed))     parsed.speed    = FALLBACK.speed;
    if (!validShots.includes(parsed.shot_type)) parsed.shot_type = FALLBACK.shot_type;
    if (!validLight.includes(parsed.lighting))  parsed.lighting  = FALLBACK.lighting;
    if (typeof parsed.lighting_pct !== "number" || parsed.lighting_pct < 0 || parsed.lighting_pct > 100)
      parsed.lighting_pct = FALLBACK.lighting_pct;
    if (typeof parsed.quality_score !== "number" || parsed.quality_score < 0 || parsed.quality_score > 100)
      parsed.quality_score = FALLBACK.quality_score;
    if (!Array.isArray(parsed.guidance) || parsed.guidance.length === 0)
      parsed.guidance = FALLBACK.guidance;

    return res.json(parsed);
  } catch (err) {
    const error = err as Error;
    console.error("[analyze/frame]", error.message);
    // Ne pas retourner 500 — retourner le fallback pour ne pas bloquer la caméra
    return res.json(FALLBACK);
  }
});

export default router;
