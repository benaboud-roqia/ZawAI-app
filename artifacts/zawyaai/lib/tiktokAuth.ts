/**
 * TikTok OAuth 2.0 - Login Kit
 * Client Key: awdk06vcd2c1gc44
 * Docs: https://developers.tiktok.com/doc/login-kit-web
 */

import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const TIKTOK_CLIENT_KEY = process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY ?? "awdk06vcd2c1gc44";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://zawia-api.onrender.com";

// Redirect URI enregistré dans TikTok Developer Portal
// Format: zawyaai://auth/tiktok/callback
const REDIRECT_URI = Linking.createURL("auth/tiktok/callback");

export type TikTokUser = {
  open_id: string;
  union_id: string;
  avatar_url: string;
  display_name: string;
};

/**
 * Génère un code_verifier aléatoire pour PKCE
 */
async function generateCodeVerifier(): Promise<string> {
  const random = await Crypto.getRandomBytesAsync(32);
  return btoa(String.fromCharCode(...random))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Génère le code_challenge SHA-256 depuis le verifier
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Lance le flow OAuth TikTok Login Kit
 * Retourne les infos utilisateur ou null si annulé
 */
export async function loginWithTikTok(): Promise<TikTokUser | null> {
  try {
    // 1. Générer PKCE
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = await generateCodeVerifier(); // anti-CSRF

    // 2. Construire l'URL d'autorisation TikTok
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      response_type: "code",
      scope: "user.info.basic",
      redirect_uri: REDIRECT_URI,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

    // 3. Ouvrir le navigateur TikTok
    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) {
      return null;
    }

    // 4. Extraire le code depuis l'URL de retour
    const returnUrl = new URL(result.url);
    const code = returnUrl.searchParams.get("code");
    const returnedState = returnUrl.searchParams.get("state");

    if (!code || returnedState !== state) {
      throw new Error("Réponse TikTok invalide");
    }

    // 5. Échanger le code contre un token via notre API backend
    const response = await fetch(`${API_URL}/auth/tiktok/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Erreur échange token TikTok");
    }

    const data = await response.json();
    return data.user as TikTokUser;
  } catch (error) {
    console.error("[TikTok Auth]", error);
    throw error;
  }
}
