import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { useHistory } from "@/contexts/HistoryContext";
import { apiUrl } from "@/lib/api";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

const QUICK = [
  "Comment améliorer mon score viral ?",
  "Meilleur angle pour un selfie ?",
];

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "flux" | "chat";

// Étapes du pipeline avec navigation
const PIPELINE = [
  {
    n: 1, icon: "camera" as const, color: PRIMARY,
    title: "Analyse de scène",
    desc: "Occasion · Plateforme · Paramètres IA",
    route: "/(tabs)" as const,
    actionLabel: "Ouvrir caméra",
  },
  {
    n: 2, icon: "zap" as const, color: "#22C55E",
    title: "Prise guidée",
    desc: "Score · LUT · Guidage 🟢🟡🔴",
    route: "/shot-analyser" as const,
    actionLabel: "Analyser",
  },
  {
    n: 3, icon: "edit-3" as const, color: "#F59E0B",
    title: "Contenu préparé",
    desc: "Captions · Hashtags · Plateformes",
    route: "/captions" as const,
    actionLabel: "Générer",
  },
  {
    n: 4, icon: "send" as const, color: ACCENT,
    title: "Publication",
    desc: "Instagram · TikTok · Programmé",
    route: "/publish" as const,
    actionLabel: "Publier",
  },
];

export default function FlowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useHistory();
  const [tab, setTab] = useState<Tab>("flux");
  const [messages, setMessages] = useState<Msg[]>([{
    role: "assistant",
    content: "Bonjour ! Je suis Zawya, votre assistant IA. Posez-moi une question sur la caméra, les paramètres, ou la publication.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  // Stats session
  const avgScore = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    const history: Msg[] = [...messages, { role: "user", content: msg }];
    setMessages(history);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    try {
      const response = await fetch(apiUrl("/support/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json() as { reply?: string };
      const fullText = data.reply ?? "Je n'ai pas pu répondre. Réessayez.";
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fullText.slice(0, i) };
          return updated;
        });
        scrollRef.current?.scrollToEnd({ animated: false });
        if (i >= fullText.length) {
          clearInterval(interval);
          setLoading(false);
          if (voiceEnabled) {
            setSpeaking(true);
            Speech.speak(fullText, { language: "fr-FR", rate: 1.0, onDone: () => setSpeaking(false), onError: () => setSpeaking(false) });
          }
        }
      }, 18);
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: `Erreur réseau. Détail : ${(err as Error).message}` };
        return updated;
      });
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Flux IA</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Pipeline intelligent · Session active</Text>
        </View>
        {tab === "chat" ? (
          <Pressable
            onPress={() => { setVoiceEnabled(v => !v); if (speaking) { Speech.stop(); setSpeaking(false); } }}
            style={[styles.voiceBtn, { backgroundColor: voiceEnabled ? PRIMARY + "20" : colors.card, borderColor: voiceEnabled ? PRIMARY : colors.border }]}
          >
            <Feather name={voiceEnabled ? "volume-2" : "volume-x"} size={16} color={voiceEnabled ? PRIMARY : colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["flux", "chat"] as Tab[]).map(t => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, t === tab && styles.tabActive]}>
            <LinearGradient colors={t === tab ? [PRIMARY, ACCENT] : ["transparent", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabGrad}>
              <Feather name={t === "flux" ? "git-branch" : "message-circle"} size={14} color={t === tab ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.tabText, { color: t === tab ? "#fff" : colors.mutedForeground }]}>
                {t === "flux" ? "Pipeline" : "Assistant IA"}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      {/* ── TAB FLUX ── */}
      {tab === "flux" ? (
        <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

          {/* Stats session */}
          <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: PRIMARY + "40" }]}>
            <View style={[styles.sessionDot, { backgroundColor: "#22C55E" }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sessionTitle, { color: colors.foreground }]}>Session active</Text>
              <Text style={[styles.sessionSub, { color: colors.mutedForeground }]}>
                {items.length} publication{items.length > 1 ? "s" : ""} · Score moyen {avgScore > 0 ? avgScore : "—"}/100
              </Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: PRIMARY + "18" }]}>
              <Text style={[styles.scoreText, { color: PRIMARY }]}>{avgScore > 0 ? avgScore : "—"}</Text>
            </View>
          </View>

          {/* Pipeline 4 étapes */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pipeline IA</Text>
          {PIPELINE.map((step, i) => (
            <View key={step.n} style={{ flexDirection: "row", marginBottom: 4 }}>
              {/* Timeline */}
              <View style={{ alignItems: "center", width: 44 }}>
                <LinearGradient colors={[step.color, step.color + "88"]} style={styles.stepCircle}>
                  <Feather name={step.icon} size={16} color="#fff" />
                </LinearGradient>
                {i < PIPELINE.length - 1 ? <View style={[styles.stepLine, { backgroundColor: colors.border }]} /> : null}
              </View>
              {/* Card */}
              <Pressable
                onPress={() => router.push(step.route as never)}
                style={({ pressed }) => [styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1, flex: 1, marginLeft: 10, marginBottom: 14 }]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                    <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                  </View>
                  <View style={[styles.actionBtn, { backgroundColor: step.color + "18", borderColor: step.color + "40" }]}>
                    <Text style={[styles.actionBtnText, { color: step.color }]}>{step.actionLabel}</Text>
                    <Feather name="arrow-right" size={12} color={step.color} />
                  </View>
                </View>
              </Pressable>
            </View>
          ))}

          {/* CTA assistant */}
          <Pressable onPress={() => setTab("chat")} style={{ marginTop: 8 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chatCta}>
              <Feather name="message-circle" size={18} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }}>Poser une question à Zawya</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>Assistant IA · réponses en temps réel</Text>
              </View>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      ) : null}

      {/* ── TAB CHAT ── */}
      {tab === "chat" ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m, i) => (
              <View key={i} style={[
                styles.bubble,
                m.role === "user"
                  ? { alignSelf: "flex-end", backgroundColor: PRIMARY, borderBottomRightRadius: 4 }
                  : { alignSelf: "flex-start", backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
              ]}>
                {m.role === "assistant" && i === messages.length - 1 && loading && m.content === "" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ActivityIndicator size="small" color={PRIMARY} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>Zawya réfléchit…</Text>
                  </View>
                ) : (
                  <Text style={{ color: m.role === "user" ? "#fff" : colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 }}>
                    {m.content}
                    {loading && i === messages.length - 1 && m.role === "assistant" && m.content !== "" ? <Text style={{ color: PRIMARY }}>▌</Text> : null}
                  </Text>
                )}
              </View>
            ))}

            {messages.length <= 1 && !loading ? (
              <View style={{ gap: 8, marginTop: 8 }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 }}>SUGGESTIONS</Text>
                {QUICK.map(q => (
                  <Pressable key={q} onPress={() => send(q)} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="zap" size={13} color={PRIMARY} />
                    <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13 }}>{q}</Text>
                    <Feather name="arrow-up-right" size={13} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {/* Input — fixe au-dessus de la tab bar */}
          <View style={[styles.inputBar, {
            paddingBottom: Math.max(insets.bottom, 16) + 56,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }]}>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => send()}
                placeholder="Posez votre question…"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                multiline
                blurOnSubmit
                returnKeyType="send"
                editable={!loading}
              />
              <Pressable onPress={() => send()} disabled={loading || !input.trim()} style={[styles.sendBtn, { opacity: loading || !input.trim() ? 0.4 : 1 }]}>
                <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                <Feather name="send" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, flexDirection: "row", alignItems: "flex-end" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 2, fontSize: 12, fontFamily: "Inter_400Regular" },
  voiceBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, marginLeft: 10 },
  tabs: { flexDirection: "row", marginHorizontal: 20, marginVertical: 12, borderRadius: 14, borderWidth: 1, overflow: "hidden", padding: 4, gap: 4 },
  tabBtn: { flex: 1, borderRadius: 10, overflow: "hidden" },
  tabActive: {},
  tabGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sessionCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  sessionDot: { width: 10, height: 10, borderRadius: 999 },
  sessionTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  sessionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  scoreText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  stepCircle: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stepLine: { flex: 1, width: 2, marginTop: 4, marginBottom: -4, minHeight: 14 },
  stepCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  stepDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  chatCta: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18 },
  bubble: { maxWidth: "88%", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16 },
  quickBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  inputBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  inputWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 8, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
