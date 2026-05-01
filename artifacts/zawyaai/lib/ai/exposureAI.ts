/**
 * exposureAI.ts
 * Analyse l'exposition d'une image via son URI
 * Utilise un canvas web ou une estimation basée sur les métadonnées
 */

export type ExposureResult = {
  exposure: "dark" | "good" | "bright" | "overexposed";
  isoSuggestion: number;
  shutterSuggestion: string;
  recommendation: string;
  score: number; // 0-100
};

/**
 * Simule l'analyse d'exposition basée sur l'heure et les conditions
 * En production : utiliser react-native-image-colors ou canvas
 */
export function analyzeExposure(hour?: number): ExposureResult {
  const h = hour ?? new Date().getHours();

  // Heure dorée : 6-9h et 17-20h
  if ((h >= 6 && h <= 9) || (h >= 17 && h <= 20)) {
    return {
      exposure: "good",
      isoSuggestion: 200,
      shutterSuggestion: "1/120",
      recommendation: "Lumière dorée parfaite 🌅",
      score: 92,
    };
  }

  // Nuit : 21h-5h
  if (h >= 21 || h <= 5) {
    return {
      exposure: "dark",
      isoSuggestion: 1600,
      shutterSuggestion: "1/30",
      recommendation: "Trop sombre — augmente l'ISO ou ajoute de la lumière",
      score: 35,
    };
  }

  // Midi : trop lumineux
  if (h >= 11 && h <= 14) {
    return {
      exposure: "bright",
      isoSuggestion: 100,
      shutterSuggestion: "1/500",
      recommendation: "Lumière dure — cherche de l'ombre ou utilise un diffuseur",
      score: 65,
    };
  }

  // Conditions normales
  return {
    exposure: "good",
    isoSuggestion: 400,
    shutterSuggestion: "1/120",
    recommendation: "L'éclairage est excellent 👌",
    score: 88,
  };
}
