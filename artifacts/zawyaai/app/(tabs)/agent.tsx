import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
  premium?: boolean;
  action?: () => void;
};

export default function AgentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [voice, setVoice] = useState(false);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const isPro = user?.plan === "pro" || user?.plan === "studio";

  const showPremium = () => {
    router.push("/premium");
  };

  const LIVE: Feature[] = [
    {
      id: "tracking",
      title: "Tracking sujet",
      desc: "Suit le visage et reframe automatiquement",
      icon: "target",
      action: () => router.push("/tracking"),
    },
    {
      id: "light",
      title: "Coach lumière",
      desc: "Ajuste l'exposition en temps réel",
      icon: "sun",
      action: () => router.push("/light-coach"),
    },
    {
      id: "director",
      title: "Directeur IA",
      desc: "Suggère angle et composition",
      icon: "compass",
      action: () => router.push("/director-ia"),
    },
    {
      id: "lut",
      title: "LUT automatique",
      desc: "Étalonnage cinéma instantané",
      icon: "droplet",
      premium: true,
      action: () => router.push("/lut-auto"),
    },
  ];

  const POST: Feature[] = [
    {
      id: "autocut",
      title: "Auto-cut",
      desc: "Garde uniquement les meilleures séquences",
      icon: "scissors",
      premium: true,
      action: () => router.push("/auto-cut"),
    },
    {
      id: "captions",
      title: "Captions multi-langues",
      desc: "Sous-titres FR / AR / EN auto",
      icon: "type",
      action: () => router.push("/captions"),
    },
    {
      id: "viral",
      title: "Score viral",
      desc: "Prédit l'engagement avant publication",
      icon: "trending-up",
      premium: true,
      action: () => router.push("/viral-score"),
    },
    {
      id: "shot",
      title: "Shot Analyser",
      desc: "Note /100 avec conseils personnalisés",
      icon: "award",
      action: () => router.push("/shot-analyser"),
    },
  ];

  const onVoiceToggle = (val: boolean) => {
    setVoice(val);
    if (val) {
      Alert.alert(
        "Assistant vocal activé ✅",
        "Dites :\n• \"Photo\" pour prendre une photo\n• \"Vidéo\" pour enregistrer\n• \"Publier\" pour publier\n\nNote : nécessite un APK natif pour fonctionner complètement."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Studio IA</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Votre directeur photo dans la poche
          </Text>
        </View>

        {/* Assistant vocal */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={[styles.voiceCard, { backgroundColor: colors.card, borderColor: voice ? "#4DC8E8" : colors.border }]}>
            <LinearGradient
              colors={voice ? ["#4DC8E8", "#7C3AED"] : [colors.secondary, colors.secondary]}
              style={styles.voiceIcon}
            >
              <Feather name="mic" size={20} color={voice ? "#fff" : colors.mutedForeground} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.voiceTitle, { color: colors.foreground }]}>Assistant vocal</Text>
              <Text style={[styles.voiceDesc, { color: colors.mutedForeground }]}>
                {voice ? "Actif — dites \"Photo\", \"Vidéo\", \"Publier\"" : "Contrôlez l'app sans toucher l'écran"}
              </Text>
            </View>
            <Switch
              value={voice}
              onValueChange={onVoiceToggle}
              trackColor={{ true: "#4DC8E8", false: colors.secondary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* En direct */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>En direct pendant la prise</Text>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {LIVE.map((f) => (
              <Pressable
                key={f.id}
                onPress={f.action}
                style={({ pressed }) => [
                  styles.featureCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: "rgba(77,200,232,0.15)" }]}>
                  <Feather name={f.icon} size={18} color="#4DC8E8" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                    {f.premium && !isPro ? (
                      <View style={[styles.proBadge, { backgroundColor: "#7C3AED" }]}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                </View>
                <Feather name={f.premium && !isPro ? "lock" : "chevron-right"} size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Après la prise */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Après la prise</Text>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {POST.map((f) => (
              <Pressable
                key={f.id}
                onPress={f.action}
                style={({ pressed }) => [
                  styles.featureCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: "rgba(77,200,232,0.15)" }]}>
                  <Feather name={f.icon} size={18} color="#4DC8E8" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                    {f.premium && !isPro ? (
                      <View style={[styles.proBadge, { backgroundColor: "#7C3AED" }]}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                </View>
                <Feather name={f.premium && !isPro ? "lock" : "chevron-right"} size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Galerie intelligente */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Galerie intelligente</Text>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            <Pressable onPress={() => router.push("/gallery")} style={({ pressed }) => [styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.featureIcon, { backgroundColor: "rgba(77,200,232,0.15)" }]}>
                <Feather name="grid" size={18} color="#4DC8E8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>Galerie IA</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>Toutes tes photos · Filtres · Comparaison LUT</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={18} color="#4DC8E8" />
            <Text style={{ flex: 1, color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
              L'agent apprend de vos métriques. Plus vous l'utilisez, plus ses recommandations deviennent précises pour votre audience.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, fontFamily: "Inter_400Regular" },
  voiceCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, borderWidth: 1, gap: 14 },
  voiceIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  voiceTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  voiceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", paddingHorizontal: 20, marginBottom: 12 },
  featureCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  featureIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tipCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
});
