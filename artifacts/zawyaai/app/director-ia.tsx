import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

const SUGGESTIONS = [
  { icon: "compass" as const, title: "Angle recommandé", value: "Eye Level", color: PRIMARY, desc: "Pour un selfie, légèrement au-dessus des yeux" },
  { icon: "film" as const, title: "Plan suggéré", value: "Plan poitrine", color: ACCENT, desc: "Idéal pour le contenu lifestyle et selfie" },
  { icon: "move" as const, title: "Mouvement", value: "Statique", color: "#22C55E", desc: "Stabilise le téléphone pour plus de netteté" },
  { icon: "droplet" as const, title: "LUT recommandé", value: "Soft Pastel", color: "#F59E0B", desc: "Rendu doux et naturel pour les selfies" },
];

export default function DirectorIAScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Directeur IA</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="compass" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Votre directeur photo IA</Text>
            <Text style={styles.heroDesc}>Analyse la scène et suggère angle, plan, mouvement et étalonnage en temps réel.</Text>
          </View>
        </LinearGradient>

        {/* Suggestions actuelles */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommandations actuelles</Text>
        <View style={{ gap: 10 }}>
          {SUGGESTIONS.map((s) => (
            <View key={s.title} style={[styles.suggCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.suggIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon} size={16} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggLabel, { color: colors.mutedForeground }]}>{s.title}</Text>
                <Text style={[styles.suggValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.suggDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
              </View>
              <View style={[styles.suggBadge, { backgroundColor: s.color + "18" }]}>
                <Text style={[styles.suggBadgeText, { color: s.color }]}>IA</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Comment ça marche */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comment ça marche</Text>
        {[
          { n: "1", text: "L'IA analyse le contexte (occasion, plateforme, heure)" },
          { n: "2", text: "Elle calcule les paramètres optimaux en temps réel" },
          { n: "3", text: "Les recommandations s'affichent dans la caméra" },
          { n: "4", text: "Tu n'as qu'à suivre les indications pour un résultat pro" },
        ].map((s) => (
          <View key={s.n} style={[styles.stepRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient colors={[PRIMARY, ACCENT]} style={styles.stepNum}>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 }}>{s.n}</Text>
            </LinearGradient>
            <Text style={[styles.stepText, { color: colors.foreground }]}>{s.text}</Text>
          </View>
        ))}

        <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: 20 }}>
          <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Ouvrir la caméra</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, marginBottom: 24 },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  suggCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  suggLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginBottom: 2 },
  suggValue: { fontFamily: "Inter_700Bold", fontSize: 15 },
  suggDesc: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  suggBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  suggBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  stepNum: { width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});
