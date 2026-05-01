import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / 100, duration: 1000, useNativeDriver: false }).start();
  }, []);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 }}>{label}</Text>
        <Text style={{ color, fontFamily: "Inter_700Bold", fontSize: 13 }}>{value}%</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: "#27272A", overflow: "hidden" }}>
        <Animated.View style={{ height: "100%", borderRadius: 999, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
      </View>
    </View>
  );
}

export default function ViralScoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { items } = useHistory();
  const isPro = user?.plan === "pro" || user?.plan === "studio";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const avgScore = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;
  const bestScore = items.length > 0 ? Math.max(...items.map(i => i.score)) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Score Viral</Text>
          {!isPro ? <View style={[styles.proBadge, { backgroundColor: ACCENT }]}><Text style={styles.proBadgeText}>PRO</Text></View> : <View style={{ width: 40 }} />}
        </View>

        {/* Hero */}
        <LinearGradient colors={["#EF4444", ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="trending-up" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Prédiction d'engagement IA</Text>
            <Text style={styles.heroDesc}>L'IA prédit le score viral de ton contenu avant publication.</Text>
          </View>
        </LinearGradient>

        {/* Scores actuels */}
        {items.length > 0 ? (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tes statistiques</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[styles.statBox, { backgroundColor: PRIMARY + "15", borderColor: PRIMARY + "30" }]}>
                <Text style={[styles.statValue, { color: PRIMARY }]}>{avgScore}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Score moyen</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#22C55E15", borderColor: "#22C55E30" }]}>
                <Text style={[styles.statValue, { color: "#22C55E" }]}>{bestScore}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Meilleur score</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: ACCENT + "15", borderColor: ACCENT + "30" }]}>
                <Text style={[styles.statValue, { color: ACCENT }]}>{items.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Publications</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Facteurs du score viral */}
        <View style={[styles.factorsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Facteurs analysés</Text>
          <ScoreBar label="Qualité visuelle" value={isPro ? 78 : 0} color={PRIMARY} />
          <ScoreBar label="Timing de publication" value={isPro ? 85 : 0} color="#22C55E" />
          <ScoreBar label="Engagement prédit" value={isPro ? 72 : 0} color="#F59E0B" />
          <ScoreBar label="Tendances plateforme" value={isPro ? 90 : 0} color={ACCENT} />
          {!isPro ? (
            <View style={[styles.blurOverlay, { backgroundColor: colors.background + "CC" }]}>
              <Feather name="lock" size={24} color={ACCENT} />
              <Text style={{ color: ACCENT, fontFamily: "Inter_700Bold", fontSize: 14, marginTop: 8 }}>Disponible avec Pro</Text>
            </View>
          ) : null}
        </View>

        {/* CTA */}
        {isPro ? (
          <Pressable onPress={() => router.push("/analytics")} style={{ marginTop: 8 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="bar-chart-2" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Voir mes analytics</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/premium")} style={{ marginTop: 8 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="unlock" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Débloquer le Score Viral — Pro</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  proBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  proBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, marginBottom: 20 },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  statsCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 4, textAlign: "center" },
  factorsCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 14, position: "relative", overflow: "hidden" },
  blurOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});
