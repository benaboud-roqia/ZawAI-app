import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Metric = { label: string; icon: keyof typeof Feather.glyphMap; score: number; color: string };

const SUGGESTIONS = [
  { icon: "sun" as const, text: "Réduis légèrement l'éclairage", color: "#F59E0B" },
  { icon: "zoom-in" as const, text: "Rapproche-toi pour améliorer la netteté", color: "#4DC8E8" },
  { icon: "rotate-cw" as const, text: "Essaie un angle latéral", color: "#7C3AED" },
];

function CircleProgress({ score, size = 120 }: { score: number; size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Background circle */}
      <View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: "#27272A" }} />
      {/* Progress — simulé avec un dégradé */}
      <LinearGradient
        colors={[color, color + "88"]}
        style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: "transparent", opacity: 0.9 }}
      />
      <View style={{ position: "absolute", width: size - 20, height: size - 20, borderRadius: (size - 20) / 2, backgroundColor: "#0D0D0F" }} />
      <Text style={{ color, fontFamily: "Inter_700Bold", fontSize: size * 0.22 }}>{score}</Text>
      <Text style={{ color: "#71717A", fontFamily: "Inter_500Medium", fontSize: size * 0.1 }}>/ 100</Text>
    </View>
  );
}

function MetricBar({ metric }: { metric: Metric }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: metric.score / 100, duration: 900, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: metric.color + "22" }]}>
        <Feather name={metric.icon} size={14} color={metric.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={styles.metricLabel}>{metric.label}</Text>
          <Text style={[styles.metricScore, { color: metric.color }]}>{metric.score}%</Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { backgroundColor: metric.color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        </View>
      </View>
    </View>
  );
}

export default function RateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { score: scoreParam } = useLocalSearchParams<{ score?: string }>();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  // Score simulé ou passé en paramètre
  const score = scoreParam ? parseInt(scoreParam) : 82;

  const metrics: Metric[] = [
    { label: "Éclairage", icon: "sun", score: 80, color: "#F59E0B" },
    { label: "Composition", icon: "grid", score: 90, color: "#4DC8E8" },
    { label: "Netteté", icon: "aperture", score: 70, color: "#7C3AED" },
    { label: "Couleurs", icon: "droplet", score: 75, color: "#4DC8E8" },
  ];

  const globalLabel = score >= 80 ? "Excellent" : score >= 60 ? "Bien" : "À améliorer";
  const globalColor = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Évaluation IA</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Score global */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CircleProgress score={score} size={130} />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text style={[styles.scoreLabel, { color: globalColor }]}>{globalLabel}</Text>
            <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>
              Votre photo a été analysée sur 4 critères par l'IA ZawIA.
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: globalColor + "22" }]}>
              <View style={[styles.scoreDot, { backgroundColor: globalColor }]} />
              <Text style={[styles.scoreBadgeText, { color: globalColor }]}>Score {score}/100</Text>
            </View>
          </View>
        </View>

        {/* Métriques détaillées */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Détails</Text>
        <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {metrics.map((m, i) => (
            <View key={m.label}>
              <MetricBar metric={m} />
              {i < metrics.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            </View>
          ))}
        </View>

        {/* Suggestions IA */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggestions IA</Text>
        <View style={{ gap: 10 }}>
          {SUGGESTIONS.map((s, i) => (
            <View key={i} style={[styles.suggCard, { backgroundColor: colors.card, borderColor: s.color + "40" }]}>
              <View style={[styles.suggIcon, { backgroundColor: s.color + "22" }]}>
                <Feather name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.suggText, { color: colors.foreground }]}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <Pressable onPress={() => router.back()} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <Feather name="camera" size={16} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>Reprendre</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/publish")} style={{ flex: 1 }}>
            <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtnGrad}>
              <Feather name="send" size={16} color="#fff" />
              <Text style={[styles.actionText, { color: "#fff" }]}>Publier</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  scoreCard: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  scoreLabel: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  scoreDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 10 },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  scoreDot: { width: 6, height: 6, borderRadius: 999 },
  scoreBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  metricsCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  metricIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricLabel: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 },
  metricScore: { fontFamily: "Inter_700Bold", fontSize: 13 },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: "#27272A", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  divider: { height: 1, marginLeft: 58 },
  suggCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  suggText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14, borderWidth: 1 },
  actionBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
