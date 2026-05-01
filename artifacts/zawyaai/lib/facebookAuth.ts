/**
 * Facebook & Instagram OAuth
 * Docs: https://developers.facebook.com/docs/facebook-login
 */

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://zawai-app.onrender.com";

// Redirect URI pour l'app mobile
const REDIRECT_URI = Linking.createURL("auth/facebook/callback");

export type FacebookUser = {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
};

/**
 * Lance le flow OAuth Facebook
 */
export async function loginWithFacebook(): Promise<FacebookUser | null> {
  try {
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "public_profile,email",
      state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) {
      return null;
    }

    const returnUrl = new URL(result.url);
    const code = returnUrl.searchParams.get("code");
    const returnedState = returnUrl.searchParams.get("state");

    if (!code || returnedState !== state) {
      throw new Error("Réponse Facebook invalide");
    }

    // Échanger le code contre un token via notre API backend
    const response = await fetch(`${API_URL}/auth/facebook/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Erreur échange token Facebook");
    }

    const data = await response.json();
    return data.user as FacebookUser;
  } catch (error) {
    console.error("[Facebook Auth]", error);
    throw error;
  }
}

/**
 * Lance le flow OAuth Instagram
 */
export async function loginWithInstagram(): Promise<{ id: string; username: string } | null> {
  try {
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID, // Instagram utilise le même App ID
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "user_profile,user_media",
      state,
    });

    const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) {
      return null;
    }

    const returnUrl = new URL(result.url);
    const code = returnUrl.searchParams.get("code");
    const returnedState = returnUrl.searchParams.get("state");

    if (!code || returnedState !== state) {
      throw new Error("Réponse Instagram invalide");
    }

    // Échanger le code via notre API backend
    const response = await fetch(`${API_URL}/auth/instagram/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Erreur échange token Instagram");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("[Instagram Auth]", error);
    throw error;
  }
}
