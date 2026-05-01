import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type WatermarkType = "text" | "logo";

const POSITIONS: { id: Position; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: "top-left",     label: "Haut gauche",  icon: "arrow-up-left"   },
  { id: "top-right",    label: "Haut droite",  icon: "arrow-up-right"  },
  { id: "center",       label: "Centre",       icon: "maximize-2"      },
  { id: "bottom-left",  label: "Bas gauche",   icon: "arrow-down-left" },
  { id: "bottom-right", label: "Bas droite",   icon: "arrow-down-right"},
];

export default function WatermarkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [type, setType]         = useState<WatermarkType>("text");
  const [text, setText]         = useState("@ZawIA");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [opacity, setOpacity]   = useState(70);
  const [size, setSize]         = useState(14);
  const [enabled, setEnabled]   = useState(true);

  const positionStyle = (pos: Position): object => {
    const base = { position: "absolute" as const, padding: 8 };
    switch (pos) {
      case "top-left":     return { ...base, top: 8, left: 8 };
      case "top-right":    return { ...base, top: 8, right: 8 };
      case "center":       return { ...base, top: "50%", left: "50%", transform: [{ translateX: -30 }, { translateY: -10 }] };
      case "bottom-left":  return { ...base, bottom: 8, left: 8 };
      case "bottom-right": return { ...base, bottom: 8, right: 8 };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Watermark</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Aperçu */}
        <View style={[styles.preview, { backgroundColor: "#1a1a2e" }]}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Feather name="image" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 8 }}>Aperçu de la photo</Text>
          </View>
          {enabled ? (
            <View style={positionStyle(position)}>
              <Text style={{ color: `rgba(255,255,255,${opacity / 100})`, fontFamily: "Inter_700Bold", fontSize: size }}>
                {text || "@ZawIA"}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Activer/désactiver */}
        <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: enabled ? PRIMARY : colors.border }]}>
          <LinearGradient colors={enabled ? [PRIMARY, ACCENT] : [colors.secondary, colors.secondary]} style={styles.toggleIcon}>
            <Feather name="droplet" size={18} color={enabled ? "#fff" : colors.mutedForeground} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: colors.foreground }]}>Watermark activé</Text>
            <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>Appliqué automatiquement à chaque photo</Text>
          </View>
          <Pressable onPress={() => setEnabled(e => !e)} style={[styles.toggle, { backgroundColor: enabled ? PRIMARY : colors.secondary }]}>
            <View style={[styles.toggleDot, { transform: [{ translateX: enabled ? 22 : 2 }] }]} />
          </Pressable>
        </View>

        {/* Texte */}
        <Text style={[styles.label, { color: colors.foreground }]}>Texte du watermark</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="type" size={16} color={colors.mutedForeground} />
          <TextInput value={text} onChangeText={setText} placeholder="@votre_nom" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
        </View>

        {/* Position */}
        <Text style={[styles.label, { color: colors.foreground }]}>Position</Text>
        <View style={styles.posGrid}>
          {POSITIONS.map(p => (
            <Pressable key={p.id} onPress={() => setPosition(p.id)} style={[styles.posBtn, { backgroundColor: position === p.id ? PRIMARY + "22" : colors.card, borderColor: position === p.id ? PRIMARY : colors.border }]}>
              <Feather name={p.icon} size={16} color={position === p.id ? PRIMARY : colors.mutedForeground} />
              <Text style={[styles.posBtnText, { color: position === p.id ? PRIMARY : colors.mutedForeground }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Opacité */}
        <Text style={[styles.label, { color: colors.foreground }]}>Opacité — {opacity}%</Text>
        <View style={styles.sliderRow}>
          {[20, 40, 60, 80, 100].map(v => (
            <Pressable key={v} onPress={() => setOpacity(v)} style={[styles.sliderBtn, { backgroundColor: opacity === v ? PRIMARY : colors.card, borderColor: opacity === v ? PRIMARY : colors.border }]}>
              <Text style={[styles.sliderBtnText, { color: opacity === v ? "#fff" : colors.mutedForeground }]}>{v}%</Text>
            </Pressable>
          ))}
        </View>

        {/* Taille */}
        <Text style={[styles.label, { color: colors.foreground }]}>Taille — {size}px</Text>
        <View style={styles.sliderRow}>
          {[10, 12, 14, 18, 24].map(v => (
            <Pressable key={v} onPress={() => setSize(v)} style={[styles.sliderBtn, { backgroundColor: size === v ? PRIMARY : colors.card, borderColor: size === v ? PRIMARY : colors.border }]}>
              <Text style={[styles.sliderBtnText, { color: size === v ? "#fff" : colors.mutedForeground }]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        {/* Sauvegarder */}
        <Pressable onPress={() => router.back()} style={{ marginTop: 24 }}>
          <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Sauvegarder</Text>
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
  preview: { height: 200, borderRadius: 18, marginBottom: 20, overflow: "hidden", position: "relative" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  toggleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toggleTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  toggleDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 999, justifyContent: "center" },
  toggleDot: { width: 22, height: 22, borderRadius: 999, backgroundColor: "#fff" },
  label: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 50, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  posGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  posBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  posBtnText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  sliderRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sliderBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  sliderBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 16 },
  saveBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});
