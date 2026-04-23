import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { CinematicImage } from "@/components/CinematicImage";
import { LUTS, type Lut } from "@/constants/luts";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { generateCaptions, type GeneratedCaption } from "@/lib/api";

type Platform = {
  id: string;
  name: string;
  icon: any;
  iconLib: "fa" | "fa5" | "feather";
  gradient: [string, string];
  format: string;
};

const PLATFORMS: Platform[] = [
  { id: "instagram", name: "Instagram", icon: "instagram", iconLib: "fa", gradient: ["#F58529", "#DD2A7B"], format: "9:16 · Reels" },
  { id: "tiktok", name: "TikTok", icon: "tiktok", iconLib: "fa5", gradient: ["#25F4EE", "#FE2C55"], format: "9:16 · Vidéo" },
  { id: "snapchat", name: "Snapchat", icon: "snapchat-ghost", iconLib: "fa", gradient: ["#FFFC00", "#F4C800"], format: "9:16 · Spotlight" },
  { id: "youtube", name: "YouTube Shorts", icon: "youtube-play", iconLib: "fa", gradient: ["#FF0000", "#CC0000"], format: "9:16 · Shorts" },
  { id: "facebook", name: "Facebook", icon: "facebook", iconLib: "fa", gradient: ["#1877F2", "#0A5BC4"], format: "1:1 · Feed" },
  { id: "x", name: "X (Twitter)", icon: "twitter", iconLib: "fa", gradient: ["#1DA1F2", "#0D8BD9"], format: "16:9 · Post" },
];

const SUGGESTED_HASHTAGS = [
  "#ZawyaAI",
  "#cinematic",
  "#reels",
  "#contentcreator",
  "#aiphotography",
  "#filmmaker",
];

export default function PublishScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [selected, setSelected] = useState<string[]>(["instagram", "tiktok"]);
  const [caption, setCaption] = useState(
    "Capture cinématographique réalisée avec ZawyaAI · directeur photo IA",
  );
  const [hashtags, setHashtags] = useState<string[]>([
    "#ZawyaAI",
    "#cinematic",
  ]);
  const [autoPublish, setAutoPublish] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<GeneratedCaption[]>([]);
  const [activeAiPlatform, setActiveAiPlatform] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [lutId, setLutId] = useState<string>("teal-orange");
  const [analysingLut, setAnalysingLut] = useState(false);
  const [aiSuggestedLut, setAiSuggestedLut] = useState<string | null>(null);

  const activeLut: Lut = LUTS.find((l) => l.id === lutId) ?? LUTS[0];

  const onAutoLut = () => {
    setAnalysingLut(true);
    setAiSuggestedLut(null);
    setTimeout(() => {
      const candidates = LUTS.filter((l) => l.id !== "original");
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setLutId(pick.id);
      setAiSuggestedLut(pick.id);
      setAnalysingLut(false);
    }, 1400);
  };

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const toggleHashtag = (h: string) =>
    setHashtags((arr) =>
      arr.includes(h) ? arr.filter((x) => x !== h) : [...arr, h],
    );

  const onGenerate = async () => {
    if (selected.length === 0) {
      setGenError("Sélectionnez au moins une plateforme.");
      return;
    }
    setGenError(null);
    setGenerating(true);
    try {
      const results = await generateCaptions({
        platforms: selected,
        topic: caption || "Capture cinématographique avec ZawyaAI",
        language: "fr",
        tone: "inspirant et premium",
      });
      if (results.length === 0) {
        setGenError("Aucun résultat. Réessayez.");
        setGenerating(false);
        return;
      }
      setAiResults(results);
      const first = results[0];
      setActiveAiPlatform(first.platform);
      setCaption(first.caption);
      setHashtags(first.hashtags ?? []);
    } catch (e) {
      const err = e as Error;
      setGenError(err.message ?? "Génération échouée");
    } finally {
      setGenerating(false);
    }
  };

  const applyAiPlatform = (platform: string) => {
    const found = aiResults.find(
      (r) => r.platform.toLowerCase() === platform.toLowerCase(),
    );
    if (!found) return;
    setActiveAiPlatform(found.platform);
    setCaption(found.caption);
    setHashtags(found.hashtags ?? []);
  };

  const onPublish = async () => {
    if (selected.length === 0) {
      if (Platform.OS === "web") return;
      Alert.alert("Sélectionnez au moins une plateforme.");
      return;
    }
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      const names = selected
        .map((id) => PLATFORMS.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      if (Platform.OS === "web") {
        router.back();
      } else {
        Alert.alert(
          "Publication lancée",
          `Votre contenu est en cours de diffusion sur : ${names}.`,
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    }, 1400);
  };

  const renderIcon = (p: Platform, color: string) => {
    if (p.iconLib === "fa5") {
      return <FontAwesome5 name={p.icon} size={22} color={color} />;
    }
    if (p.iconLib === "feather") {
      return <Feather name={p.icon} size={22} color={color} />;
    }
    return <FontAwesome name={p.icon} size={22} color={color} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Publier maintenant
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          L'agent diffuse sur toutes vos plateformes en un geste.
        </Text>

        {/* Preview with cinematic LUT */}
        <CinematicImage
          uri={uri}
          lut={activeLut}
          style={{
            ...styles.preview,
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          fallback={
            <LinearGradient
              colors={["#1a0e2e", "#2A1B4A"]}
              style={StyleSheet.absoluteFill}
            />
          }
        />
        <View style={styles.previewBadgeWrap} pointerEvents="none">
          <View style={styles.previewBadge}>
            <Feather name="check-circle" size={12} color="#22C55E" />
            <Text style={styles.previewBadgeText}>
              {activeLut.id === "original"
                ? "Original"
                : `Étalonné · ${activeLut.name}`}
            </Text>
          </View>
        </View>

        {/* Cinematic LUTs */}
        <View style={styles.lutHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 0 }]}>
            Étalonnage cinéma
          </Text>
          <Pressable
            onPress={onAutoLut}
            disabled={analysingLut}
            style={[styles.autoLutBtn, { borderColor: colors.primary }]}
          >
            {analysingLut ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="zap" size={13} color={colors.primary} />
            )}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
              {analysingLut ? "Analyse…" : "Auto IA"}
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        >
          {LUTS.map((l) => {
            const active = lutId === l.id;
            const suggested = aiSuggestedLut === l.id;
            return (
              <Pressable key={l.id} onPress={() => setLutId(l.id)}>
                <View
                  style={[
                    styles.lutThumb,
                    {
                      borderColor: active
                        ? colors.primary
                        : suggested
                          ? colors.accent
                          : colors.border,
                      borderWidth: active || suggested ? 2 : 1,
                    },
                  ]}
                >
                  <CinematicImage
                    uri={uri}
                    lut={l}
                    style={StyleSheet.absoluteFillObject}
                    fallback={
                      <LinearGradient
                        colors={["#1a0e2e", "#2A1B4A"]}
                        style={StyleSheet.absoluteFill}
                      />
                    }
                  />
                  {suggested ? (
                    <View style={[styles.suggestedBadge, { backgroundColor: colors.accent }]}>
                      <Feather name="zap" size={9} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <Text
                  style={{
                    marginTop: 6,
                    color: active ? colors.primary : colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 11,
                    textAlign: "center",
                    width: 84,
                  }}
                  numberOfLines={1}
                >
                  {l.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Platforms */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
          Plateformes
        </Text>
        <View style={styles.platforms}>
          {PLATFORMS.map((p) => {
            const active = selected.includes(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={[
                  styles.platformCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                <LinearGradient
                  colors={p.gradient}
                  style={styles.platformIcon}
                >
                  {renderIcon(p, "#fff")}
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.platformName, { color: colors.foreground }]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.platformFormat, { color: colors.mutedForeground }]}>
                    {p.format}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : "transparent",
                    },
                  ]}
                >
                  {active ? <Feather name="check" size={14} color="#fff" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Caption */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
          Légende
        </Text>
        <View
          style={[
            styles.captionWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholder="Écrivez votre légende…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.captionInput, { color: colors.foreground }]}
          />
          <View style={styles.captionFooter}>
            <Pressable
              onPress={onGenerate}
              disabled={generating}
              style={[styles.captionAction, { opacity: generating ? 0.6 : 1 }]}
            >
              {generating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather name="zap" size={13} color={colors.primary} />
              )}
              <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                {generating ? "Génération…" : "Générer par IA"}
              </Text>
            </Pressable>
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
              {caption.length} / 2200
            </Text>
          </View>
          {genError ? (
            <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 8 }}>
              {genError}
            </Text>
          ) : null}
        </View>

        {aiResults.length > 0 ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, letterSpacing: 0.4 }}>
              VARIANTES IA PAR PLATEFORME
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {aiResults.map((r) => {
                const meta = PLATFORMS.find(
                  (p) => p.id.toLowerCase() === r.platform.toLowerCase(),
                );
                const active = activeAiPlatform === r.platform;
                return (
                  <Pressable
                    key={r.platform}
                    onPress={() => applyAiPlatform(r.platform)}
                    style={[
                      styles.aiChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {meta ? renderIcon(meta, active ? "#fff" : colors.foreground) : null}
                    <Text style={{ color: active ? "#fff" : colors.foreground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                      {meta?.name ?? r.platform}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Hashtags */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
          Hashtags suggérés
        </Text>
        <View style={styles.hashtagsRow}>
          {SUGGESTED_HASHTAGS.map((h) => {
            const active = hashtags.includes(h);
            return (
              <Pressable
                key={h}
                onPress={() => toggleHashtag(h)}
                style={[
                  styles.hashtag,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? "#fff" : colors.foreground,
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {h}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Auto publish */}
        <Pressable
          onPress={() => setAutoPublish(!autoPublish)}
          style={[
            styles.autoCard,
            { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 },
          ]}
        >
          <View style={[styles.rowIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
            <Feather name="clock" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              Heure optimale
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              L'IA choisit le créneau le plus performant
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: autoPublish ? colors.primary : colors.secondary },
            ]}
          >
            <View
              style={[
                styles.toggleDot,
                { transform: [{ translateX: autoPublish ? 22 : 2 }] },
              ]}
            />
          </View>
        </Pressable>
      </ScrollView>

      {/* Sticky publish button */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: "rgba(10,6,18,0.95)",
            borderTopColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          label={
            publishing
              ? "Diffusion en cours…"
              : selected.length > 0
                ? `Publier sur ${selected.length} plateforme${selected.length > 1 ? "s" : ""}`
                : "Sélectionner des plateformes"
          }
          loading={publishing}
          disabled={selected.length === 0}
          onPress={onPublish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 14, fontFamily: "Inter_400Regular" },
  preview: {
    marginTop: 20,
    height: 240,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  previewBadgeWrap: {
    marginTop: -36,
    marginLeft: 12,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 999,
  },
  lutHeaderRow: {
    marginTop: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  autoLutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  lutThumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  suggestedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  platforms: { gap: 10 },
  platformCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  platformIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  platformFormat: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  captionWrap: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  captionInput: {
    minHeight: 80,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    textAlignVertical: "top",
  },
  captionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  captionAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  hashtagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hashtag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  autoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
});
