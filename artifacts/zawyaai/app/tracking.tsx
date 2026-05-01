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

export default function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "studio";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Tracking Sujet</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Demo visuelle */}
        <View style={[styles.demoBox, { backgroundColor: "#000", borderColor: colors.border }]}>
          <View style={styles.demoCamera}>
            <Feather name="camera" size={40} color="rgba(255,255,255,0.3)" />
          </View>
          {/* Cadre de tracking animé */}
          <Animated.View style={[styles.trackingFrame, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: PRIMARY }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: PRIMARY }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: PRIMARY }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: PRIMARY }]} />
          </Animated.View>
          <View style={[styles.trackingLabel, { backgroundColor: PRIMARY + "CC" }]}>
            <Feather name="target" size={12} color="#fff" />
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Sujet détecté</Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient colors={[PRIMARY, ACCENT]} style={styles.infoIcon}>
            <Feather name="target" size={20} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Tracking sujet IA</Text>
            <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
              L'IA détecte et suit automatiquement le visage ou le sujet principal. Le cadre s'ajuste en temps réel pour garder le sujet centré.
            </Text>
          </View>
        </View>

        {/* Fonctionnalités */}
        {[
          { icon: "user" as const, title: "Détection visage", desc: "Reconnaît et suit le visage automatiquement" },
          { icon: "move" as const, title: "Reframe automatique", desc: "Ajuste le cadrage selon les mouvements" },
          { icon: "zap" as const, title: "Temps réel", desc: "30 fps de traitement IA continu" },
        ].map((f) => (
          <View key={f.title} style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: PRIMARY + "18" }]}>
              <Feather name={f.icon} size={16} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA */}
        {isPro ? (
          <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: 20 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="camera" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Activer dans la caméra</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.premiumBanner, { backgroundColor: ACCENT + "15", borderColor: ACCENT + "40" }]}>
            <Feather name="lock" size={20} color={ACCENT} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.premiumTitle, { color: ACCENT }]}>Fonctionnalité Pro</Text>
              <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>Le tracking sujet est disponible avec le plan Pro ou Studio.</Text>
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
  demoBox: { height: 200, borderRadius: 18, borderWidth: 1, marginBottom: 20, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  demoCamera: { position: "absolute" },
  trackingFrame: { width: 120, height: 120, position: "absolute" },
  corner: { position: "absolute", width: 20, height: 20, borderWidth: 2.5 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  trackingLabel: { position: "absolute", bottom: 16, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  infoCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 14, alignItems: "flex-start" },
  infoIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 6 },
  infoDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  featureDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  premiumBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, marginTop: 20 },
  premiumTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  premiumDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  upgradeBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
