import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
  premium?: boolean;
};

const LIVE: Feature[] = [
  { id: "tracking", title: "Tracking sujet", desc: "Suit le visage et reframe automatiquement", icon: "target" },
  { id: "light", title: "Coach lumière", desc: "Ajuste l'exposition en temps réel", icon: "sun" },
  { id: "director", title: "Directeur IA", desc: "Suggère angle et composition", icon: "compass" },
  { id: "lut", title: "LUT automatique", desc: "Étalonnage cinéma instantané", icon: "droplet", premium: true },
];

const POST: Feature[] = [
  { id: "autocut", title: "Auto-cut", desc: "Garde uniquement les meilleures séquences", icon: "scissors", premium: true },
  { id: "captions", title: "Captions multi-langues", desc: "Sous-titres FR / AR / EN auto", icon: "type" },
  { id: "viral", title: "Score viral", desc: "Prédit l'engagement avant publication", icon: "trending-up", premium: true },
  { id: "shot", title: "Shot Analyser", desc: "Note /100 avec conseils personnalisés", icon: "award" },
];

export default function AgentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [voice, setVoice] = useState(false);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>IA Agentic</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Votre directeur photo dans la poche
          </Text>
        </View>

        {/* Voice assistant card */}
        <View style={{ paddingHorizontal: 20 }}>
          <LinearGradient
            colors={["#1E1830", "#2A1B4A"]}
            style={[styles.voiceCard, { borderColor: colors.border }]}
          >
            <View style={styles.voiceLeft}>
              <View
                style={[
                  styles.voiceIcon,
                  { backgroundColor: voice ? colors.primary : colors.secondary },
                ]}
              >
                <Feather name="mic" size={20} color={voice ? "#fff" : colors.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.voiceTitle, { color: colors.foreground }]}>
                  Assistant vocal
                </Text>
                <Text style={[styles.voiceDesc, { color: colors.mutedForeground }]}>
                  Contrôlez l'app sans toucher l'écran
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setVoice(!voice)}
              style={[
                styles.toggle,
                {
                  backgroundColor: voice ? colors.primary : colors.secondary,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleDot,
                  { transform: [{ translateX: voice ? 22 : 2 }] },
                ]}
              />
            </Pressable>
          </LinearGradient>
        </View>

        <Section title="En direct pendant la prise" colors={colors}>
          {LIVE.map((f) => (
            <FeatureRow key={f.id} f={f} colors={colors} />
          ))}
        </Section>

        <Section title="Après la prise" colors={colors}>
          {POST.map((f) => (
            <FeatureRow key={f.id} f={f} colors={colors} />
          ))}
        </Section>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={[
              styles.tipCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="info" size={18} color={colors.primary} />
            <Text style={{ flex: 1, color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
              L'agent apprend de vos métriques. Plus vous l'utilisez, plus ses recommandations deviennent précises pour votre audience.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>{children}</View>
    </View>
  );
}

function FeatureRow({ f, colors }: { f: Feature; colors: any }) {
  return (
    <View
      style={[
        styles.featureCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
        <Feather name={f.icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.featureTitle, { color: colors.foreground }]}>
            {f.title}
          </Text>
          {f.premium ? (
            <View style={[styles.proBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
          {f.desc}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, fontFamily: "Inter_400Regular" },
  voiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  voiceLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  voiceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 999,
    justifyContent: "center",
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tipCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
});
