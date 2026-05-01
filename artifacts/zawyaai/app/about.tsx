import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TEAM = [
  { name: "Roqia", role: "CEO & Développeuse Mobile", icon: "code" as const },
  { name: "Membre 2", role: "IA & Machine Learning", icon: "cpu" as const },
  { name: "Membre 3", role: "Design & UX", icon: "pen-tool" as const },
];

const FEATURES = [
  { icon: "camera" as const, label: "Caméra IA temps réel" },
  { icon: "zap" as const, label: "Guidage intelligent" },
  { icon: "send" as const, label: "Publication multi-réseaux" },
  { icon: "award" as const, label: "Score viral /100" },
  { icon: "film" as const, label: "8 LUTs cinéma" },
  { icon: "message-circle" as const, label: "Assistant IA Claude" },
];

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>À propos de nous</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Logo + nom */}
        <View style={styles.logoSection}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <Feather name="aperture" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>
            <Text style={{ color: "#fff" }}>Zaw</Text>
            <Text style={{ color: "#4DC8E8" }}>IA</Text>
          </Text>
          <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
            Le premier directeur photo IA algérien
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Startup info */}
        <View style={[styles.startupCard, { backgroundColor: colors.card, borderColor: "#4DC8E840" }]}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} style={styles.flagIcon}>
            <Text style={{ fontSize: 20 }}>🇩🇿</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>Startup Algérien</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4, lineHeight: 19 }}>
              ZawIA est né à l'Université d'Oum El Bouaghi, Algérie. Notre mission : démocratiser la création de contenu professionnel pour les créateurs algériens et arabes.
            </Text>
          </View>
        </View>

        {/* Équipe */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notre équipe</Text>
        <View style={{ gap: 10 }}>
          {TEAM.map((m) => (
            <View key={m.name} style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient colors={["#4DC8E8", "#7C3AED"]} style={styles.memberIcon}>
                <Feather name={m.icon} size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>{m.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>{m.role}</Text>
              </View>
              <View style={[styles.uniBadge, { backgroundColor: "rgba(77,200,232,0.12)" }]}>
                <Text style={{ color: "#4DC8E8", fontFamily: "Inter_600SemiBold", fontSize: 10 }}>Univ. OEB</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fonctionnalités */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fonctionnalités</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={f.icon} size={20} color="#4DC8E8" />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 11, textAlign: "center", marginTop: 6 }}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={18} color="#4DC8E8" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Nous contacter</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>zawia.startup@gmail.com</Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          © 2025 ZawIA · Université d'Oum El Bouaghi · Algérie 🇩🇿
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logo: { width: 90, height: 90, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  appName: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  appTagline: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "center" },
  versionBadge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  startupCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 24, alignItems: "flex-start" },
  flagIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  memberCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  memberIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  uniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  featureCard: { width: "30%", padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  footer: { textAlign: "center", marginTop: 16, fontSize: 12, fontFamily: "Inter_400Regular" },
});
