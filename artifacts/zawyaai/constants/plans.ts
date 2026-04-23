export type PlanId = "free" | "pro" | "studio";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceDZD: number;
  priceLabel: string;
  highlight?: boolean;
  features: string[];
};

const formatDZD = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DZD";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour découvrir ZawyaAI",
    priceDZD: 0,
    priceLabel: "0 DZD",
    features: [
      "Caméra intelligente avec grilles",
      "5 analyses IA par jour",
      "3 plans cinématographiques",
      "Export 1080p avec filigrane",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les créateurs sérieux",
    priceDZD: 1990,
    priceLabel: formatDZD(1990) + " / mois",
    highlight: true,
    features: [
      "Tous les plans + 8 angles pro",
      "Analyses IA illimitées",
      "Auto-cut, captions, score viral",
      "Coach lumière en temps réel",
      "LUT automatique cinéma",
      "Export 4K sans filigrane",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Pour les agences et équipes",
    priceDZD: 4990,
    priceLabel: formatDZD(4990) + " / mois",
    features: [
      "Tout du plan Pro",
      "Brand kit automatique",
      "Publication multi-plateformes",
      "Dashboard analytics unifié",
      "Clonage de style visuel",
      "5 sièges utilisateurs inclus",
      "Support prioritaire 24/7",
    ],
  },
];
