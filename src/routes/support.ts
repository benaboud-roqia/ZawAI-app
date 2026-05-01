import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const client = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "dummy",
});

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatRequest = { messages?: ChatMessage[] };

const SYSTEM_PROMPT = `Tu es Zawya, l'assistant IA officiel de l'application mobile ZawyaAI.

ZawyaAI est une app mobile de création de contenu cinématographique. Fonctionnalités principales :
- Caméra intelligente avec grilles de composition, 6 plans cinématographiques (général, ensemble, moyen, américain, gros plan, très gros plan), 8 angles pro (eye level, high, low, dutch, top shot, over shoulder, POV, worm eye), contrôles ISO/vitesse/balance des blancs.
- IA Agentic : assistant vocal, tracking sujet, coach lumière en temps réel, directeur IA, LUT automatique, auto-cut, captions multi-langues (FR/AR/EN), score viral, shot analyser.
- Flux IA : 6 étapes du frame jusqu'à la publication autonome.
- Publication multi-plateformes : Instagram, TikTok, Snapchat, YouTube Shorts, Facebook, X.
- Étalonnage cinéma : 8 LUTs (Teal & Orange, Cinema Noir, Golden Hour, Cyberpunk, Vintage 70s, Punch, Soft Pastel) appliqués en temps réel.
- Plans Premium en Dinar Algérien : Gratuit (0 DZD), Pro (1990 DZD/mois), Studio (4990 DZD/mois).
- Authentification email/mot de passe.

Ton rôle :
- Aider l'utilisateur à résoudre des problèmes (caméra qui ne s'ouvre pas, publication échouée, légendes IA, paiement, etc.)
- Expliquer comment utiliser une fonctionnalité
- Donner des conseils créatifs (composition, étalonnage, choix de plateforme)
- Diagnostiquer et suggérer des étapes claires

Style : chaleureux, concis, professionnel, en français par défaut (réponds en arabe ou anglais si l'utilisateur écrit dans cette langue). Utilise des listes à puces quand utile. Si tu ne peux pas résoudre, propose de contacter le support humain.`;

router.post("/support/chat", async (req, res) => {
  const body = (req.body ?? {}) as ChatRequest;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) return res.status(400).json({ error: "missing_messages" });

  const cleaned = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-20);

  if (cleaned.length === 0) return res.status(400).json({ error: "invalid_messages" });

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: cleaned.map((m) => ({ role: m.role, content: m.content })),
    });
    const block = message.content[0];
    const reply = block && block.type === "text" ? block.text : "";
    return res.json({ reply });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: "ai_failed", message: error.message ?? "unknown" });
  }
});

export default router;
