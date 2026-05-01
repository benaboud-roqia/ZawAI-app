import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

const STEPS = [
  { n: "1", icon: "video" as const, title: "Enregistre ta vidéo", desc: "Filme normalement avec ZawIA — l'IA analyse chaque frame en arrière-plan." },
  { n: "2", icon: "cpu" as const, title: "Analyse IA", desc: "L'IA détecte les meilleures séquences : netteté, éclairage, expressions, mouvement." },
  { n: "3", icon: "scissors" as const, title: "Coupe automatique", desc: "Les séquences de mauvaise qualité sont supprimées automatiquement." },
  { n: "4", icon: "send" as const, title: "Prêt à publier", desc: "Ta vidéo optimisée est prête — tu n'as qu'à ajouter la caption et publier." },
];

export default function AutoCutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "studio";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Auto-cut</Text>
          {!isPro ? <View style={[styles.proBadge, { backgroundColor: ACCENT }]}><Text style={styles.proBadgeText}>PRO</Text></View> : <View style={{ width: 40 }} />}
        </View>

        {/* Hero */}
        <LinearGradient colors={[ACCENT, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="scissors" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Montage automatique IA</Text>
            <Text style={styles.heroDesc}>L'IA garde uniquement les meilleures séquences de ta vidéo.</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: "3x", label: "Plus rapide" },
            { value: "85%", label: "Qualité moyenne" },
            { value: "Auto", label: "Zéro montage" },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: PRIMARY }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Étapes */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comment ça marche</Text>
        {STEPS.map((s, i) => (
          <View key={s.n} style={{ flexDirection: "row", gap: 14, marginBottom: 8 }}>
            <View style={{ alignItems: "center", width: 40 }}>
              <LinearGradient colors={[PRIMARY, ACCENT]} style={styles.stepCircle}>
                <Feather name={s.icon} size={16} color="#fff" />
              </LinearGradient>
              {i < STEPS.length - 1 ? <View style={[styles.stepLine, { backgroundColor: colors.border }]} /> : null}
            </View>
            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.stepNum, { color: PRIMARY }]}>{s.n.padStart(2, "0")}</Text>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>{s.title}</Text>
              <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA */}
        {isPro ? (
          <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: 20 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="video" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Enregistrer une vidéo</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.premiumBanner, { backgroundColor: ACCENT + "15", borderColor: ACCENT + "40" }]}>
            <Feather name="lock" size={20} color={ACCENT} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.premiumTitle, { color: ACCENT }]}>Fonctionnalité Pro</Text>
              <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>Auto-cut est disponible avec le plan Pro ou Studio.</Text>
            </View>
            <Pressable onPress={() => router.push("/premium")}>
              <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Améliorer</Text>
              </LinearGradient>
            </Pressable>
          </View>
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
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  stepCircle: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stepLine: { flex: 1, width: 2, marginTop: 4, marginBottom: -8, minHeight: 16 },
  stepCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  stepNum: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 4 },
  stepDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  premiumBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, marginTop: 20 },
  premiumTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  premiumDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  upgradeBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
