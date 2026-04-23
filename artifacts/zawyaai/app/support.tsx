import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { chatSupport, type ChatMessage } from "@/lib/api";
import { PLAN_LABELS, supportMessageLimit } from "@/lib/entitlements";

const QUICK_PROMPTS = [
  "Ma caméra ne s'ouvre pas, que faire ?",
  "Comment publier sur TikTok ?",
  "Différence entre Pro et Studio ?",
  "Conseils pour un meilleur cadrage",
];

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour, je suis Zawya, votre assistant ZawyaAI. Posez-moi une question sur l'app : caméra, publication, plans Premium, conseils créatifs… je suis là.",
};

export default function SupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const limit = supportMessageLimit(user?.plan);
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - userMsgCount);
  const limitReached = remaining === 0;

  const send = async (textInput?: string) => {
    const text = (textInput ?? input).trim();
    if (!text || loading) return;
    if (limitReached) {
      router.push("/premium");
      return;
    }
    setInput("");
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const reply = await chatSupport(
        next.filter((m) => m.role !== "assistant" || m !== WELCOME),
      );
      const finalReply = reply || "Je n'ai pas pu générer de réponse. Réessayez.";
      setMessages([...next, { role: "assistant", content: finalReply }]);
    } catch (e) {
      const err = e as Error;
      setError(err.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <LinearGradient colors={["#A855F7", "#C026D3"]} style={styles.assistantAvatar}>
            <Feather name="message-circle" size={18} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
              Zawya · Assistant IA
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
              <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                {limit === Infinity
                  ? "Illimité · Studio"
                  : `${remaining}/${limit} messages restants`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === "user"
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }],
            ]}
          >
            <Text
              style={{
                color: m.role === "user" ? "#fff" : colors.foreground,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                lineHeight: 20,
              }}
              selectable
            >
              {m.content}
            </Text>
          </View>
        ))}

        {loading ? (
          <View style={[styles.bubble, styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                Zawya réfléchit…
              </Text>
            </View>
          </View>
        ) : null}

        {error ? (
          <Text style={{ color: colors.destructive, fontSize: 12, textAlign: "center" }}>
            {error}
          </Text>
        ) : null}

        {limitReached ? (
          <Pressable
            onPress={() => router.push("/premium")}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={["#A855F7", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeBanner}
            >
              <View style={styles.upgradeIcon}>
                <Feather name="lock" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }}>
                  Limite atteinte
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
                  Plan {PLAN_LABELS[user?.plan ?? "free"]} : {limit} messages.
                  Passez Pro ou Studio pour continuer.
                </Text>
              </View>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        ) : null}

        {messages.length <= 1 && !loading ? (
          <View style={{ marginTop: 8, gap: 8 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.4 }}>
              SUGGESTIONS
            </Text>
            {QUICK_PROMPTS.map((q) => (
              <Pressable
                key={q}
                onPress={() => send(q)}
                style={[
                  styles.quickPrompt,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="zap" size={14} color={colors.primary} />
                <Text
                  style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 }}
                >
                  {q}
                </Text>
                <Feather name="arrow-up-right" size={14} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom + 12,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            placeholder={limitReached ? "Limite atteinte — passez Premium" : "Décrivez votre problème…"}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            blurOnSubmit
            returnKeyType="send"
            editable={!limitReached}
          />
          <Pressable
            onPress={() => send()}
            disabled={loading || !input.trim() || limitReached}
            style={[
              styles.sendBtn,
              {
                opacity: loading || !input.trim() || limitReached ? 0.45 : 1,
              },
            ]}
          >
            <LinearGradient colors={["#A855F7", "#C026D3"]} style={StyleSheet.absoluteFill} />
            <Feather name={limitReached ? "lock" : "send"} size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  bubble: {
    maxWidth: "88%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },
  botBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  quickPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
