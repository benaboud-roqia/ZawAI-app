/**
 * Chargily Pay Integration Routes
 * Documentation: https://dev.chargily.com/pay-v2/
 */

import express from "express";
import crypto from "crypto";

const router = express.Router();

const CHARGILY_API_KEY = process.env.CHARGILY_SECRET_KEY!;
const CHARGILY_API_URL = "https://pay.chargily.net/api/v2";
const WEBHOOK_SECRET = process.env.CHARGILY_WEBHOOK_SECRET || "zawia_webhook_secret_2026";

/**
 * POST /api/payment/create-checkout
 * Créer une session de paiement Chargily
 * Body: { plan: "pro" | "studio", period: "monthly" | "yearly", user_id: string, user_email: string }
 */
router.post("/payment/create-checkout", async (req, res) => {
  const { plan, period, user_id, user_email } = req.body as {
    plan?: "pro" | "studio";
    period?: "monthly" | "yearly";
    user_id?: string;
    user_email?: string;
  };

  if (!plan || !period || !user_id || !user_email) {
    res.status(400).json({
      message: "Paramètres manquants: plan, period, user_id, user_email",
    });
    return;
  }

  // Définir les prix en centimes (DA)
  const prices: Record<string, Record<string, number>> = {
    pro: {
      monthly: 50000, // 500 DA
      yearly: 500000, // 5,000 DA
    },
    studio: {
      monthly: 150000, // 1,500 DA
      yearly: 1500000, // 15,000 DA
    },
  };

  const amount = prices[plan]?.[period];
  if (!amount) {
    res.status(400).json({ message: "Plan ou période invalide" });
    return;
  }

  // Créer un ID de commande unique
  const order_id = `zawia_${plan}_${period}_${user_id}_${Date.now()}`;

  try {
    // Créer une session de paiement Chargily
    const response = await fetch(`${CHARGILY_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHARGILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "dzd",
        success_url: "zawyaai://payment/success",
        failure_url: "zawyaai://payment/failure",
        webhook_url: "https://zawai-app.onrender.com/api/payment/webhook",
        description: `ZawIA ${plan === "pro" ? "Pro" : "Studio"} - ${period === "monthly" ? "Mensuel" : "Annuel"}`,
        locale: "fr",
        metadata: {
          order_id,
          user_id,
          user_email,
          plan,
          period,
        },
      }),
    });

    const data = (await response.json()) as {
      id?: string;
      checkout_url?: string;
      message?: string;
    };

    if (!data.checkout_url) {
      console.error("[Chargily checkout error]", data);
      res.status(400).json({
        message: data.message ?? "Impossible de créer la session de paiement",
      });
      return;
    }

    res.json({
      checkout_id: data.id,
      checkout_url: data.checkout_url,
      order_id,
    });
  } catch (err) {
    console.error("[Chargily checkout]", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du paiement" });
  }
});

/**
 * POST /api/payment/webhook
 * Webhook Chargily pour confirmer les paiements
 */
router.post("/payment/webhook", async (req, res) => {
  try {
    // Vérifier la signature du webhook
    const signature = req.headers["signature"] as string;
    const payload = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Webhook] Signature invalide");
      res.status(401).json({ message: "Signature invalide" });
      return;
    }

    const event = req.body as {
      type?: string;
      data?: {
        id: string;
        status: string;
        amount: number;
        metadata: {
          order_id: string;
          user_id: string;
          user_email: string;
          plan: string;
          period: string;
        };
      };
    };

    console.log("[Webhook] Event reçu:", event.type);

    // Traiter l'événement de paiement réussi
    if (event.type === "checkout.paid" && event.data) {
      const { metadata, status, amount } = event.data;

      console.log("[Webhook] Paiement réussi:", {
        order_id: metadata.order_id,
        user_id: metadata.user_id,
        plan: metadata.plan,
        period: metadata.period,
        amount,
        status,
      });

      // TODO: Mettre à jour la base de données
      // - Activer le plan pour l'utilisateur
      // - Enregistrer la transaction
      // - Envoyer un email de confirmation

      // Pour l'instant, on log juste
      console.log(`✅ Plan ${metadata.plan} activé pour user ${metadata.user_id}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[Webhook error]", err);
    res.status(500).json({ message: "Erreur webhook" });
  }
});

/**
 * GET /api/payment/verify/:checkout_id
 * Vérifier le statut d'un paiement
 */
router.get("/payment/verify/:checkout_id", async (req, res) => {
  const { checkout_id } = req.params;

  if (!checkout_id) {
    res.status(400).json({ message: "checkout_id manquant" });
    return;
  }

  try {
    const response = await fetch(`${CHARGILY_API_URL}/checkouts/${checkout_id}`, {
      headers: {
        Authorization: `Bearer ${CHARGILY_API_KEY}`,
      },
    });

    const data = (await response.json()) as {
      id?: string;
      status?: string;
      amount?: number;
      metadata?: Record<string, string>;
      message?: string;
    };

    if (!data.id) {
      console.error("[Chargily verify error]", data);
      res.status(400).json({
        message: data.message ?? "Impossible de vérifier le paiement",
      });
      return;
    }

    res.json({
      checkout_id: data.id,
      status: data.status,
      amount: data.amount,
      metadata: data.metadata,
    });
  } catch (err) {
    console.error("[Chargily verify]", err);
    res.status(500).json({ message: "Erreur serveur lors de la vérification" });
  }
});

/**
 * GET /api/payment/plans
 * Obtenir la liste des plans disponibles
 */
router.get("/payment/plans", (_req, res) => {
  res.json({
    plans: [
      {
        id: "free",
        name: "Gratuit",
        price: {
          monthly: 0,
          yearly: 0,
        },
        features: [
          "10 analyses IA par jour",
          "Fonctionnalités de base",
          "Publicités",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: {
          monthly: 500, // DA
          yearly: 5000, // DA (économie de 1,000 DA)
        },
        features: [
          "Analyses IA illimitées",
          "Export PDF",
          "Pas de publicités",
          "Support prioritaire",
        ],
        popular: true,
      },
      {
        id: "studio",
        name: "Studio",
        price: {
          monthly: 1500, // DA
          yearly: 15000, // DA (économie de 3,000 DA)
        },
        features: [
          "Tout du Plan Pro",
          "Collaboration en équipe",
          "Statistiques avancées",
          "Publication automatique",
          "Support 24/7",
        ],
      },
    ],
  });
});

export { router as paymentRouter };
