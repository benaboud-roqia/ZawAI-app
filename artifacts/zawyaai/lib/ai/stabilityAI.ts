/**
 * stabilityAI.ts
 * Analyse la stabilité — version sans expo-sensors
 * Le gyroscope sera activé après génération de l'APK natif
 */

export type StabilityResult = {
  isStable: boolean;
  tiltX: number;
  tiltY: number;
  recommendation: string;
  state: "good" | "medium" | "bad";
};

const STABLE_RESULT: StabilityResult = {
  isStable: true,
  tiltX: 0,
  tiltY: 0,
  recommendation: "Téléphone stable ✅",
  state: "good",
};

// Stub — sera remplacé par le vrai gyroscope dans l'APK natif
export function startStabilityMonitor(
  onUpdate: (result: StabilityResult) => void
) {
  // Simule une stabilité correcte
  onUpdate(STABLE_RESULT);
}

export function stopStabilityMonitor() {
  // Rien à faire en mode web/Expo Go
}
