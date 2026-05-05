import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CinematicImage } from "@/components/CinematicImage";
import { LUTS, canUseLut, type Lut } from "@/constants/luts";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";
import { generateCaptions, type GeneratedCaption } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type PlatformItem = {
  id: string;
  name: string;
  icon: any;
  iconLib: "fa" | "fa5" | "feather";
  gradient: [string, string];
  format: string;
  loginColor: string;
};

// ─── Données plateformes ──────────────────────────────────────────────────────
const PLATFORMS: PlatformItem[] = [
  { id: "instagram",       name: "Instagram",      icon: "instagram",     iconLib: "fa",      gradient: ["#F58529", "#DD2A7B"], format: "9:16 · Reels",    loginColor: "#DD2A7B" },
  { id: "instagram_reels", name: "Instagram Reels",icon: "instagram",     iconLib: "fa",      gradient: ["#833AB4", "#C13584"], format: "9:16 · Reels",    loginColor: "#C13584" },
  { id: "tiktok",          name: "TikTok",         icon: "tiktok",        iconLib: "fa5",     gradient: ["#25F4EE", "#FE2C55"], format: "9:16 · Vidéo",    loginColor: "#FE2C55" },
  { id: "snapchat",        name: "Snapchat",       icon: "snapchat-ghost",iconLib: "fa",      gradient: ["#FFFC00", "#F4C800"], format: "9:16 · Spotlight", loginColor: "#F4C800" },
  { id: "youtube",         name: "YouTube Shorts", icon: "youtube-play",  iconLib: "fa",      gradient: ["#FF0000", "#CC0000"], format: "9:16 · Shorts",   loginColor: "#FF0000" },
  { id: "facebook",        name: "Facebook",       icon: "facebook",      iconLib: "fa",      gradient: ["#1877F2", "#0A5BC4"], format: "1:1 · Feed",      loginColor: "#1877F2" },
  { id: "x",               name: "X (Twitter)",    icon: "twitter",       iconLib: "fa",      gradient: ["#1DA1F2", "#0D8BD9"], format: "16:9 · Post",     loginColor: "#1DA1F2" },
];

const SUGGESTED_HASHTAGS = ["#ZawyaAI", "#cinematic", "#reels", "#contentcreator", "#aiphotography", "#filmmaker"];

// ─── Helper icône ─────────────────────────────────────────────────────────────
function PlatformIcon({ p, size, color }: { p: PlatformItem; size: number; color: string }) {
  if (p.iconLib === "fa5") return <FontAwesome5 name={p.icon} size={size} color={color} />;
  if (p.iconLib === "fa")  return <FontAwesome  name={p.icon} size={size} color={color} />;
  return <Feather name={p.icon} size={size} color={color} />;
}

// ─── Modal connexion réseau social ────────────────────────────────────────────
interface ConnectModalProps {
  visible: boolean;
  platform: PlatformItem | null;
  onClose: () => void;
  onConnected: (platformId: string) => void;
}

function ConnectModal({ visible, platform, onClose, onConnected }: ConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  if (!platform) return null;

  const handleConnect = async () => {
    setLoading(true);
    // Simule le flux OAuth — remplacer par le vrai SDK quand les clés sont prêtes
    await new Promise(r => setTimeout(r, 1800));
    await AsyncStorage.setItem(`zawia.connected.${platform.id}`, "true");
    setLoading(false);
    onConnected(platform.id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={cm.backdrop} onPress={onClose} />

      <View style={[cm.sheet, { paddingBottom: insets.bottom + 24 }]}>
        {/* Handle */}
        <View style={cm.handle} />

        {/* Close */}
        <Pressable style={cm.closeBtn} onPress={onClose} hitSlop={12}>
          <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>

        {/* Logo plateforme */}
        <LinearGradient colors={platform.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cm.logoWrap}>
          <PlatformIcon p={platform} size={36} color="#fff" />
        </LinearGradient>

        <Text style={cm.title}>Connecter {platform.name}</Text>
        <Text style={cm.subtitle}>
          Autorise ZawIA à publier sur ton compte{"\n"}{platform.name} en ton nom.
        </Text>

        {/* Ce que l'app demande */}
        <View style={cm.permissionsBox}>
          {[
            { icon: "upload", label: "Publier des photos et vidéos" },
            { icon: "eye",    label: "Voir ton profil public" },
            { icon: "lock",   label: "Jamais accès à ton mot de passe" },
          ].map((item) => (
            <View key={item.icon} style={cm.permRow}>
              <View style={[cm.permIcon, { backgroundColor: platform.loginColor + "22" }]}>
                <Feather name={item.icon as any} size={14} color={platform.loginColor} />
              </View>
              <Text style={cm.permText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Bouton connexion */}
        <Pressable
          onPress={handleConnect}
          disabled={loading}
          style={[cm.connectBtn, { backgroundColor: platform.loginColor, opacity: loading ? 0.8 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <PlatformIcon p={platform} size={18} color="#fff" />
              <Text style={cm.connectBtnText}>Se connecter avec {platform.name}</Text>
            </>
          )}
        </Pressable>

        <Text style={cm.legal}>
          En continuant, tu acceptes les conditions d'utilisation de {platform.name}.
        </Text>
      </View>
    </Modal>
  );
}

// ─── Écran principal Publish ──────────────────────────────────────────────────
export default function PublishScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const { add: addToHistory } = useHistory();
  const { user } = useAuth();
  const userPlan = user?.plan;
  const topPad = insets.top + 16;

  // Plateforme choisie dans platform-setup (AsyncStorage)
  const [chosenPlatformId, setChosenPlatformId] = useState<string>("instagram");
  // Plateformes connectées (OAuth fait)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  // Modal connexion
  const [connectTarget, setConnectTarget] = useState<PlatformItem | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const [caption, setCaption] = useState("Capture cinématographique réalisée avec ZawyaAI · directeur photo IA");
  const [hashtags, setHashtags] = useState<string[]>(["#ZawyaAI", "#cinematic"]);
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

  // Charger la plateforme choisie + les connexions existantes
  useEffect(() => {
    (async () => {
      const p = await AsyncStorage.getItem("zawia.platform");
      if (p) setChosenPlatformId(p);

      // Vérifier quelles plateformes sont déjà connectées
      const connected = new Set<string>();
      for (const plat of PLATFORMS) {
        const val = await AsyncStorage.getItem(`zawia.connected.${plat.id}`);
        if (val === "true") connected.add(plat.id);
      }
      setConnectedIds(connected);
    })();
  }, []);

  // La plateforme principale = celle choisie dans platform-setup
  const mainPlatform = PLATFORMS.find(p => p.id === chosenPlatformId) ?? PLATFORMS[0];
  const isMainConnected = connectedIds.has(mainPlatform.id);

  // Ouvrir la modal de connexion pour une plateforme
  const openConnect = (p: PlatformItem) => {
    setConnectTarget(p);
    setConnectModalOpen(true);
  };

  const onConnected = (platformId: string) => {
    setConnectedIds(prev => new Set([...prev, platformId]));
    setConnectModalOpen(false);
  };

  const onAutoLut = () => {
    setAnalysingLut(true);
    setAiSuggestedLut(null);
    setTimeout(() => {
      const candidates = LUTS.filter((l) => l.id !== "original" && canUseLut(l, userPlan));
      const pool = candidates.length > 0 ? candidates : LUTS.filter((l) => l.id !== "original");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setLutId(pick.id);
      setAiSuggestedLut(pick.id);
      setAnalysingLut(false);
    }, 1400);
  };

  const onPickLut = (l: Lut) => {
    if (!canUseLut(l, userPlan)) { router.push("/premium"); return; }
    setLutId(l.id);
  };

  const toggleHashtag = (h: string) =>
    setHashtags((arr) => arr.includes(h) ? arr.filter((x) => x !== h) : [...arr, h]);

  const onGenerate = async () => {
    setGenError(null);
    setGenerating(true);
    try {
      const results = await generateCaptions({
        platforms: [chosenPlatformId],
        topic: caption || "Capture cinématographique avec ZawyaAI",
        language: "fr",
        tone: "inspirant et premium",
      });
      if (results.length === 0) { setGenError("Aucun résultat. Réessayez."); return; }
      setAiResults(results);
      setActiveAiPlatform(results[0].platform);
      setCaption(results[0].caption);
      setHashtags(results[0].hashtags ?? []);
    } catch (e) {
      setGenError((e as Error).message ?? "Génération échouée");
    } finally {
      setGenerating(false);
    }
  };

  const applyAiPlatform = (platform: string) => {
    const found = aiResults.find((r) => r.platform.toLowerCase() === platform.toLowerCase());
    if (!found) return;
    setActiveAiPlatform(found.platform);
    setCaption(found.caption);
    setHashtags(found.hashtags ?? []);
  };

  const onPublish = async () => {
    // Si pas connecté → ouvrir la modal de connexion d'abord
    if (!isMainConnected) {
      openConnect(mainPlatform);
      return;
    }
    setPublishing(true);
    setTimeout(async () => {
      await addToHistory({ uri: uri ?? undefined, lut: lutId, platforms: [chosenPlatformId], caption, hashtags });
      setPublishing(false);
      Alert.alert(
        "Publication lancée ✅",
        `Votre contenu est en cours de diffusion sur ${mainPlatform.name}.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    }, 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable
            onPress={() => router.replace("/(auth)/platform-setup")}
            style={[s.newBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="camera" size={16} color="#4DC8E8" />
            <Text style={{ color: "#4DC8E8", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Nouveau</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={[s.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[s.title, { color: colors.foreground }]}>Publier maintenant</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          L'agent diffuse sur votre plateforme en un geste.
        </Text>

        {/* Preview */}
        <CinematicImage
          uri={uri}
          lut={activeLut}
          style={{ ...s.preview, backgroundColor: colors.card, borderColor: colors.border }}
          fallback={<LinearGradient colors={["#1a0e2e", "#1C1C1F"]} style={StyleSheet.absoluteFill} />}
        />
        <View style={s.previewBadgeWrap} pointerEvents="none">
          <View style={s.previewBadge}>
            <Feather name="check-circle" size={12} color="#22C55E" />
            <Text style={s.previewBadgeText}>
              {activeLut.id === "original" ? "Original" : `Étalonné · ${activeLut.name}`}
            </Text>
          </View>
        </View>

        {/* LUTs */}
        <View style={s.lutHeaderRow}>
          <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 0 }]}>Étalonnage cinéma</Text>
          <Pressable onPress={onAutoLut} disabled={analysingLut} style={[s.autoLutBtn, { borderColor: colors.primary }]}>
            {analysingLut ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="zap" size={13} color={colors.primary} />}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
              {analysingLut ? "Analyse…" : "Auto IA"}
            </Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {LUTS.map((l) => {
            const active = lutId === l.id;
            const suggested = aiSuggestedLut === l.id;
            const locked = !canUseLut(l, userPlan);
            return (
              <Pressable key={l.id} onPress={() => onPickLut(l)}>
                <View style={[s.lutThumb, { borderColor: active ? colors.primary : suggested ? colors.accent : colors.border, borderWidth: active || suggested ? 2 : 1 }]}>
                  <CinematicImage uri={uri} lut={l} style={StyleSheet.absoluteFillObject} fallback={<LinearGradient colors={["#1a0e2e", "#1C1C1F"]} style={StyleSheet.absoluteFill} />} />
                  {locked && (
                    <View style={s.lockedOverlay} pointerEvents="none">
                      <View style={[s.lockBadge, { backgroundColor: l.tier === "studio" ? colors.accent : colors.primary }]}>
                        <Feather name="lock" size={10} color="#fff" />
                        <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" }}>{l.tier === "studio" ? "STUDIO" : "PRO"}</Text>
                      </View>
                    </View>
                  )}
                  {suggested && !locked && (
                    <View style={[s.suggestedBadge, { backgroundColor: colors.accent }]}>
                      <Feather name="zap" size={9} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={{ marginTop: 6, color: locked ? colors.mutedForeground : active ? colors.primary : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11, textAlign: "center", width: 84 }} numberOfLines={1}>
                  {l.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── PLATEFORME CHOISIE + STATUT CONNEXION ── */}
        <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Publier sur</Text>

        {/* Carte plateforme principale */}
        <View style={[s.platformCard, { backgroundColor: colors.card, borderColor: isMainConnected ? mainPlatform.loginColor : colors.border }]}>
          <LinearGradient colors={mainPlatform.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.platformIconBox}>
            <PlatformIcon p={mainPlatform} size={24} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>{mainPlatform.name}</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>{mainPlatform.format}</Text>
          </View>
          {isMainConnected ? (
            <View style={[s.connectedBadge, { backgroundColor: "#22C55E22", borderColor: "#22C55E" }]}>
              <Feather name="check-circle" size={13} color="#22C55E" />
              <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Connecté</Text>
            </View>
          ) : (
            <Pressable onPress={() => openConnect(mainPlatform)} style={[s.connectSmallBtn, { backgroundColor: mainPlatform.loginColor }]}>
              <Feather name="log-in" size={13} color="#fff" />
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Connecter</Text>
            </Pressable>
          )}
        </View>

        {/* Autres plateformes disponibles */}
        <Text style={[s.otherTitle, { color: colors.mutedForeground }]}>AUTRES PLATEFORMES</Text>
        {PLATFORMS.filter(p => p.id !== chosenPlatformId).map(p => {
          const connected = connectedIds.has(p.id);
          return (
            <View key={p.id} style={[s.otherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient colors={p.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.otherIconBox}>
                <PlatformIcon p={p} size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{p.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}>{p.format}</Text>
              </View>
              {connected ? (
                <View style={[s.connectedBadge, { backgroundColor: "#22C55E22", borderColor: "#22C55E" }]}>
                  <Feather name="check" size={12} color="#22C55E" />
                  <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Connecté</Text>
                </View>
              ) : (
                <Pressable onPress={() => openConnect(p)} style={[s.connectSmallBtn, { backgroundColor: p.loginColor + "22", borderWidth: 1, borderColor: p.loginColor }]}>
                  <Text style={{ color: p.loginColor, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Connecter</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Légende */}
        <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Légende</Text>
        <View style={[s.captionWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholder="Écrivez votre légende…"
            placeholderTextColor={colors.mutedForeground}
            style={[s.captionInput, { color: colors.foreground }]}
          />
          <View style={s.captionFooter}>
            <Pressable onPress={onGenerate} disabled={generating} style={[s.captionAction, { opacity: generating ? 0.6 : 1 }]}>
              {generating ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="zap" size={13} color={colors.primary} />}
              <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                {generating ? "Génération…" : "Générer par IA"}
              </Text>
            </Pressable>
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{caption.length} / 2200</Text>
          </View>
          {genError && <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 8 }}>{genError}</Text>}
        </View>

        {aiResults.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, letterSpacing: 0.4 }}>VARIANTES IA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {aiResults.map((r) => {
                const meta = PLATFORMS.find((p) => p.id.toLowerCase() === r.platform.toLowerCase());
                const active = activeAiPlatform === r.platform;
                return (
                  <Pressable key={r.platform} onPress={() => applyAiPlatform(r.platform)}
                    style={[s.aiChip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}>
                    {meta && <PlatformIcon p={meta} size={16} color={active ? "#fff" : colors.foreground} />}
                    <Text style={{ color: active ? "#fff" : colors.foreground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>{meta?.name ?? r.platform}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Hashtags */}
        <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Hashtags suggérés</Text>
        <View style={s.hashtagsRow}>
          {SUGGESTED_HASHTAGS.map((h) => {
            const active = hashtags.includes(h);
            return (
              <Pressable key={h} onPress={() => toggleHashtag(h)}
                style={[s.hashtag, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}>
                <Text style={{ color: active ? "#fff" : colors.foreground, fontSize: 12, fontFamily: "Inter_500Medium" }}>{h}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Heure optimale */}
        <Pressable onPress={() => setAutoPublish(!autoPublish)}
          style={[s.autoCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 }]}>
          <View style={[s.rowIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
            <Feather name="clock" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Heure optimale</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>L'IA choisit le créneau le plus performant</Text>
          </View>
          <View style={[s.toggle, { backgroundColor: autoPublish ? colors.primary : colors.secondary }]}>
            <View style={[s.toggleDot, { transform: [{ translateX: autoPublish ? 22 : 2 }] }]} />
          </View>
        </Pressable>
      </ScrollView>

      {/* Bouton publier sticky */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 12, backgroundColor: "rgba(10,6,18,0.95)", borderTopColor: colors.border }]}>
        <PrimaryButton
          label={publishing ? "Diffusion en cours…" : isMainConnected ? `Publier sur ${mainPlatform.name}` : `Connecter ${mainPlatform.name} pour publier`}
          loading={publishing}
          onPress={onPublish}
        />
      </View>

      {/* Modal connexion */}
      <ConnectModal
        visible={connectModalOpen}
        platform={connectTarget}
        onClose={() => setConnectModalOpen(false)}
        onConnected={onConnected}
      />
    </View>
  );
}

// ─── Styles écran ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  closeBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 14, fontFamily: "Inter_400Regular" },
  preview: { marginTop: 20, height: 240, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  previewBadgeWrap: { marginTop: -36, marginLeft: 12, marginBottom: 12, alignSelf: "flex-start" },
  previewBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 999 },
  previewBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  lutHeaderRow: { marginTop: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  autoLutBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal
: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  lutThumb: { width: 84, height: 84, borderRadius: 12, overflow: "hidden", position: "relative" },
  suggestedBadge: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  lockBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  platformCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 16 },
  platformIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  connectedBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  connectSmallBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  otherTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 10 },
  otherCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  otherIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  captionWrap: { borderRadius: 14, borderWidth: 1, padding: 14 },
  captionInput: { minHeight: 80, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, textAlignVertical: "top" },
  captionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  captionAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  hashtagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hashtag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  autoCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggle: { width: 46, height: 26, borderRadius: 999, justifyContent: "center" },
  toggleDot: { width: 22, height: 22, borderRadius: 999, backgroundColor: "#fff" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
});

// ─── Styles modal connexion ───────────────────────────────────────────────────
const cm = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#16161A", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingHorizontal: 24, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 20 },
  closeBtn: { position: "absolute", top: 16, right: 20, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  logoWrap: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  permissionsBox: { width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, gap: 12, marginBottom: 24 },
  permRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  permIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  permText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  connectBtn: { width: "100%", height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 },
  connectBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  legal: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginBottom: 8 },
});
