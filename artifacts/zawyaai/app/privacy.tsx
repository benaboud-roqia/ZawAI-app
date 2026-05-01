import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  {
    title: "Données collectées",
    icon: "database" as const,
    content: "ZawIA collecte uniquement les données nécessaires au fonctionnement de l'application : nom, email, et contenu publié. Aucune donnée n'est vendue à des tiers.",
  },
  {
    title: "Stockage local",
    icon: "smartphone" as const,
    content: "Vos photos, vidéos et historique de publications sont stockés localement sur votre téléphone. ZawIA n'accède pas à votre galerie sans votre permission explicite.",
  },
  {
    title: "Caméra et microphone",
    icon: "camera" as const,
    content: "L'accès à la caméra et au microphone est utilisé uniquement pendant l'enregistrement. ZawIA ne capture aucune image ou audio en arrière-plan.",
  },
  {
    title: "Intelligence artificielle",
    icon: "cpu" as const,
    content: "Les analyses IA sont effectuées via des API sécurisées (Anthropic Claude). Vos photos ne sont pas conservées sur nos serveurs après analyse.",
  },
  {
    title: "Pas de tracking",
    icon: "shield" as const,
    content: "ZawIA ne suit pas votre comportement, ne vend pas vos données et ne partage aucune information personnelle avec des annonceurs.",
  },
  {
    title: "Suppression des données",
    icon: "trash-2" as const,
    content: "Vous pouvez supprimer toutes vos données à tout moment depuis Paramètres → Profil → Zone dangereuse → Supprimer mon compte.",
  },
];

export default function PrivacyScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Confidentialité</Text>
          <View style={{ width: 40 }} />
        </View>

        <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="shield" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>Votre vie privée est protégée</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }}>
              ZawIA est conçu avec la confidentialité comme priorité absolue.
            </Text>
          </View>
        </LinearGradient>

        <View style={{ gap: 12, marginTop: 20 }}>
          {SECTIONS.map((s) => (
            <View key={s.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(77,200,232,0.12)" }]}>
                <Feather name={s.icon} size={18} color="#4DC8E8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 6 }}>{s.title}</Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 }}>{s.content}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Dernière mise à jour : Janvier 2025 · ZawIA — Startup Algérien
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18 },
  card: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: "flex-start" },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  footer: { textAlign: "center", marginTop: 24, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
