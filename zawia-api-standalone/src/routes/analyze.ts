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
 * Analyse en temps réel pour la caméra (input: frame caméra, output: conseils DOP)
 * Body: { imageBase64: string }
 * 
 * Output format basé sur le modèle DOP (Director of Photography):
 * - angle: Type d'angle (Eye Level, High Angle, Low Angle, Bird's Eye, Dutch Angle, Over Shoulder, POV)
 * - iso: Sensibilité ISO recommandée (100, 200, 400, 800, 1600, 3200)
 * - speed: Vitesse d'obturation (1/30, 1/60, 1/120, 1/250, 1/500, 1/1000)
 * - wb: Balance des blancs en Kelvin (2500K-10000K)
 * - shot_type: Type de plan (ECU, CU, MCU, MS, MLS, LS)
 * - lighting: Qualité d'éclairage (Excellent, Good, Fair, Poor)
 * - guidance: Conseils principaux (Exposure, Composition, Focus)
 * - lighting_pct: Pourcentage de lumière (0-100)
 * - quality_score: Score de qualité global (0-100)
 */
analyzeRouter.post("/analyze/frame", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    return res.status(400).json({ message: "imageBase64 requis" });
  }

  const prompt = `Tu es un directeur de la photographie (DOP) expert. Analyse cette image de caméra en temps réel et fournis des recommandations techniques précises.

Réponds UNIQUEMENT en JSON strict, sans markdown :
{
  "angle": "Eye Level",
  "iso": "400",
  "speed": "1/120",
  "wb": "5600K",
  "shot_type": "MS",
  "lighting": "Good",
  "guidance": ["Augmente légèrement l'exposition", "Sujet bien cadré"],
  "lighting_pct": 75,
  "quality_score": 82
}

RÈGLES STRICTES :
- angle: UNIQUEMENT parmi ["Eye Level", "High Angle", "Low Angle", "Bird's Eye", "Dutch Angle", "Over Shoulder", "POV"]
- iso: UNIQUEMENT parmi ["100", "200", "400", "800", "1600", "3200"]
- speed: UNIQUEMENT parmi ["1/30", "1/60", "1/120", "1/250", "1/500", "1/1000"]
- wb: Valeur en Kelvin entre 2500K et 10000K (ex: "5600K")
- shot_type: UNIQUEMENT parmi ["ECU", "CU", "MCU", "MS", "MLS", "LS"]
  * ECU = Extreme Close-Up (très gros plan)
  * CU = Close-Up (gros plan)
  * MCU = Medium Close-Up (plan rapproché)
  * MS = Medium Shot (plan moyen)
  * MLS = Medium Long Shot (plan demi-ensemble)
  * LS = Long Shot (plan d'ensemble)
- lighting: UNIQUEMENT parmi ["Excellent", "Good", "Fair", "Poor"]
- guidance: Array de 2-3 conseils courts en français
- lighting_pct: Nombre entre 0 et 100 (pourcentage de lumière disponible)
- quality_score: Nombre entre 0 et 100 (score de qualité global)

Analyse l'image et fournis des recommandations techniques précises basées sur les conditions réelles.`;

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
      
      // Validation et fallback pour chaque champ
      const validAngles = ["Eye Level", "High Angle", "Low Angle", "Bird's Eye", "Dutch Angle", "Over Shoulder", "POV"];
      const validISO = ["100", "200", "400", "800", "1600", "3200"];
      const validSpeed = ["1/30", "1/60", "1/120", "1/250", "1/500", "1/1000"];
      const validShotTypes = ["ECU", "CU", "MCU", "MS", "MLS", "LS"];
      const validLighting = ["Excellent", "Good", "Fair", "Poor"];
      
      if (!validAngles.includes(parsed.angle)) parsed.angle = "Eye Level";
      if (!validISO.includes(parsed.iso)) parsed.iso = "400";
      if (!validSpeed.includes(parsed.speed)) parsed.speed = "1/120";
      if (!validShotTypes.includes(parsed.shot_type)) parsed.shot_type = "MS";
      if (!validLighting.includes(parsed.lighting)) parsed.lighting = "Good";
      if (typeof parsed.lighting_pct !== "number") parsed.lighting_pct = 75;
      if (typeof parsed.quality_score !== "number") parsed.quality_score = 75;
      if (!Array.isArray(parsed.guidance)) parsed.guidance = ["Continue comme ça"];
      
    } catch (parseError) {
      console.error("[Parse error]", parseError);
      // Fallback complet si le parsing échoue
      parsed = {
        angle: "Eye Level",
        iso: "400",
        speed: "1/120",
        wb: "5600K",
        shot_type: "MS",
        lighting: "Good",
        guidance: ["Analyse en cours...", "Maintenez la position"],
        lighting_pct: 75,
        quality_score: 75,
      };
    }

    return res.json(parsed);
  } catch (err) {
    console.error("[Analyze Frame]", err);
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});
