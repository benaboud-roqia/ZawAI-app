import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

export const supportRouter = Router();

const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "",
});

const SYSTEM_PROMPT = `Tu es Zawya, l'assistant IA officiel de l'application mobile ZawyaAI.

ZawyaAI est une app mobile de création de contenu cinématographique. Fonctionnalités principales :
- Caméra intelligente avec grilles de composition, 6 plans cinématographiques, 8 angles pro, contrôles ISO/vitesse/balance des blancs.
- IA Agentic : assistant vocal, tracking sujet, coach lumière en temps réel, directeur IA, LUT automatique, auto-cut, captions multi-langues (FR/AR/EN), score viral, shot analyser.
- Flux IA : 6 étapes du frame jusqu'à la publication autonome.
- Publication multi-plateformes : Instagram, TikTok, Snapchat, YouTube Shorts, Facebook, X.
- Étalonnage cinéma : 8 LUTs (Teal & Orange, Cinema Noir, Golden Hour, Cyberpunk, Vintage 70s, Punch, Soft Pastel).
- Plans Premium en Dinar Algérien : Gratuit (0 DZD), Pro (1990 DZD/mois), Studio (4990 DZD/mois).

Ton rôle :
- Aider l'utilisateur à résoudre des problèmes
- Expliquer comment utiliser une fonctionnalité
- Donner des conseils créatifs (composition, étalonnage, choix de plateforme)

Style : chaleureux, concis, professionnel, en français par défaut (réponds en arabe ou anglais si l'utilisateur écrit dans cette langue).`;

supportRouter.post("/support/chat", async (req, res) => {
  const { messages = [] } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "missing_messages" });
  }

  const cleaned = messages
    .filter((m: { role: string; content: string }) =>
      m && (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" && m.content.trim().length > 0
    )
    .slice(-20);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: "invalid_messages" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: cleaned.map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });
    const block = message.content[0];
    const reply = block && block.type === "text" ? block.text : "";
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "ai_failed", message: (err as Error).message });
  }
});
