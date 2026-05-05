/**
 * exposureAI.ts
 * Fournit des paramètres d'exposition recommandés selon l'occasion.
 * L'analyse réelle de l'image est faite par Claude Vision (cameraAI.ts).
 * Ce module sert de fallback et de référence pour le score local.
 */

export type ExposureResult = {
  exposure: "dark" | "good" | "bright" | "overexposed";
  isoSuggestion: number;
  shutterSuggestion: string;
  recommendation: string;
  score: number; // 0-100
};

/**
 * Retourne des paramètres d'exposition neutres et corrects.
 * Utilisé uniquement comme fallback avant la première réponse de l'API Claude.
 */
export function analyzeExposure(_hour?: number): ExposureResult {
  return {
    exposure: "good",
    isoSuggestion: 400,
    shutterSuggestion: "1/120",
    recommendation: "Analyse en cours…",
    score: 75,
  };
}
