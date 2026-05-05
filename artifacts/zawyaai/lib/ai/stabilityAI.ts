/**
 * stabilityAI.ts
 * Analyse la stabilité via expo-sensors (Gyroscope + Accelerometer)
 * Fonctionne dans l'APK natif. Fallback gracieux en Expo Go / web.
 */

import { Accelerometer } from "expo-sensors";

export type StabilityResult = {
  isStable: boolean;
  tiltX: number;
  tiltY: number;
  recommendation: string;
  state: "good" | "medium" | "bad";
};

// Seuils de détection de mouvement (en g)
const SHAKE_THRESHOLD = 0.25;   // mouvement fort → instable
const TILT_THRESHOLD  = 0.18;   // inclinaison modérée → avertissement

let _subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

// Fenêtre glissante pour lisser les valeurs (évite les faux positifs)
const WINDOW_SIZE = 5;
const _window: Array<{ x: number; y: number; z: number }> = [];

function classify(x: number, y: number, z: number): StabilityResult {
  const motion = Math.sqrt(x * x + y * y + (z - 1) * (z - 1));

  if (motion > SHAKE_THRESHOLD) {
    return {
      isStable: false,
      tiltX: x,
      tiltY: y,
      recommendation: "Stabilise le téléphone ⚠️",
      state: "bad",
    };
  }

  if (Math.abs(x) > TILT_THRESHOLD || Math.abs(y) > TILT_THRESHOLD) {
    return {
      isStable: true,
      tiltX: x,
      tiltY: y,
      recommendation: "Redresse légèrement le téléphone",
      state: "medium",
    };
  }

  return {
    isStable: true,
    tiltX: x,
    tiltY: y,
    recommendation: "Téléphone stable ✅",
    state: "good",
  };
}

export function startStabilityMonitor(
  onUpdate: (result: StabilityResult) => void
): void {
  try {
    Accelerometer.setUpdateInterval(300); // 300ms = ~3 fps, économe en batterie

    _subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Fenêtre glissante
      _window.push({ x, y, z });
      if (_window.length > WINDOW_SIZE) _window.shift();

      // Moyenne lissée
      const avg = _window.reduce(
        (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }),
        { x: 0, y: 0, z: 0 }
      );
      const n = _window.length;
      onUpdate(classify(avg.x / n, avg.y / n, avg.z / n));
    });
  } catch {
    // expo-sensors non disponible (Expo Go web) → fallback stable
    onUpdate({
      isStable: true,
      tiltX: 0,
      tiltY: 0,
      recommendation: "Téléphone stable ✅",
      state: "good",
    });
  }
}

export function stopStabilityMonitor(): void {
  _subscription?.remove();
  _subscription = null;
  _window.length = 0;
}
