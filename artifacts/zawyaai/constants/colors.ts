const colors = {
  light: {
    text: "#FFFFFF",
    tint: "#4DC8E8",

    // Fond très sombre, presque noir avec légère teinte
    background: "#0D0D0F",
    foreground: "#FFFFFF",

    card: "#18181B",
    cardForeground: "#FFFFFF",

    // Gradient principal : aqua → violet
    primary: "#4DC8E8",
    primaryForeground: "#FFFFFF",
    primaryGradient: ["#4DC8E8", "#7C3AED"] as [string, string],

    secondary: "#1C1C1F",
    secondaryForeground: "#FFFFFF",

    muted: "#1C1C1F",
    mutedForeground: "#71717A",

    accent: "#7C3AED",
    accentForeground: "#FFFFFF",

    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    border: "#27272A",
    input: "#18181B",

    success: "#22C55E",
    warning: "#F59E0B",
  },
  radius: 16,
};

export default colors;
