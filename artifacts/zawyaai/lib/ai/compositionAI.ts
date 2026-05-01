/**
 * compositionAI.ts
 * Analyse la composition selon l'occasion choisie
 */

export type CompositionResult = {
  score: number;
  recommendation: string;
  state: "good" | "medium" | "bad";
  shotType: string;
  angle: string;
};

const COMPOSITION_RULES: Record<string, CompositionResult> = {
  selfie: {
    score: 85,
    recommendation: "Cadre plan poitrine, téléphone légèrement au-dessus",
    state: "good",
    shotType: "Plan poitrine",
    angle: "High",
  },
  wedding: {
    score: 88,
    recommendation: "Règle des tiers — sujet sur le tiers gauche",
    state: "good",
    shotType: "Plan moyen",
    angle: "Eye Level",
  },
  mukbang: {
    score: 82,
    recommendation: "Caméra à hauteur de table, sujet centré",
    state: "good",
    shotType: "Plan américain",
    angle: "Légèrement High",
  },
  travel: {
    score: 80,
    recommendation: "Inclure le décor — horizon sur le tiers inférieur",
    state: "good",
    shotType: "Plan large",
    angle: "Eye Level",
  },
  cooking: {
    score: 90,
    recommendation: "Vue du dessus parfaite pour la cuisine",
    state: "good",
    shotType: "Top Shot",
    angle: "90°",
  },
  portrait: {
    score: 87,
    recommendation: "Focus sur les yeux — fond légèrement flou",
    state: "good",
    shotType: "Gros plan",
    angle: "Eye Level",
  },
  product: {
    score: 85,
    recommendation: "Fond neutre — éclairage latéral pour les textures",
    state: "good",
    shotType: "Très gros plan",
    angle: "Top Shot",
  },
  event: {
    score: 78,
    recommendation: "Capturer l'ambiance — plan large d'abord",
    state: "medium",
    shotType: "Plan d'ensemble",
    angle: "High",
  },
  sport: {
    score: 75,
    recommendation: "Angle bas pour dynamiser l'action",
    state: "medium",
    shotType: "Plan large",
    angle: "Low",
  },
  fashion: {
    score: 86,
    recommendation: "Plan pied — fond épuré recommandé",
    state: "good",
    shotType: "Plan pied",
    angle: "Eye Level",
  },
  nature: {
    score: 83,
    recommendation: "Heure dorée — règle des tiers pour l'horizon",
    state: "good",
    shotType: "Plan large",
    angle: "Eye Level",
  },
  business: {
    score: 84,
    recommendation: "Fond professionnel — éclairage uniforme",
    state: "good",
    shotType: "Plan moyen",
    angle: "Eye Level",
  },
};

export function analyzeComposition(occasion: string): CompositionResult {
  return COMPOSITION_RULES[occasion] ?? {
    score: 75,
    recommendation: "Applique la règle des tiers",
    state: "medium",
    shotType: "Plan moyen",
    angle: "Eye Level",
  };
}
