/**
 * OAuth routes for TikTok, Facebook, Instagram
 */

import express from "express";

const router = express.Router();

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;

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

/**
 * POST /auth/facebook/token
 * Body: { code, redirect_uri }
 */
router.post("/auth/facebook/token", async (req, res) => {
  const { code, redirect_uri } = req.body as {
    code?: string;
    redirect_uri?: string;
  };

  if (!code || !redirect_uri) {
    res.status(400).json({ message: "Paramètres manquants: code, redirect_uri" });
    return;
  }

  try {
    // 1. Échanger le code contre un access_token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        code,
        redirect_uri,
      }).toString()
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: { message: string };
    };

    if (!tokenData.access_token) {
      console.error("[Facebook token error]", tokenData);
      res.status(400).json({
        message: tokenData.error?.message ?? "Impossible d'obtenir le token Facebook",
      });
      return;
    }

    // 2. Récupérer le profil utilisateur
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    );

    const user = await userRes.json();

    if (!user.id) {
      console.error("[Facebook user error]", user);
      res.status(400).json({ message: "Impossible de récupérer le profil Facebook" });
      return;
    }

    res.json({ user, access_token: tokenData.access_token });
  } catch (err) {
    console.error("[Facebook auth]", err);
    res.status(500).json({ message: "Erreur serveur Facebook OAuth" });
  }
});

/**
 * POST /auth/instagram/token
 * Body: { code, redirect_uri }
 */
router.post("/auth/instagram/token", async (req, res) => {
  const { code, redirect_uri } = req.body as {
    code?: string;
    redirect_uri?: string;
  };

  if (!code || !redirect_uri) {
    res.status(400).json({ message: "Paramètres manquants: code, redirect_uri" });
    return;
  }

  try {
    // Instagram Basic Display API
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri,
        code,
      }).toString(),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      user_id?: string;
      error_message?: string;
    };

    if (!tokenData.access_token) {
      console.error("[Instagram token error]", tokenData);
      res.status(400).json({
        message: tokenData.error_message ?? "Impossible d'obtenir le token Instagram",
      });
      return;
    }

    // Récupérer le profil
    const userRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
    );

    const user = await userRes.json();

    if (!user.id) {
      console.error("[Instagram user error]", user);
      res.status(400).json({ message: "Impossible de récupérer le profil Instagram" });
      return;
    }

    res.json({ user, access_token: tokenData.access_token });
  } catch (err) {
    console.error("[Instagram auth]", err);
    res.status(500).json({ message: "Erreur serveur Instagram OAuth" });
  }
});

export { router as authRouter };
