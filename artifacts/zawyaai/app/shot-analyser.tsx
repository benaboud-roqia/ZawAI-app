import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
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
import { CinematicImage } from "@/components/CinematicImage";
import { LUTS } from "@/constants/luts";
import { useHistory } from "@/contexts/HistoryContext";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

type Metric = { label: string; icon: keyof typeof Feather.glyphMap; score: number; color: string; tip: string };

function CircleScore({ score, size = 130 }: { score: number; size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 1200, useNativeDriver: false }).start();
  }, [score]);
  const color = score >= 80 ? "#22C55E" : score >= 60 ? PRIMARY : "#EF4444";
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: "#27272A" }} />
      <LinearGradient colors={[color, color + "88"]} style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: "transparent", opacity: 0.9 }} />
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
        <Text style={styles.metricTip}>{metric.tip}</Text>
      </View>
    </View>
  );
}

export default function ShotAnalyserScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useHistory();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  // Prendre la dernière photo de l'historique ou simuler
  const lastItem = items[0];
  const score = lastItem?.score ?? 82;
  const lut = LUTS.find(l => l.id === (lastItem?.lut ?? "teal-orange")) ?? LUTS[0];

  const metrics: Metric[] = [
    { label: "Éclairage", icon: "sun", score: Math.min(100, score + 2), color: "#F59E0B", tip: score >= 80 ? "Excellent éclairage naturel" : "Rapproche-toi d'une source lumineuse" },
    { label: "Composition", icon: "grid", score: Math.min(100, score + 5), color: PRIMARY, tip: score >= 75 ? "Règle des tiers bien appliquée" : "Décale le sujet sur le tiers gauche" },
    { label: "Netteté", icon: "aperture", score: Math.max(0, score - 8), color: ACCENT, tip: score >= 70 ? "Image nette et précise" : "Stabilise le téléphone pour plus de netteté" },
    { label: "Couleurs", icon: "droplet", score: Math.min(100, score + 1), color: "#22C55E", tip: score >= 75 ? "Balance des couleurs équilibrée" : "Ajuste la balance des blancs" },
  ];

  const globalLabel = score >= 85 ? "Excellent" : score >= 70 ? "Bien" : score >= 55 ? "Moyen" : "À améliorer";
  const globalColor = score >= 85 ? "#22C55E" : score >= 70 ? PRIMARY : score >= 55 ? "#F59E0B" : "#EF4444";

  const suggestions = [
    score < 80 ? "Réduis légèrement l'éclairage pour éviter la surexposition" : "Maintiens cet éclairage pour tes prochaines prises",
    score < 75 ? "Rapproche-toi du sujet pour améliorer la netteté" : "La distance est parfaite pour ce type de plan",
    "Essaie un angle latéral pour plus de dynamisme",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Shot Analyser</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Photo + score */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {lastItem?.uri ? (
            <CinematicImage uri={lastItem.uri} lut={lut} style={styles.photoThumb} />
          ) : (
            <View style={[styles.photoThumb, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
              <Feather name="camera" size={32} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 8 }}>Prenez une photo</Text>
            </View>
          )}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingLeft: 16 }}>
            <CircleScore score={score} size={110} />
            <View style={[styles.scoreBadge, { backgroundColor: globalColor + "22" }]}>
              <View style={[styles.scoreDot, { backgroundColor: globalColor }]} />
              <Text style={[styles.scoreBadgeText, { color: globalColor }]}>{globalLabel}</Text>
            </View>
          </View>
        </View>

        {/* Métriques */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Analyse détaillée</Text>
        <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {metrics.map((m, i) => (
            <View key={m.label}>
              <MetricBar metric={m} />
              {i < metrics.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            </View>
          ))}
        </View>

        {/* Suggestions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggestions IA</Text>
        <View style={{ gap: 10 }}>
          {suggestions.map((s, i) => (
            <View key={i} style={[styles.suggCard, { backgroundColor: colors.card, borderColor: i === 0 ? PRIMARY + "40" : colors.border }]}>
              <LinearGradient colors={[PRIMARY, ACCENT]} style={styles.suggIcon}>
                <Feather name={i === 0 ? "sun" : i === 1 ? "zoom-in" : "rotate-cw"} size={14} color="#fff" />
              </LinearGradient>
              <Text style={[styles.suggText, { color: colors.foreground }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <Pressable onPress={() => router.replace("/(tabs)")} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <Feather name="camera" size={16} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>Reprendre</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/publish")} style={{ flex: 1 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtnGrad}>
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
  scoreCard: { flexDirection: "row", padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24, alignItems: "center" },
  photoThumb: { width: 120, height: 120, borderRadius: 14, overflow: "hidden" },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 10 },
  scoreDot: { width: 6, height: 6, borderRadius: 999 },
  scoreBadgeText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  metricsCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  metricRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  metricIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
  metricLabel: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 },
  metricScore: { fontFamily: "Inter_700Bold", fontSize: 13 },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: "#27272A", overflow: "hidden", marginBottom: 6 },
  barFill: { height: "100%", borderRadius: 999 },
  metricTip: { color: "#71717A", fontFamily: "Inter_400Regular", fontSize: 11 },
  divider: { height: 1, marginLeft: 58 },
  suggCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggIcon: { width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  suggText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14, borderWidth: 1 },
  actionBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
