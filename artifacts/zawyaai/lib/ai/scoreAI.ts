/**
 * scoreAI.ts
 * Calcule le score global IA en combinant tous les modules
 */

import type { ExposureResult } from "./exposureAI";
import type { StabilityResult } from "./stabilityAI";
import type { CompositionResult } from "./compositionAI";

export type GlobalScore = {
  finalScore: number;
  quality: "Excellent" | "Bien" | "Moyen" | "À améliorer";
  qualityColor: string;
  guidance: {
    state: "good" | "medium" | "bad";
    text: string;
    lightPct: number;
    color: string;
    bg: string;
  };
  params: {
    angle: string;
    iso: string;
    speed: string;
    wb: string;
  };
  overlay: string[]; // messages overlay temps réel
};

export function computeGlobalScore(
  exposure: ExposureResult,
  stability: StabilityResult,
  composition: CompositionResult,
): GlobalScore {
  // Pondération : exposition 35%, composition 35%, stabilité 30%
  const finalScore = Math.round(
    exposure.score * 0.35 +
    composition.score * 0.35 +
    (stability.isStable ? 90 : 40) * 0.30
  );

  const quality =
    finalScore >= 85 ? "Excellent" :
    finalScore >= 70 ? "Bien" :
    finalScore >= 55 ? "Moyen" : "À améliorer";

  const qualityColor =
    finalScore >= 85 ? "#22C55E" :
    finalScore >= 70 ? "#4DC8E8" :
    finalScore >= 55 ? "#F59E0B" : "#EF4444";

  // Guidance principale — priorité au problème le plus grave
  let guidanceState: "good" | "medium" | "bad" = "good";
  let guidanceText = "L'éclairage est excellent 👌";
  let lightPct = exposure.score;

  if (!stability.isStable) {
    guidanceState = "bad";
    guidanceText = stability.recommendation;
    lightPct = 30;
  } else if (exposure.exposure === "dark") {
    guidanceState = "bad";
    guidanceText = "Rapproche-toi de la lumière 💡";
    lightPct = 38;
  } else if (exposure.exposure === "overexposed") {
    guidanceState = "medium";
    guidanceText = "Trop lumineux — cherche de l'ombre";
    lightPct = 95;
  } else if (exposure.exposure === "bright") {
    guidanceState = "medium";
    guidanceText = "Remonte légèrement la caméra";
    lightPct = 65;
  } else if (composition.state === "medium") {
    guidanceState = "medium";
    guidanceText = composition.recommendation;
    lightPct = exposure.score;
  }

  const guidanceColors = {
    good:   { color: "#22C55E", bg: "rgba(34,197,94,0.15)"   },
    medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
    bad:    { color: "#EF4444", bg: "rgba(239,68,68,0.15)"   },
  };

  // Overlay messages
  const overlay: string[] = [];
  if (!stability.isStable) overlay.push("⚠️ " + stability.recommendation);
  if (exposure.exposure === "dark") overlay.push("⚠️ Trop sombre");
  if (exposure.exposure === "overexposed") overlay.push("⚠️ Surexposé");
  if (composition.state !== "good") overlay.push("📐 " + composition.recommendation);
  if (overlay.length === 0) overlay.push("✅ Bonne composition");

  return {
    finalScore,
    quality,
    qualityColor,
    guidance: {
      state: guidanceState,
      text: guidanceText,
      lightPct,
      ...guidanceColors[guidanceState],
    },
    params: {
      angle: composition.angle,
      iso: String(exposure.isoSuggestion),
      speed: exposure.shutterSuggestion,
      wb: "5600K",
    },
    overlay,
  };
}
