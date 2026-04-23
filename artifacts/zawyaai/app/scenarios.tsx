import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { generateScenario, type Scenario } from "@/lib/api";

const NICHES = [
  { id: "cuisine", name: "Cuisine", icon: "coffee", color: "#F59E0B" },
  { id: "mode", name: "Mode", icon: "shopping-bag", color: "#EC4899" },
  { id: "voyage", name: "Voyage", icon: "map", color: "#06B6D4" },
  { id: "fitness", name: "Fitness", icon: "activity", color: "#22C55E" },
  { id: "lifestyle", name: "Lifestyle", icon: "sun", color: "#A855F7" },
  { id: "beauté", name: "Beauté", icon: "star", color: "#C026D3" },
  { id: "tech", name: "Tech", icon: "smartphone", color: "#3B82F6" },
  { id: "musique", name: "Musique", icon: "music", color: "#EF4444" },
];

const PLATFORMS = ["TikTok", "Instagram", "YouTube Shorts"];
const DURATIONS = [15, 30, 45, 60];

export default function ScenariosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [niche, setNiche] = useState("Lifestyle");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(30);
  const [platform, setPlatform] = useState("TikTok");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setScenario(null);
    try {
      const result = await generateScenario({ niche, topic, duration, platform });
      setScenario(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Scénarios IA</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Plans de tournage générés par Claude
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Niche picker */}
        <Text style={[styles.label, { color: colors.foreground }]}>Niche</Text>
        <View style={styles.nichesGrid}>
          {NICHES.map((n) => {
            const active = niche === n.name;
            return (
              <Pressable
                key={n.id}
                onPress={() => setNiche(n.name)}
                style={[
                  styles.nicheChip,
                  {
                    backgroundColor: active ? n.color : colors.card,
                    borderColor: active ? n.color : colors.border,
                  },
                ]}
              >
                <Feather name={n.icon as any} size={14} color={active ? "#fff" : n.color} />
                <Text
                  style={{
                    color: active ? "#fff" : colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                >
                  {n.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Topic */}
        <Text style={[styles.label, { color: colors.foreground }]}>Sujet (optionnel)</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="Ex: recette tiramisu express, look automne..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        />

        {/* Duration & platform */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Durée</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {DURATIONS.map((d) => {
                const active = duration === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDuration(d)}
                    style={[
                      styles.smallChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                      {d}s
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Plateforme</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {PLATFORMS.map((p) => {
                const active = platform === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPlatform(p)}
                    style={[
                      styles.smallChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Generate button */}
        <Pressable onPress={onGenerate} disabled={loading} style={{ marginTop: 18 }}>
          <LinearGradient
            colors={["#A855F7", "#C026D3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.genBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="zap" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 }}>
                  Générer le scénario
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {error ? (
          <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 12, textAlign: "center" }}>
            {error}
          </Text>
        ) : null}

        {/* Scenario result */}
        {scenario ? (
          <View style={{ marginTop: 24 }}>
            <LinearGradient
              colors={["#1a0e2e", "#2A1B4A"]}
              style={styles.scenarioHero}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 }}>
                {scenario.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 8, lineHeight: 19, fontStyle: "italic" }}>
                « {scenario.hook} »
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <Tag icon="clock" label={`${scenario.totalDuration}s`} />
                <Tag icon="aperture" label={scenario.suggestedLut} />
                <Tag icon="music" label={scenario.musicMood?.slice(0, 30)} />
              </View>
            </LinearGradient>

            <Text style={[styles.shotHeader, { color: colors.foreground }]}>
              Plan de tournage
            </Text>

            {scenario.shots?.map((shot) => (
              <View
                key={shot.n}
                style={[styles.shotCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.shotNumber, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }}>
                    {shot.n}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <View style={[styles.shotBadge, { backgroundColor: "rgba(168,85,247,0.18)" }]}>
                      <Text style={{ color: "#A855F7", fontFamily: "Inter_600SemiBold", fontSize: 10 }}>
                        {shot.shotType}
                      </Text>
                    </View>
                    <View style={[styles.shotBadge, { backgroundColor: "rgba(192,38,211,0.18)" }]}>
                      <Text style={{ color: "#C026D3", fontFamily: "Inter_600SemiBold", fontSize: 10 }}>
                        {shot.angle}
                      </Text>
                    </View>
                    <View style={[styles.shotBadge, { backgroundColor: "rgba(245,158,11,0.18)" }]}>
                      <Text style={{ color: "#F59E0B", fontFamily: "Inter_600SemiBold", fontSize: 10 }}>
                        {shot.duration}s
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 19 }}>
                    {shot.description}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }}>
                      🎥 {shot.movement}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }}>
                      ✂️ {shot.transition}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {scenario.tips?.length > 0 ? (
              <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 10 }}>
                  💡 Conseils du DOP
                </Text>
                {scenario.tips.map((t, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
                    <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>•</Text>
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 }}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Tag({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.tag}>
      <Feather name={icon as any} size={11} color="#fff" />
      <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 13, fontFamily: "Inter_400Regular" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  nichesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nicheChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  genBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  scenarioHero: {
    padding: 18,
    borderRadius: 18,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  shotHeader: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 22,
    marginBottom: 10,
  },
  shotCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  shotNumber: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  shotBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
});
