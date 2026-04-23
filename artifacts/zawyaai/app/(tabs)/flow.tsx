import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Step = {
  n: number;
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
};

const STEPS: Step[] = [
  { n: 1, title: "Capture du frame", desc: "Analyse de la première image et choix de la plateforme cible", icon: "image" },
  { n: 2, title: "Recommandation IA", desc: "Angle, cadrage et lumière suggérés en temps réel", icon: "compass" },
  { n: 3, title: "Prise de vue guidée", desc: "Coach vocal et overlays visuels actifs", icon: "video" },
  { n: 4, title: "Analyse post-shoot", desc: "Score /100, auto-cut et étalonnage automatique", icon: "bar-chart-2" },
  { n: 5, title: "Préparation contenu", desc: "Captions, hashtags et formats par plateforme", icon: "edit-3" },
  { n: 6, title: "Publication autonome", desc: "Diffusion via APIs Instagram, TikTok, Snapchat", icon: "send" },
];

export default function FlowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Flux IA</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Du frame jusqu'à la publication
        </Text>

        <LinearGradient
          colors={["#A855F7", "#C026D3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <Feather name="zap" size={20} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Cycle 100% autonome</Text>
            <Text style={styles.heroDesc}>
              L'IA exécute les 6 étapes sans intervention
            </Text>
          </View>
        </LinearGradient>

        <View style={{ marginTop: 24 }}>
          {STEPS.map((s, i) => (
            <View key={s.n} style={{ flexDirection: "row" }}>
              {/* Timeline */}
              <View style={styles.timeline}>
                <LinearGradient
                  colors={["#A855F7", "#C026D3"]}
                  style={styles.stepCircle}
                >
                  <Text style={styles.stepNum}>{s.n}</Text>
                </LinearGradient>
                {i < STEPS.length - 1 ? (
                  <View
                    style={[styles.stepLine, { backgroundColor: colors.border }]}
                  />
                ) : null}
              </View>

              {/* Card */}
              <View style={{ flex: 1, paddingBottom: 18 }}>
                <View
                  style={[
                    styles.stepCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.stepHeader}>
                    <Feather name={s.icon} size={16} color={colors.primary} />
                    <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                      {s.title}
                    </Text>
                  </View>
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                    {s.desc}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.metricsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="trending-up" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.metricsTitle, { color: colors.foreground }]}>
              Suivi 72h après publication
            </Text>
            <Text style={[styles.metricsDesc, { color: colors.mutedForeground }]}>
              L'agent analyse les métriques et améliore ses recommandations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, fontFamily: "Inter_400Regular" },
  heroBanner: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  heroTitle: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  timeline: { width: 48, alignItems: "center" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  stepLine: { flex: 1, width: 2, marginTop: 4 },
  stepCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginLeft: 4,
  },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stepDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  metricsCard: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  metricsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  metricsDesc: { marginTop: 4, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
