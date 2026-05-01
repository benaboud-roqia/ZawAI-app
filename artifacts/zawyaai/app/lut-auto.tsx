import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { LUTS } from "@/constants/luts";
import { CinematicImage } from "@/components/CinematicImage";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

export default function LutAutoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "studio";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const [selectedLut, setSelectedLut] = useState("teal-orange");

  const freeLuts = LUTS.filter(l => l.tier === "free");
  const proLuts  = LUTS.filter(l => l.tier !== "free");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>LUT Automatique</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="droplet" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Étalonnage cinéma IA</Text>
            <Text style={styles.heroDesc}>L'IA analyse ta scène et applique automatiquement le meilleur LUT cinéma.</Text>
          </View>
        </LinearGradient>

        {/* LUTs gratuits */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>LUTs gratuits</Text>
        <View style={styles.lutsGrid}>
          {freeLuts.map(lut => (
            <Pressable key={lut.id} onPress={() => setSelectedLut(lut.id)} style={[styles.lutCard, { borderColor: selectedLut === lut.id ? PRIMARY : colors.border, backgroundColor: colors.card }]}>
              <CinematicImage lut={lut} style={styles.lutPreview} fallback={<View style={[styles.lutPreview, { backgroundColor: colors.secondary }]} />} />
              <View style={styles.lutInfo}>
                <Text style={[styles.lutName, { color: colors.foreground }]}>{lut.name}</Text>
                <Text style={[styles.lutDesc, { color: colors.mutedForeground }]}>{lut.desc}</Text>
              </View>
              {selectedLut === lut.id ? (
                <View style={[styles.checkBadge, { backgroundColor: PRIMARY }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        {/* LUTs Pro */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>LUTs Pro</Text>
        <View style={styles.lutsGrid}>
          {proLuts.map(lut => (
            <Pressable
              key={lut.id}
              onPress={() => { if (isPro) setSelectedLut(lut.id); else router.push("/premium"); }}
              style={[styles.lutCard, { borderColor: selectedLut === lut.id ? PRIMARY : colors.border, backgroundColor: colors.card, opacity: isPro ? 1 : 0.7 }]}
            >
              <CinematicImage lut={lut} style={styles.lutPreview} fallback={<View style={[styles.lutPreview, { backgroundColor: colors.secondary }]} />} />
              {!isPro ? (
                <View style={styles.lockOverlay}>
                  <Feather name="lock" size={18} color="#fff" />
                </View>
              ) : null}
              <View style={styles.lutInfo}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.lutName, { color: colors.foreground }]}>{lut.name}</Text>
                  {!isPro ? <View style={[styles.proBadge, { backgroundColor: ACCENT }]}><Text style={styles.proBadgeText}>PRO</Text></View> : null}
                </View>
                <Text style={[styles.lutDesc, { color: colors.mutedForeground }]}>{lut.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {!isPro ? (
          <Pressable onPress={() => router.push("/premium")} style={{ marginTop: 8 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="unlock" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Débloquer tous les LUTs — Pro</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: 8 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="camera" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Appliquer dans la caméra</Text>
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
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, marginBottom: 24 },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  lutsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  lutCard: { width: "47%", borderRadius: 14, borderWidth: 1.5, overflow: "hidden", position: "relative" },
  lutPreview: { height: 90 },
  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, height: 90, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  lutInfo: { padding: 10 },
  lutName: { fontFamily: "Inter_700Bold", fontSize: 13 },
  lutDesc: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  checkBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  proBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});
