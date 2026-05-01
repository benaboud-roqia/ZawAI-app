import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Plan } from "@/constants/plans";
import { useColors } from "@/hooks/useColors";

type Props = {
  plan: Plan;
  current?: boolean;
  onSelect?: () => void;
};

export function PlanCard({ plan, current, onSelect }: Props) {
  const colors = useColors();

  const Body = (
    <View style={{ gap: 16 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {plan.name}
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            {plan.tagline}
          </Text>
        </View>
        {plan.highlight ? (
          <View
            style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.18)" }]}
          >
            <Text style={styles.badgeText}>POPULAIRE</Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.price,
          { color: plan.highlight ? "#fff" : colors.foreground },
        ]}
      >
        {plan.priceLabel}
      </Text>

      <View style={{ gap: 10 }}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather
              name="check"
              size={16}
              color={plan.highlight ? "#fff" : colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: plan.highlight
                    ? "rgba(255,255,255,0.95)"
                    : colors.foreground,
                },
              ]}
            >
              {f}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.cta,
          {
            backgroundColor: current
              ? "rgba(255,255,255,0.15)"
              : plan.highlight
                ? "#fff"
                : colors.secondary,
          },
        ]}
      >
        <Text
          style={[
            styles.ctaText,
            {
              color: current
                ? "#fff"
                : plan.highlight
                  ? "#7C3AED"
                  : colors.foreground,
            },
          ]}
        >
          {current ? "Plan actuel" : "Choisir ce plan"}
        </Text>
      </View>
    </View>
  );

  if (plan.highlight) {
    return (
      <Pressable onPress={onSelect} disabled={current}>
        <LinearGradient
          colors={["#4DC8E8", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderRadius: colors.radius + 4 }]}
        >
          {Body}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onSelect} disabled={current}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius + 4,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        {Body}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  price: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
