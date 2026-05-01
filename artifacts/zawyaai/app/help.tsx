import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const FAQS = [
  { q: "Comment prendre une photo avec ZawIA ?", a: "Ouvre l'onglet Caméra → choisis ta plateforme → choisis l'occasion → appuie sur le bouton capture. L'IA configure tout automatiquement." },
  { q: "Pourquoi la caméra ne s'ouvre pas ?", a: "Va dans Paramètres Android → Applications → ZawIA → Autorisations → Active Caméra et Microphone." },
  { q: "Comment publier sur TikTok ?", a: "Après la capture, appuie sur le bouton Publier → l'IA génère les captions → confirme la publication." },
  { q: "Qu'est-ce que le score viral ?", a: "C'est une note /100 calculée par l'IA basée sur l'éclairage, la composition, la netteté et les couleurs de ta photo." },
  { q: "Comment changer la plateforme ?", a: "Dans l'écran caméra, appuie sur le badge de plateforme en haut à gauche pour changer." },
  { q: "Qu'est-ce que les LUTs cinéma ?", a: "Ce sont des filtres d'étalonnage professionnel qui donnent un rendu cinématographique à tes photos. Teal & Orange, Golden Hour, Cinema Noir..." },
  { q: "Comment générer un scénario IA ?", a: "Va dans Paramètres → Scénarios IA → choisis ta niche et ta plateforme → appuie sur Générer." },
  { q: "L'assistant IA ne répond pas ?", a: "Vérifie ta connexion internet. L'assistant IA nécessite une connexion pour fonctionner." },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
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
          <Text style={[styles.title, { color: colors.foreground }]}>Centre d'aide</Text>
          <View style={{ width: 40 }} />
        </View>

        <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroBanner}>
          <Feather name="help-circle" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 }}>Questions fréquentes</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              Trouve rapidement une réponse à ta question
            </Text>
          </View>
        </LinearGradient>

        <View style={{ gap: 8, marginTop: 20 }}>
          {FAQS.map((faq, i) => (
            <Pressable
              key={i}
              onPress={() => setExpanded(expanded === i ? null : i)}
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: expanded === i ? "#4DC8E8" : colors.border }]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: colors.foreground }]}>{faq.q}</Text>
                <Feather name={expanded === i ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              </View>
              {expanded === i ? (
                <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={20} color="#4DC8E8" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>Contacter le support</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>zawia.support@gmail.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18 },
  faqCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  faqQ: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  faqA: { marginTop: 10, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 20 },
});
