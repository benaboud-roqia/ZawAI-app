/**
 * TikTok OAuth routes
 * POST /auth/tiktok/token  — échange le code contre un access_token et retourne le profil
 */

import express from "express";

const router = express.Router();

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;

/**
 * POST /auth/tiktok/token
 * Body: { code, code_verifier, redirect_uri }
 */
router.post("/auth/tiktok/token", async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body as {
    code?: string;
    code_verifier?: string;
    redirect_uri?: string;
  };

  if (!code || !code_verifier || !redirect_uri) {
    res.status(400).json({ message: "Paramètres manquants: code, code_verifier, redirect_uri" });
    return;
  }

  try {
    // 1. Échanger le code contre un access_token
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri,
        code_verifier,
      }).toString(),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      open_id?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token || !tokenData.open_id) {
      console.error("[TikTok token error]", tokenData);
      res.status(400).json({
        message: tokenData.error_description ?? "Impossible d'obtenir le token TikTok",
      });
      return;
    }

    // 2. Récupérer le profil utilisateur
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const userData = (await userRes.json()) as {
      data?: {
        user?: {
          open_id: string;
          union_id: string;
          avatar_url: string;
          display_name: string;
        };
      };
      error?: { code: string; message: string };
    };

    if (!userData.data?.user) {
      console.error("[TikTok user error]", userData);
      res.status(400).json({ message: "Impossible de récupérer le profil TikTok" });
      return;
    }

    res.json({
      user: userData.data.user,
      access_token: tokenData.access_token,
    });
  } catch (err) {
    console.error("[TikTok auth]", err);
    res.status(500).json({ message: "Erreur serveur TikTok OAuth" });
  }
});

export { router as authRouter };
