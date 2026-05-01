import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

export default function LightCoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "studio";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  // Simulation de l'analyse lumière en temps réel
  const [lightLevel, setLightLevel] = useState(72);
  const [lightState, setLightState] = useState<"dark" | "good" | "bright">("good");
  const barAnim = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const newLevel = Math.max(20, Math.min(95, lightLevel + (Math.random() - 0.5) * 10));
      setLightLevel(Math.round(newLevel));
      setLightState(newLevel < 40 ? "dark" : newLevel > 85 ? "bright" : "good");
      Animated.timing(barAnim, { toValue: newLevel / 100, duration: 500, useNativeDriver: false }).start();
    }, 2000);
    return () => clearInterval(interval);
  }, [lightLevel]);

  const stateColor = lightState === "good" ? "#22C55E" : lightState === "dark" ? "#EF4444" : "#F59E0B";
  const stateIcon = lightState === "good" ? "🟢" : lightState === "dark" ? "🔴" : "🟡";
  const stateMsg = lightState === "good" ? "Éclairage excellent 👌" : lightState === "dark" ? "Trop sombre — rapproche-toi de la lumière" : "Trop lumineux — cherche de l'ombre";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Coach Lumière</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Indicateur temps réel */}
        <View style={[styles.liveCard, { backgroundColor: stateColor + "15", borderColor: stateColor + "40" }]}>
          <Text style={{ fontSize: 32 }}>{stateIcon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.liveTitle, { color: stateColor }]}>Analyse en direct</Text>
            <Text style={[styles.liveMsg, { color: stateColor }]}>{stateMsg}</Text>
          </View>
          <View style={[styles.livePct, { backgroundColor: stateColor + "22" }]}>
            <Feather name="sun" size={14} color={stateColor} />
            <Text style={[styles.livePctText, { color: stateColor }]}>{lightLevel}%</Text>
          </View>
        </View>

        {/* Barre de lumière */}
        <View style={[styles.lightBarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={[styles.barLabel, { color: colors.foreground }]}>Niveau d'éclairage</Text>
            <Text style={[styles.barValue, { color: stateColor }]}>{lightLevel}%</Text>
          </View>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }), backgroundColor: stateColor }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Text style={[styles.barHint, { color: "#EF4444" }]}>Sombre</Text>
            <Text style={[styles.barHint, { color: "#22C55E" }]}>Optimal</Text>
            <Text style={[styles.barHint, { color: "#F59E0B" }]}>Surexposé</Text>
          </View>
        </View>

        {/* Conseils */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conseils d'éclairage</Text>
        {[
          { icon: "sun" as const, title: "Lumière naturelle", desc: "Positionne-toi face à une fenêtre pour un éclairage doux et naturel.", color: "#F59E0B" },
          { icon: "moon" as const, title: "Évite le contre-jour", desc: "Ne mets jamais la source lumineuse derrière toi — ça crée des silhouettes.", color: PRIMARY },
          { icon: "zap" as const, title: "Règle des 3 points", desc: "Lumière principale + lumière de remplissage + lumière de fond = résultat pro.", color: ACCENT },
        ].map((c) => (
          <View key={c.title} style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.tipIcon, { backgroundColor: c.color + "18" }]}>
              <Feather name={c.icon} size={16} color={c.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: colors.foreground }]}>{c.title}</Text>
              <Text style={[styles.tipDesc, { color: colors.mutedForeground }]}>{c.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA */}
        <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: 20 }}>
          <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Activer dans la caméra</Text>
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
  liveCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 14 },
  liveTitle: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 4 },
  liveMsg: { fontFamily: "Inter_500Medium", fontSize: 13 },
  livePct: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  livePctText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  lightBarCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  barLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  barValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  barTrack: { height: 10, borderRadius: 999, backgroundColor: "#27272A", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  barHint: { fontFamily: "Inter_500Medium", fontSize: 11 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  tipIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  tipDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});
