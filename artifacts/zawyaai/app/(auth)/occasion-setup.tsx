import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";

const OCCASIONS = [
  { id: "selfie", label: "Selfie", icon: "smile" as const, color: "#4DC8E8", shot: "Plan poitrine" },
  { id: "wedding", label: "Mariage", icon: "heart" as const, color: "#EC4899", shot: "Plan moyen" },
  { id: "mukbang", label: "Mukbang", icon: "coffee" as const, color: "#F59E0B", shot: "Plan américain" },
  { id: "travel", label: "Voyage", icon: "map-pin" as const, color: "#22C55E", shot: "Plan large" },
  { id: "cooking", label: "Cuisine", icon: "feather" as const, color: "#F97316", shot: "Top Shot" },
  { id: "portrait", label: "Portrait", icon: "user" as const, color: "#7C3AED", shot: "Gros plan" },
  { id: "product", label: "Produit", icon: "box" as const, color: "#06B6D4", shot: "Très gros plan" },
  { id: "event", label: "Événement", icon: "calendar" as const, color: "#4DC8E8", shot: "Plan d'ensemble" },
  { id: "sport", label: "Sport", icon: "activity" as const, color: "#EF4444", shot: "Plan large" },
  { id: "fashion", label: "Mode", icon: "shopping-bag" as const, color: "#EC4899", shot: "Plan pied" },
  { id: "nature", label: "Nature", icon: "sun" as const, color: "#84CC16", shot: "Plan large" },
  { id: "business", label: "Business", icon: "briefcase" as const, color: "#64748B", shot: "Plan moyen" },
];

export default function OccasionSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  // Pré-sélectionner l'occasion déjà choisie
  useEffect(() => {
    AsyncStorage.getItem("zawia.occasion").then(v => { if (v) setSelected(v); });
  }, []);

  const onStart = async () => {
    if (!selected) return;
    await AsyncStorage.setItem("zawia.occasion", selected);
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}><Text style={{ color: "#fff" }}>Zaw</Text><Text style={{ color: "#4DC8E8" }}>IA</Text></Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Quel type{"\n"}de contenu ?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          L'IA adapte le cadrage, l'angle et les paramètres selon ton choix.
        </Text>

        <View style={styles.grid}>
          {OCCASIONS.map((o) => {
            const active = selected === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setSelected(o.id)}
                style={[styles.card, { backgroundColor: active ? `${o.color}18` : colors.card, borderColor: active ? o.color : colors.border }]}
              >
                {active ? (
                  <View style={[styles.checkDot, { backgroundColor: o.color }]}>
                    <Feather name="check" size={10} color="#fff" />
                  </View>
                ) : null}
                <View style={[styles.iconBox, { backgroundColor: `${o.color}22` }]}>
                  <Feather name={o.icon} size={22} color={o.color} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.foreground }]}>{o.label}</Text>
                <Text style={[styles.cardShot, { color: colors.mutedForeground }]}>{o.shot}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable onPress={() => router.replace("/(auth)/platform-setup")} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        </Pressable>
        <Pressable onPress={onStart} disabled={!selected} style={[{ flex: 1 }, !selected && { opacity: 0.4 }]}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>Commencer à filmer</Text>
            <Feather name="camera" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  badgeDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#4DC8E8" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  title: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.8, lineHeight: 40 },
  subtitle: { marginTop: 10, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  card: { width: "47%", padding: 14, borderRadius: 18, borderWidth: 1.5, gap: 8, position: "relative" },
  checkDot: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 999, alignItems: "center", justifyContent: "center", zIndex: 1 },
  iconBox: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardShot: { fontSize: 11, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { width: 52, height: 58, alignItems: "center", justifyContent: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 58, borderRadius: 16 },
  nextBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
});
