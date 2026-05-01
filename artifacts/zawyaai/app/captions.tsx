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
import { generateCaptions, type GeneratedCaption } from "@/lib/api";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

const LANGUAGES = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "ar", label: "العربية", flag: "🇩🇿" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

const TONES = [
  { id: "inspirant", label: "Inspirant ✨" },
  { id: "professionnel", label: "Pro 💼" },
  { id: "fun", label: "Fun 😄" },
  { id: "informatif", label: "Info 📚" },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#DD2A7B" },
  { id: "tiktok", label: "TikTok", color: "#FE2C55" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "x", label: "X", color: "#1DA1F2" },
];

export default function CaptionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("fr");
  const [tone, setTone] = useState("inspirant");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram"]);
  const [results, setResults] = useState<GeneratedCaption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onGenerate = async () => {
    if (selectedPlatforms.length === 0) { setError("Sélectionne au moins une plateforme."); return; }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await generateCaptions({
        platforms: selectedPlatforms,
        topic: topic || "Contenu créatif ZawIA",
        language: lang,
        tone,
      });
      setResults(res);
    } catch (e) {
      setError("Génération échouée. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (text: string, id: string) => {
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Captions IA</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Sujet */}
        <Text style={[styles.label, { color: colors.foreground }]}>Sujet du contenu</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="edit-3" size={16} color={colors.mutedForeground} />
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="Ex: recette tiramisu, look automne..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
          />
        </View>

        {/* Langue */}
        <Text style={[styles.label, { color: colors.foreground }]}>Langue</Text>
        <View style={styles.chipRow}>
          {LANGUAGES.map(l => (
            <Pressable
              key={l.id}
              onPress={() => setLang(l.id)}
              style={[styles.chip, { backgroundColor: lang === l.id ? PRIMARY + "22" : colors.card, borderColor: lang === l.id ? PRIMARY : colors.border }]}
            >
              <Text style={{ fontSize: 16 }}>{l.flag}</Text>
              <Text style={[styles.chipText, { color: lang === l.id ? PRIMARY : colors.foreground }]}>{l.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Ton */}
        <Text style={[styles.label, { color: colors.foreground }]}>Ton</Text>
        <View style={styles.chipRow}>
          {TONES.map(t => (
            <Pressable
              key={t.id}
              onPress={() => setTone(t.id)}
              style={[styles.chip, { backgroundColor: tone === t.id ? PRIMARY + "22" : colors.card, borderColor: tone === t.id ? PRIMARY : colors.border }]}
            >
              <Text style={[styles.chipText, { color: tone === t.id ? PRIMARY : colors.foreground }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Plateformes */}
        <Text style={[styles.label, { color: colors.foreground }]}>Plateformes</Text>
        <View style={styles.chipRow}>
          {PLATFORMS.map(p => (
            <Pressable
              key={p.id}
              onPress={() => togglePlatform(p.id)}
              style={[styles.chip, { backgroundColor: selectedPlatforms.includes(p.id) ? p.color + "22" : colors.card, borderColor: selectedPlatforms.includes(p.id) ? p.color : colors.border }]}
            >
              <Text style={[styles.chipText, { color: selectedPlatforms.includes(p.id) ? p.color : colors.foreground }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Bouton générer */}
        <Pressable onPress={onGenerate} disabled={loading} style={{ marginTop: 20, opacity: loading ? 0.7 : 1 }}>
          <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.genBtn}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="zap" size={16} color="#fff" />}
            <Text style={styles.genBtnText}>{loading ? "Génération en cours…" : "Générer les captions"}</Text>
          </LinearGradient>
        </Pressable>

        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

        {/* Résultats */}
        {results.length > 0 ? (
          <View style={{ marginTop: 24, gap: 14 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Captions générées</Text>
            {results.map((r, i) => (
              <View key={i} style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultPlatform, { color: PLATFORMS.find(p => p.id === r.platform)?.color ?? PRIMARY }]}>
                    {r.platform.charAt(0).toUpperCase() + r.platform.slice(1)}
                  </Text>
                  <Pressable onPress={() => copyCaption(r.caption, r.platform)} style={[styles.copyBtn, { backgroundColor: copied === r.platform ? "#22C55E22" : colors.secondary }]}>
                    <Feather name={copied === r.platform ? "check" : "copy"} size={14} color={copied === r.platform ? "#22C55E" : colors.mutedForeground} />
                    <Text style={{ color: copied === r.platform ? "#22C55E" : colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
                      {copied === r.platform ? "Copié !" : "Copier"}
                    </Text>
                  </Pressable>
                </View>
                <Text style={[styles.resultCaption, { color: colors.foreground }]}>{r.caption}</Text>
                {r.hashtags?.length > 0 ? (
                  <View style={styles.hashtagsRow}>
                    {r.hashtags.slice(0, 5).map((h, j) => (
                      <View key={j} style={[styles.hashtag, { backgroundColor: PRIMARY + "15" }]}>
                        <Text style={{ color: PRIMARY, fontFamily: "Inter_500Medium", fontSize: 11 }}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 16 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 52, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  genBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 56, borderRadius: 16 },
  genBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  error: { marginTop: 12, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  resultCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  resultPlatform: { fontFamily: "Inter_700Bold", fontSize: 14 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  resultCaption: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  hashtagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  hashtag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
