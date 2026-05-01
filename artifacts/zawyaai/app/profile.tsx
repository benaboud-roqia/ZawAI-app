import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { PLANS } from "@/constants/plans";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "instagram" as const, color: "#E1306C" },
  { id: "tiktok", label: "TikTok", icon: "video" as const, color: "#25F4EE" },
  { id: "youtube", label: "YouTube", icon: "youtube" as const, color: "#FF0000" },
  { id: "snapchat", label: "Snapchat", icon: "camera" as const, color: "#FFFC00" },
  { id: "facebook", label: "Facebook", icon: "facebook" as const, color: "#1877F2" },
  { id: "x", label: "X (Twitter)", icon: "twitter" as const, color: "#1DA1F2" },
];

const NICHES = ["Lifestyle", "Cuisine", "Mode", "Voyage", "Fitness", "Beauté", "Tech", "Musique", "Business", "Art"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setPlatform } = useAuth();
  const { items } = useHistory();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("Lifestyle");
  const [saved, setSaved] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === (user?.plan ?? "free"))!;

  const totalViews = items.reduce((s, i) => s + i.views, 0);
  const avgScore = items.length > 0
    ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length)
    : 0;

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (Platform.OS !== "web") {
      Alert.alert("Profil mis à jour", "Vos modifications ont été sauvegardées.");
    }
  };

  const onSelectPlatform = (id: string) => {
    setPlatform(id);
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Mon profil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar + plan */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={["#4DC8E8", "#7C3AED"]} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name?.[0]?.toUpperCase() ?? "Z"}
            </Text>
          </LinearGradient>
          <View style={[styles.planBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="star" size={12} color={colors.primary} />
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>
              {currentPlan.name}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StatItem label="Publications" value={String(items.length)} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem label="Vues totales" value={formatNumber(totalViews)} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem label="Score moyen" value={avgScore > 0 ? String(avgScore) : "—"} colors={colors} />
        </View>

        {/* Form */}
        <View style={{ marginTop: 24, gap: 16 }}>
          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Nom</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <Text style={[styles.input, { color: colors.mutedForeground }]}>
                {user?.email ?? "—"}
              </Text>
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, height: 80, alignItems: "flex-start", paddingTop: 12 }]}>
              <Feather name="edit-3" size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Décrivez votre style créatif…"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Niche */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.label, { color: colors.foreground }]}>Ma niche</Text>
          <View style={styles.nichesWrap}>
            {NICHES.map((n) => {
              const active = selectedNiche === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setSelectedNiche(n)}
                  style={[
                    styles.nicheChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Plateforme principale */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.label, { color: colors.foreground }]}>Plateforme principale</Text>
          <View style={{ gap: 8 }}>
            {PLATFORMS.map((p) => {
              const active = user?.platform === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => onSelectPlatform(p.id)}
                  style={[
                    styles.platformRow,
                    {
                      backgroundColor: active ? `${p.color}18` : colors.card,
                      borderColor: active ? p.color : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.platformIcon, { backgroundColor: `${p.color}22` }]}>
                    <Feather name={p.icon} size={16} color={p.color} />
                  </View>
                  <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14 }}>
                    {p.label}
                  </Text>
                  {active ? (
                    <View style={[styles.checkCircle, { backgroundColor: p.color }]}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  ) : (
                    <View style={[styles.checkCircle, { backgroundColor: colors.secondary }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Save */}
        <View style={{ marginTop: 28 }}>
          <PrimaryButton
            label={saved ? "✓ Sauvegardé" : "Sauvegarder les modifications"}
            onPress={onSave}
          />
        </View>

        {/* Danger zone */}
        <View style={[styles.dangerCard, { backgroundColor: colors.card, borderColor: `${colors.destructive}40` }]}>
          <Text style={{ color: colors.destructive, fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 10 }}>
            Zone dangereuse
          </Text>
          <Pressable
            style={[styles.dangerBtn, { borderColor: `${colors.destructive}50` }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Alert.alert("Supprimer le compte", "Cette action est irréversible.", [
                  { text: "Annuler", style: "cancel" },
                  { text: "Supprimer", style: "destructive" },
                ]);
              }
            }}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              Supprimer mon compte
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20 }}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 34 },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  statDivider: { width: 1, height: 36 },
  label: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 8, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  nichesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nicheChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  platformIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerCard: {
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
});
