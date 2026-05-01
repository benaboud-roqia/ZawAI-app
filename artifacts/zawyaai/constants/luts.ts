export type LutTier = "free" | "pro" | "studio";

export type Lut = {
  id: string;
  name: string;
  desc: string;
  tier: LutTier;
  layers: Array<{
    color: string;
    opacity: number;
    blendMode?:
      | "multiply"
      | "screen"
      | "overlay"
      | "soft-light"
      | "hard-light"
      | "color"
      | "color-dodge"
      | "color-burn"
      | "darken"
      | "lighten"
      | "difference"
      | "exclusion";
  }>;
  vignette?: number;
};

export const LUTS: Lut[] = [
  {
    id: "original",
    name: "Original",
    desc: "Aucun étalonnage",
    tier: "free",
    layers: [],
  },
  {
    id: "teal-orange",
    name: "Teal & Orange",
    desc: "Look blockbuster Hollywood",
    tier: "free",
    layers: [
      { color: "#0E3B4F", opacity: 0.22, blendMode: "soft-light" },
      { color: "#FF8A3D", opacity: 0.18, blendMode: "overlay" },
    ],
    vignette: 0.35,
  },
  {
    id: "noir",
    name: "Cinema Noir",
    desc: "Contrasté, ombres profondes",
    tier: "free",
    layers: [
      { color: "#0A0A12", opacity: 0.35, blendMode: "multiply" },
      { color: "#E8E8F0", opacity: 0.12, blendMode: "soft-light" },
    ],
    vignette: 0.55,
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    desc: "Lumière chaude dorée",
    tier: "pro",
    layers: [
      { color: "#FFB347", opacity: 0.28, blendMode: "overlay" },
      { color: "#FFD580", opacity: 0.18, blendMode: "soft-light" },
    ],
    vignette: 0.25,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    desc: "Néon violet et magenta",
    tier: "pro",
    layers: [
      { color: "#7C3AED", opacity: 0.28, blendMode: "overlay" },
      { color: "#7C3AED", opacity: 0.16, blendMode: "soft-light" },
    ],
    vignette: 0.45,
  },
  {
    id: "vintage",
    name: "Vintage 70s",
    desc: "Film argentique délavé",
    tier: "pro",
    layers: [
      { color: "#C9A074", opacity: 0.32, blendMode: "soft-light" },
      { color: "#5A3E2B", opacity: 0.16, blendMode: "multiply" },
    ],
    vignette: 0.4,
  },
  {
    id: "punch",
    name: "Punch",
    desc: "Saturé et vibrant",
    tier: "studio",
    layers: [
      { color: "#FF2D55", opacity: 0.14, blendMode: "overlay" },
      { color: "#FFD60A", opacity: 0.12, blendMode: "soft-light" },
    ],
  },
  {
    id: "pastel",
    name: "Soft Pastel",
    desc: "Doux et aérien",
    tier: "studio",
    layers: [
      { color: "#FCE7F3", opacity: 0.28, blendMode: "soft-light" },
      { color: "#A7F3D0", opacity: 0.14, blendMode: "screen" },
    ],
  },
];

export type UserPlan = "free" | "pro" | "studio";

export function canUseLut(lut: Lut, plan: UserPlan | undefined): boolean {
  const tier = lut.tier;
  if (tier === "free") return true;
  if (tier === "pro") return plan === "pro" || plan === "studio";
  if (tier === "studio") return plan === "studio";
  return false;
}
