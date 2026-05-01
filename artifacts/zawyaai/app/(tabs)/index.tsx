import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { analyzeExposure } from "@/lib/ai/exposureAI";
import { analyzeComposition } from "@/lib/ai/compositionAI";
import { startStabilityMonitor, stopStabilityMonitor } from "@/lib/ai/stabilityAI";
import { computeGlobalScore, type GlobalScore } from "@/lib/ai/scoreAI";
import { analyzeCameraFrame, getFallbackAnalysis, formatShotType, getLightingColor, getQualityScoreColor, type CameraAIAnalysis } from "@/lib/ai/cameraAI";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";
const BG      = "#0D0D0F";

// ─── Types ────────────────────────────────────────────────────────────────────
type CaptureMode = "photo" | "video";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#DD2A7B",
  tiktok:    "#FE2C55",
  snapchat:  "#F4C800",
  youtube:   "#FF0000",
  facebook:  "#1877F2",
  x:         "#1DA1F2",
};

const PLATFORM_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  instagram: "instagram",
  tiktok:    "music",
  snapchat:  "camera",
  youtube:   "youtube",
  facebook:  "facebook",
  x:         "twitter",
};

const OCCASION_DATA: Record<string, { shot: string; angle: string; iso: string; speed: string; wb: string; tip: string; tip2: string }> = {
  selfie:   { shot: "Plan poitrine",   angle: "High",      iso: "200",  speed: "1/120", wb: "6500K", tip: "Tiens le téléphone légèrement au-dessus des yeux.",          tip2: "Lumière naturelle face au sujet pour un rendu optimal." },
  wedding:  { shot: "Plan moyen",      angle: "Eye Level", iso: "400",  speed: "1/80",  wb: "5600K", tip: "Lumière naturelle, fond épuré, cadre horizontal.",            tip2: "Utilise le mode portrait pour un bokeh naturel." },
  mukbang:  { shot: "Plan américain",  angle: "High",      iso: "320",  speed: "1/100", wb: "5200K", tip: "Caméra à hauteur de table, éclairage face au sujet.",         tip2: "Éclairage chaud pour rendre la nourriture appétissante." },
  travel:   { shot: "Plan large",      angle: "Eye Level", iso: "400",  speed: "1/125", wb: "5600K", tip: "Inclure le décor, règle des tiers pour l'horizon.",           tip2: "Heure dorée pour des couleurs chaudes et naturelles." },
  cooking:  { shot: "Top Shot",        angle: "Top 90°",   iso: "200",  speed: "1/160", wb: "5500K", tip: "Caméra directement au-dessus, éclairage uniforme.",           tip2: "Éclairage uniforme au-dessus du sujet." },
  portrait: { shot: "Gros plan",       angle: "Eye Level", iso: "200",  speed: "1/160", wb: "5600K", tip: "Focus sur les yeux, fond légèrement flou.",                   tip2: "Lumière latérale douce pour sculpter le visage." },
  product:  { shot: "Très gros plan",  angle: "Top Shot",  iso: "100",  speed: "1/200", wb: "5500K", tip: "Fond neutre, éclairage latéral pour les textures.",           tip2: "Utilise un réflecteur pour éliminer les ombres dures." },
  event:    { shot: "Plan d'ensemble", angle: "High",      iso: "800",  speed: "1/125", wb: "3200K", tip: "Capturer l'ambiance générale avant les détails.",             tip2: "Mode nuit ou ISO élevé pour les scènes sombres." },
  sport:    { shot: "Plan large",      angle: "Low",       iso: "640",  speed: "1/250", wb: "5600K", tip: "Angle bas pour dynamiser l'action.",                          tip2: "Vitesse d'obturation rapide pour figer le mouvement." },
  fashion:  { shot: "Plan pied",       angle: "Eye Level", iso: "200",  speed: "1/160", wb: "5600K", tip: "Fond épuré, lumière latérale pour les textures.",             tip2: "Cherche des lignes directrices dans l'environnement." },
  nature:   { shot: "Plan large",      angle: "Eye Level", iso: "400",  speed: "1/125", wb: "5600K", tip: "Heure dorée, règle des tiers.",                               tip2: "Stabilise la caméra pour les longues expositions." },
  business: { shot: "Plan moyen",      angle: "Eye Level", iso: "320",  speed: "1/100", wb: "5200K", tip: "Fond professionnel, éclairage uniforme.",                     tip2: "Tenue soignée et arrière-plan épuré pour la crédibilité." },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── IA Modal ─────────────────────────────────────────────────────────────────
interface IaModalProps {
  visible: boolean;
  onClose: () => void;
  aiInfo: { icon: string; text: string; color: string; bg: string; pct: string };
  aiAnalysis: CameraAIAnalysis;
  insets: { bottom: number };
  router: ReturnType<typeof useRouter>;
}

function IaModal({ visible, onClose, aiInfo, aiAnalysis, insets, router }: IaModalProps) {
  const scoreColor = getQualityScoreColor(aiAnalysis.quality_score);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={s.modalBackdrop} onPress={onClose} />
      <View style={[s.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Handle bar */}
        <View style={s.modalHandle} />

        {/* Close button */}
        <Pressable style={s.modalClose} onPress={onClose} hitSlop={12}>
          <Feather name="x" size={20} color="#fff" />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
        >
          {/* AI guidance bar */}
          <View style={[s.aiBar, { backgroundColor: aiInfo.bg, borderColor: aiInfo.color + "55" }]}>
            <Text style={s.aiIcon}>{aiInfo.icon}</Text>
            <Text style={[s.aiText, { color: aiInfo.color }]}>{aiInfo.text}</Text>
            <View style={[s.aiPctBadge, { backgroundColor: aiInfo.color + "22" }]}>
              <Text style={[s.aiPct, { color: aiInfo.color }]}>{aiInfo.pct}</Text>
            </View>
          </View>

          {/* Score de qualité global */}
          <View style={s.scoreContainer}>
            <View style={[s.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[s.scoreValue, { color: scoreColor }]}>{aiAnalysis.quality_score}</Text>
              <Text style={s.scoreLabel}>Score</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.scoreTitle}>Qualité globale</Text>
              <Text style={s.scoreDesc}>
                {aiAnalysis.quality_score >= 90 ? "Excellent ! Prêt à publier" :
                 aiAnalysis.quality_score >= 75 ? "Très bon, quelques ajustements mineurs" :
                 aiAnalysis.quality_score >= 60 ? "Bon, améliorations recommandées" :
                 "Plusieurs ajustements nécessaires"}
              </Text>
            </View>
          </View>

          {/* 5 param cards (ajout de lighting) */}
          <View style={s.paramRow}>
            {(
              [
                { label: "Angle",     value: aiAnalysis.angle, icon: "maximize-2" as const },
                { label: "ISO",       value: aiAnalysis.iso,   icon: "sun"        as const },
                { label: "Vitesse",   value: aiAnalysis.speed, icon: "zap"        as const },
                { label: "WB",        value: aiAnalysis.wb,    icon: "droplet"    as const },
                { label: "Éclairage", value: aiAnalysis.lighting, icon: "sun"     as const },
              ] as const
            ).map((p) => (
              <View key={p.label} style={s.paramCard}>
                <Feather name={p.icon} size={14} color={PRIMARY} style={{ marginBottom: 4 }} />
                <Text style={s.paramValue}>{p.value}</Text>
                <Text style={s.paramLabel}>{p.label}</Text>
              </View>
            ))}
          </View>

          {/* Type de plan */}
          <View style={s.shotTypeCard}>
            <Feather name="film" size={16} color={PRIMARY} />
            <View style={{ flex: 1 }}>
              <Text style={s.shotTypeLabel}>Type de plan détecté</Text>
              <Text style={s.shotTypeValue}>{formatShotType(aiAnalysis.shot_type)}</Text>
            </View>
          </View>

          {/* DOP tips */}
          <Text style={s.sectionTitle}>Conseils du DOP IA</Text>
          {aiAnalysis.guidance.map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <LinearGradient
                colors={[PRIMARY, ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.tipIconWrap}
              >
                <Feather name={i === 0 ? "star" : "info"} size={13} color="#fff" />
              </LinearGradient>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}

          {/* Change content type */}
          <Pressable
            onPress={() => { router.push("/(auth)/occasion-setup" as never); onClose(); }}
            style={s.changeTypeBtn}
          >
            <Feather name="sliders" size={15} color={PRIMARY} />
            <Text style={s.changeTypeText}>Changer le type de contenu</Text>
            <Feather name="chevron-right" size={15} color={PRIMARY} />
          </Pressable>

          {/* Premium locked row */}
          <Pressable
            onPress={() => { router.push("/premium" as never); onClose(); }}
            style={s.premiumRow}
          >
            <LinearGradient
              colors={[PRIMARY + "22", ACCENT + "22"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.premiumGrad}
            >
              <Feather name="lock" size={15} color={ACCENT} />
              <Text style={s.premiumText}>
                Débloquer l'analyse IA avancée —{" "}
                <Text style={{ color: ACCENT }}>Premium</Text>
              </Text>
              <Feather name="chevron-right" size={15} color={ACCENT} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [, requestMicPermission] = useMicrophonePermissions();

  // Camera state
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing]       = useState<"front" | "back">("back");
  const [showGrid, setShowGrid]   = useState(false);
  const [mode, setMode]           = useState<CaptureMode>("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds]   = useState(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // IA modal
  const [iaOpen, setIaOpen] = useState(false);

  // IA réelle — score global calculé par les modules
  const [platform, setPlatform] = useState("instagram");
  const [occasion, setOccasion] = useState("selfie");

  // État pour l'analyse IA en temps réel
  const [aiAnalysis, setAiAnalysis] = useState<CameraAIAnalysis>(getFallbackAnalysis());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const data      = OCCASION_DATA[occasion] ?? OCCASION_DATA.selfie;
  const platColor = PLATFORM_COLORS[platform] ?? PRIMARY;
  const platIcon  = (PLATFORM_ICONS[platform] ?? "camera") as keyof typeof Feather.glyphMap;

  const [aiScore, setAiScore] = useState<GlobalScore>(() =>
    computeGlobalScore(
      analyzeExposure(),
      { isStable: true, tiltX: 0, tiltY: 0, recommendation: "Stable", state: "good" },
      analyzeComposition("selfie")
    )
  );

  // IA pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Mettre à jour le score IA toutes les 3 secondes
  useEffect(() => {
    const update = () => {
      const exposure = analyzeExposure();
      const composition = analyzeComposition(occasion);
      setAiScore(prev =>
        computeGlobalScore(exposure, { isStable: prev.guidance.state !== "bad", tiltX: 0, tiltY: 0, recommendation: "", state: prev.guidance.state }, composition)
      );
    };
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, [occasion]);

  // Analyse IA en temps réel avec l'API
  useEffect(() => {
    const analyzeFrame = async () => {
      if (!cameraRef.current || isAnalyzing) return;
      
      setIsAnalyzing(true);
      try {
        // Capturer une frame de la caméra
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3, // Basse qualité pour la vitesse
          skipProcessing: true,
        });

        if (photo?.base64) {
          // Analyser avec l'API Claude
          const analysis = await analyzeCameraFrame(photo.base64);
          if (analysis) {
            setAiAnalysis(analysis);
          }
        }
      } catch (error) {
        console.error("[Camera AI] Error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Analyser toutes les 2 secondes
    const interval = setInterval(analyzeFrame, 2000);
    
    // Première analyse immédiate
    analyzeFrame();

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Gyroscope — stabilité temps réel
  useEffect(() => {
    startStabilityMonitor((stability) => {
      const exposure = analyzeExposure();
      const composition = analyzeComposition(occasion);
      setAiScore(computeGlobalScore(exposure, stability, composition));
    });
    return () => stopStabilityMonitor();
  }, [occasion]);

  const aiInfo = {
    icon: aiAnalysis.quality_score >= 75 ? "🟢" : aiAnalysis.quality_score >= 50 ? "🟡" : "🔴",
    text: aiAnalysis.guidance[0] || aiScore.guidance.text,
    color: getLightingColor(aiAnalysis.lighting),
    bg: getLightingColor(aiAnalysis.lighting) + "22",
    pct: `${aiAnalysis.lighting_pct}%`,
  };

  // Reload when screen focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await AsyncStorage.getItem("zawia.platform");
        const o = await AsyncStorage.getItem("zawia.occasion");
        if (p) setPlatform(p);
        if (o) setOccasion(o);
      })();
    }, [])
  );

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recTimerRef.current = setInterval(() => setRecSeconds((n) => n + 1), 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      setRecSeconds(0);
    }
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [isRecording]);

  // ── Capture handlers ──────────────────────────────────────────────────────
  async function takePhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) router.push({ pathname: "/publish" as never, params: { uri: photo.uri } });
    } catch (_) { /* ignore */ }
  }

  async function startRecording() {
    if (!cameraRef.current) return;
    setIsRecording(true);
    try {
      await cameraRef.current.recordAsync({ maxDuration: 60 });
    } catch (_) { /* ignore */ }
    setIsRecording(false);
  }

  async function stopRecording() {
    cameraRef.current?.stopRecording();
    setIsRecording(false);
  }

  async function onCapture() {
    if (mode === "photo") {
      await takePhoto();
    } else {
      isRecording ? await stopRecording() : await startRecording();
    }
  }

  // ── Permission gates ───────────────────────────────────────────────────────
  if (!cameraPermission) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={PRIMARY} size="large" />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[s.centered, { paddingHorizontal: 32 }]}>
        <Feather name="camera-off" size={48} color={PRIMARY} style={{ marginBottom: 20 }} />
        <Text style={s.permTitle}>Accès à la caméra requis</Text>
        <Text style={s.permSub}>
          ZawyaAI a besoin de la caméra pour t'aider à filmer du contenu parfait.
        </Text>
        <PrimaryButton
          label="Autoriser la caméra"
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
          style={{ marginTop: 24, width: "100%" }}
        />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── FULL-SCREEN CAMERA ── */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* ── GRID OVERLAY ── */}
      {showGrid && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[s.gridLine, s.gridV1]} />
          <View style={[s.gridLine, s.gridV2]} />
          <View style={[s.gridLine, s.gridH1]} />
          <View style={[s.gridLine, s.gridH2]} />
        </View>
      )}

      {/* ── GHOST GUIDE ── */}
      <View style={s.ghostGuide} pointerEvents="none" />

      {/* ── REC BADGE ── */}
      {isRecording && (
        <View style={[s.recBadge, { top: insets.top + 12 }]}>
          <View style={s.recDot} />
          <Text style={s.recText}>REC {formatTime(recSeconds)}</Text>
        </View>
      )}

      {/* ── TOP BAR (floating) ── */}
      <View style={[s.topBar, { top: insets.top + 8 }]}>
        <View style={s.pillsRow}>
          {/* Petite flèche retour */}
          <Pressable
            onPress={() => router.push("/(auth)/platform-setup" as never)}
            style={s.backArrow}
          >
            <Feather name="chevron-left" size={20} color="#fff" />
          </Pressable>
          <View style={[s.pill, { backgroundColor: platColor + "33", borderColor: platColor }]}>
            <Feather name={platIcon} size={12} color={platColor} />
            <Text style={[s.pillText, { color: platColor }]}>{platform.replace("_", " ")}</Text>
          </View>
          <View style={[s.pill, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)" }]}>
            <Feather name="film" size={12} color="#fff" />
            <Text style={[s.pillText, { color: "#fff" }]}>{data.shot}</Text>
          </View>
        </View>

        {/* Right: grid + flip buttons */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => setShowGrid((v) => !v)}
            style={[s.iconBtn, showGrid && { backgroundColor: PRIMARY + "55" }]}
          >
            <Feather name="grid" size={18} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
            style={s.iconBtn}
          >
            <Feather name="refresh-cw" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── AI GUIDANCE BAR (floating, above bottom bar) ── */}
      <View style={[s.aiGuidanceWrap, { bottom: 56 + 140 + insets.bottom }]}>
        <View style={[s.aiBar, { backgroundColor: aiInfo.bg, borderColor: aiInfo.color + "55" }]}>
          <Text style={s.aiIcon}>{aiInfo.icon}</Text>
          <Text style={[s.aiText, { color: aiInfo.color }]}>{aiInfo.text}</Text>
          <View style={[s.aiPctBadge, { backgroundColor: aiInfo.color + "22" }]}>
            <Text style={[s.aiPct, { color: aiInfo.color }]}>{aiInfo.pct}</Text>
          </View>
        </View>
      </View>

      {/* ── BOTTOM BAR (floating) ── */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) + 8, bottom: 56 }]}>
        {/* Mode row */}
        <View style={s.modeRow}>
          {(["photo", "video"] as CaptureMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
            >
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m === "photo" ? "Photo" : "Vidéo"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Capture row */}
        <View style={s.captureRow}>
          {/* Publish button (replaces gallery) */}
          <Pressable onPress={() => router.push("/publish" as never)} style={s.sideBtn}>
            <Feather name="send" size={22} color={PRIMARY} />
          </Pressable>

          {/* Big capture button */}
          <Pressable onPress={onCapture} style={s.captureOuter}>
            {mode === "video" && isRecording ? (
              <View style={s.captureStopInner} />
            ) : (
              <LinearGradient
                colors={[PRIMARY, ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.captureInner}
              />
            )}
          </Pressable>

          {/* IA button — pulsing */}
          <Pressable onPress={() => setIaOpen(true)} style={s.iaBtnWrapper}>
            <Animated.View style={[s.iaGlowRing, { opacity: pulseAnim }]} />
            <Animated.View style={{ opacity: pulseAnim }}>
              <LinearGradient
                colors={[PRIMARY, ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.iaBtn}
              >
                <Text style={s.iaBtnLabel}>IA</Text>
                <Feather name="zap" size={13} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* ── IA MODAL ── */}
      <IaModal
        visible={iaOpen}
        onClose={() => setIaOpen(false)}
        aiInfo={aiInfo}
        aiAnalysis={aiAnalysis}
        insets={insets}
        router={router}
      />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ── Permission screens ────────────────────────────────────────────────────
  centered: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  permTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 10,
  },
  permSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Grid lines ────────────────────────────────────────────────────────────
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  gridV1: { left: "33.33%", top: 0, bottom: 0, width: StyleSheet.hairlineWidth },
  gridV2: { left: "66.66%", top: 0, bottom: 0, width: StyleSheet.hairlineWidth },
  gridH1: { top: "33.33%", left: 0, right: 0, height: StyleSheet.hairlineWidth },
  gridH2: { top: "66.66%", left: 0, right: 0, height: StyleSheet.hairlineWidth },

  // ── Ghost guide ───────────────────────────────────────────────────────────
  ghostGuide: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    bottom: "30%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    borderRadius: 12,
  },

  // ── REC badge ─────────────────────────────────────────────────────────────
  recBadge: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  recText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },

  // ── Top bar ───────────────────────────────────────────────────────────────
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 1,
    alignItems: "center",
  },
  backArrow: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── AI guidance bar (floating) ────────────────────────────────────────────
  aiGuidanceWrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  aiBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  aiIcon: {
    fontSize: 16,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  aiPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiPct: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modeBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
  },
  modeBtnText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  modeBtnTextActive: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  captureStopInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#EF4444",
  },

  // ── IA button ─────────────────────────────────────────────────────────────
  iaBtnWrapper: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  iaGlowRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: PRIMARY,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iaBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  iaBtnLabel: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },

  // ── IA Modal ──────────────────────────────────────────────────────────────
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // ── Param cards ───────────────────────────────────────────────────────────
  paramRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  paramCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  paramValue: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  paramLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },

  // ── Score de qualité ──────────────────────────────────────────────────────
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  scoreValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  scoreTitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  scoreDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },

  // ── Type de plan ──────────────────────────────────────────────────────────
  shotTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(77,200,232,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: PRIMARY + "33",
  },
  shotTypeLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  shotTypeValue: {
    fontSize: 15,
    color: PRIMARY,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Tips ──────────────────────────────────────────────────────────────────
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },

  // ── Change type button ────────────────────────────────────────────────────
  changeTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(77,200,232,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: PRIMARY + "33",
  },
  changeTypeText: {
    flex: 1,
    color: PRIMARY,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  // ── Premium row ───────────────────────────────────────────────────────────
  premiumRow: {
    borderRadius: 12,
    overflow: "hidden",
  },
  premiumGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT + "44",
  },
  premiumText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
