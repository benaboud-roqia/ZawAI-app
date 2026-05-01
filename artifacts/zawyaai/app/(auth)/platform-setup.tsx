import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";

type IconLib = "fa" | "fa5" | "feather";

type PlatformItem = {
  id: string;
  label: string;
  desc: string;
  color: string;
  gradient: [string, string];
  iconLib: IconLib;
  iconName: string;
};

const PLATFORMS: PlatformItem[] = [
  { id: "instagram",      label: "Instagram",       desc: "9:16 · Reels & Stories",  color: "#DD2A7B", gradient: ["#F58529", "#DD2A7B"], iconLib: "fa",      iconName: "instagram"      },
  { id: "instagram_reels",label: "Instagram Reels", desc: "9:16 · Reels uniquement", color: "#C13584", gradient: ["#833AB4", "#C13584"], iconLib: "fa",      iconName: "instagram"      },
  { id: "tiktok",         label: "TikTok",          desc: "9:16 · Vidéos courtes",   color: "#FE2C55", gradient: ["#25F4EE", "#FE2C55"], iconLib: "fa5",     iconName: "tiktok"         },
  { id: "snapchat",       label: "Snapchat",        desc: "9:16 · Spotlight",        color: "#FFFC00", gradient: ["#FFFC00", "#F4C800"], iconLib: "fa",      iconName: "snapchat-ghost" },
  { id: "youtube",        label: "YouTube Shorts",  desc: "9:16 · Shorts 60fps",     color: "#FF0000", gradient: ["#FF0000", "#CC0000"], iconLib: "fa",      iconName: "youtube-play"   },
  { id: "facebook",       label: "Facebook",        desc: "1:1 · Feed & Reels",      color: "#1877F2", gradient: ["#1877F2", "#0A5BC4"], iconLib: "fa",      iconName: "facebook"       },
  { id: "x",              label: "X (Twitter)",     desc: "16:9 · Posts",            color: "#1DA1F2", gradient: ["#1DA1F2", "#0D8BD9"], iconLib: "fa",      iconName: "twitter"        },
];

function PlatformIcon({ lib, name, size, color }: { lib: IconLib; name: string; size: number; color: string }) {
  if (lib === "fa5") return <FontAwesome5 name={name} size={size} color={color} />;
  if (lib === "fa")  return <FontAwesome  name={name as any} size={size} color={color} />;
  return <Feather name={name as any} size={size} color={color} />;
}

export default function PlatformSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  // Pré-sélectionner la plateforme déjà choisie
  useEffect(() => {
    AsyncStorage.getItem("zawia.platform").then(v => { if (v) setSelected(v); });
  }, []);

  const onNext = async () => {
    if (!selected) return;
    await AsyncStorage.setItem("zawia.platform", selected);
    // Toujours montrer le choix du contenu après la plateforme
    router.replace("/(auth)/occasion-setup");
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
          <Text style={styles.badgeText}>
            <Text style={{ color: "#fff" }}>Zaw</Text>
            <Text style={{ color: "#4DC8E8" }}>IA</Text>
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Sur quelle{"\n"}plateforme tu publies ?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          ZawIA adapte le format, la résolution et le ratio automatiquement.
        </Text>

        <View style={{ gap: 10, marginTop: 28 }}>
          {PLATFORMS.map((p) => {
            const active = selected === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                style={[styles.card, {
                  backgroundColor: active ? `${p.color}18` : colors.card,
                  borderColor: active ? p.color : colors.border,
                }]}
              >
                {/* Icône avec vrai gradient */}
                <LinearGradient colors={p.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBox}>
                  <PlatformIcon lib={p.iconLib} name={p.iconName} size={22} color="#fff" />
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: colors.foreground }]}>{p.label}</Text>
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
                </View>

                <View style={[styles.radio, {
                  borderColor: active ? p.color : colors.border,
                  backgroundColor: active ? p.color : "transparent",
                }]}>
                  {active ? <Feather name="check" size={12} color="#fff" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        </Pressable>
        <Pressable onPress={onNext} disabled={!selected} style={[{ flex: 1 }, !selected && { opacity: 0.4 }]}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>Suivant</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
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
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1.5 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  cardDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 999, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { width: 52, height: 58, alignItems: "center", justifyContent: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 58, borderRadius: 16 },
  nextBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
});
