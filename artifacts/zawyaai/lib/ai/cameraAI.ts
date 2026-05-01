/**
 * Camera AI Analysis - Real-time frame analysis using Claude Vision API
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://zawai-app.onrender.com";

export type CameraAIAnalysis = {
  angle: string;
  iso: string;
  speed: string;
  wb: string;
  shot_type: string;
  lighting: "Excellent" | "Good" | "Fair" | "Poor";
  guidance: string[];
  lighting_pct: number;
  quality_score: number;
};

/**
 * Analyze a camera frame using Claude Vision API
 * @param imageBase64 - Base64 encoded JPEG image
 * @returns AI analysis with DOP recommendations
 */
export async function analyzeCameraFrame(imageBase64: string): Promise<CameraAIAnalysis | null> {
  try {
    const response = await fetch(`${API_URL}/api/analyze/frame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      console.error("[Camera AI] API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data as CameraAIAnalysis;
  } catch (error) {
    console.error("[Camera AI] Network error:", error);
    return null;
  }
}

/**
 * Get fallback analysis when API is unavailable
 */
export function getFallbackAnalysis(): CameraAIAnalysis {
  return {
    angle: "Eye Level",
    iso: "400",
    speed: "1/120",
    wb: "5600K",
    shot_type: "MS",
    lighting: "Good",
    guidance: ["Analyse en cours...", "Maintenez la position"],
    lighting_pct: 75,
    quality_score: 75,
  };
}

/**
 * Format shot type for display
 */
export function formatShotType(shotType: string): string {
  const shotTypeMap: Record<string, string> = {
    ECU: "Très gros plan",
    CU: "Gros plan",
    MCU: "Plan rapproché",
    MS: "Plan moyen",
    MLS: "Plan demi-ensemble",
    LS: "Plan d'ensemble",
  };
  return shotTypeMap[shotType] || shotType;
}

/**
 * Get lighting color based on quality
 */
export function getLightingColor(lighting: string): string {
  const colorMap: Record<string, string> = {
    Excellent: "#4DC8E8", // Aqua
    Good: "#7C3AED",      // Violet
    Fair: "#FFA500",      // Orange
    Poor: "#FF4444",      // Rouge
  };
  return colorMap[lighting] || "#7C3AED";
}

/**
 * Get quality score color
 */
export function getQualityScoreColor(score: number): string {
  if (score >= 90) return "#4DC8E8"; // Aqua
  if (score >= 75) return "#7C3AED"; // Violet
  if (score >= 60) return "#FFA500"; // Orange
  return "#FF4444"; // Rouge
}

/**
 * Convert base64 image to data URI
 */
export function toDataURI(base64: string): string {
  if (base64.startsWith("data:")) return base64;
  return `data:image/jpeg;base64,${base64}`;
}
