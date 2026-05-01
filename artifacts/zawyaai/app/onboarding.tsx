import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useOnboarding } from "./_layout";

type Step = "welcome" | "how";

const HOW_STEPS = [
  { n: "01", icon: "smartphone" as const, title: "Dis à l'IA ce que tu filmes", desc: "Conférence, selfie, mariage, voyage… L'IA comprend ton contexte en 2 secondes.", color: "#4DC8E8" },
  { n: "02", icon: "zap" as const, title: "L'IA configure tout automatiquement", desc: "Plan, angle, ISO, vitesse, balance des blancs, LUT cinéma — zéro réglage manuel.", color: "#7C3AED" },
  { n: "03", icon: "send" as const, title: "Publie sur tous tes réseaux", desc: "Instagram, TikTok, Snapchat, YouTube Shorts, Facebook, X — en un seul tap.", color: "#4DC8E8" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markDone } = useOnboarding();
  const [step, setStep] = useState<Step>("welcome");
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const goRegister = () => {
    markDone();
    router.replace("/(auth)/register");
  };

  // ── SLIDE 1 : Welcome ──────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: topPad }}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <Feather name="aperture" size={52} color="#fff" />
          </LinearGradient>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}><Text style={{ color: "#fff" }}>Zaw</Text><Text style={{ color: "#4DC8E8" }}>IA</Text> · Studio de poche</Text>
          </View>

          <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Bienvenue dans{"\n"}ton studio IA.</Text>
          <Text style={[styles.welcomeDesc, { color: colors.mutedForeground }]}>
            Le premier directeur photo artificiel qui filme, étalonne et publie à ta place — en temps réel.
          </Text>

          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <StatItem value="6" label="Réseaux" />
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <StatItem value="8" label="LUTs cinéma" />
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <StatItem value="100%" label="Autonome" />
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20, borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Dots current={0} total={2} colors={colors} />
          <View style={styles.btnRow}>
            <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.skipBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 14 }}>J'ai déjà un compte</Text>
            </Pressable>
            <Pressable onPress={() => setStep("how")} style={{ flex: 1 }}>
              <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>Suivant</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── SLIDE 2 : Comment ça marche ────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 24, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}><Text style={{ color: "#fff" }}>Zaw</Text><Text style={{ color: "#4DC8E8" }}>IA</Text></Text>
        </View>

        <Text style={[styles.slideTitle, { color: colors.foreground }]}>Comment ça{"\n"}marche ?</Text>
        <Text style={[styles.slideSubtitle, { color: colors.mutedForeground }]}>3 étapes, zéro compétence technique requise.</Text>

        <View style={{ marginTop: 28, gap: 16 }}>
          {HOW_STEPS.map((s, i) => (
            <View key={s.n} style={{ flexDirection: "row", gap: 16 }}>
              <View style={{ alignItems: "center", width: 48 }}>
                <LinearGradient colors={[s.color, s.color + "88"]} style={styles.stepCircle}>
                  <Feather name={s.icon} size={20} color="#fff" />
                </LinearGradient>
                {i < HOW_STEPS.length - 1 ? <View style={[styles.stepLine, { backgroundColor: colors.border }]} /> : null}
              </View>
              <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.stepNum, { color: s.color }]}>{s.n}</Text>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{s.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.exampleCard, { backgroundColor: colors.card, borderColor: "#4DC8E840" }]}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} style={styles.exampleIcon}>
            <Feather name="film" size={16} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 4 }}>Exemple</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 }}>
              Tu dis "selfie" → l'IA choisit Plan poitrine · Eye Level · ISO 200 · Soft Pastel et te guide en direct.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Dots current={1} total={2} colors={colors} />
        <View style={styles.btnRow}>
          <Pressable onPress={() => setStep("welcome")} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={goRegister} style={{ flex: 1 }}>
            <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Commencer</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: "#4DC8E8", fontFamily: "Inter_700Bold", fontSize: 22 }}>{value}</Text>
      <Text style={{ color: "#71717A", fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Dots({ current, total, colors }: { current: number; total: number; colors: any }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i === current ? "#4DC8E8" : colors.border, width: i === current ? 24 : 8 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 110, height: 110, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  badgeDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#4DC8E8" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  welcomeTitle: { fontSize: 34, fontFamily: "Inter_700Bold", letterSpacing: -1, lineHeight: 42, textAlign: "center", marginBottom: 14 },
  welcomeDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23, marginBottom: 28 },
  statsRow: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, width: "100%" },
  statDiv: { width: 1, height: 32 },
  slideTitle: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.8, lineHeight: 40, marginBottom: 10 },
  slideSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  stepCircle: { width: 48, height: 48, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stepLine: { flex: 1, width: 2, marginTop: 6, marginBottom: -10 },
  stepCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  stepNum: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 6 },
  stepDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  exampleCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginTop: 20, alignItems: "flex-start" },
  exampleIcon: { width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  bottomBar: { paddingTop: 12, borderTopWidth: 1, gap: 10 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 999 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24 },
  skipBtn: { paddingHorizontal: 4, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  backBtn: { width: 48, height: 58, alignItems: "center", justifyContent: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 58, borderRadius: 16 },
  nextBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
});
