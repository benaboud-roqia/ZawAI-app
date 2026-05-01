import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSchedule } from "@/contexts/ScheduleContext";
import { useColors } from "@/hooks/useColors";
import { getOptimalTimes, type OptimalPlatform } from "@/lib/api";

const fmtDateTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtCountdown = (ts: number) => {
  const diff = ts - Date.now();
  if (diff < 0) return "publication imminente";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `dans ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `dans ${h} h`;
  const d = Math.floor(h / 24);
  return `dans ${d} j`;
};

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { posts, remove } = useSchedule();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [optimal, setOptimal] = useState<OptimalPlatform[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const loadOptimal = useCallback(async () => {
    setLoadingTimes(true);
    try {
      const result = await getOptimalTimes({
        platforms: ["instagram", "tiktok", "youtube"],
        timezone: "Africa/Algiers",
      });
      setOptimal(result);
    } catch {} finally {
      setLoadingTimes(false);
    }
  }, []);

  useEffect(() => {
    loadOptimal();
  }, [loadOptimal]);

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
            <Text style={[styles.title, { color: colors.foreground }]}>Calendrier</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {posts.length} publication{posts.length > 1 ? "s" : ""} programmée{posts.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Optimal times */}
        <LinearGradient
          colors={["#4DC8E8", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optimalCard}
        >
          <View style={styles.optimalHeader}>
            <View style={styles.optimalIcon}>
              <Feather name="clock" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 }}>
                Heures optimales aujourd'hui
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 }}>
                Suggestions IA · Algérie
              </Text>
            </View>
            <Pressable onPress={loadOptimal} style={styles.refreshBtn}>
              {loadingTimes ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="refresh-cw" size={14} color="#fff" />}
            </Pressable>
          </View>

          {loadingTimes && optimal.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}

          <View style={{ marginTop: 14, gap: 10 }}>
            {optimal.map((p) => (
              <View key={p.id} style={styles.optimalRow}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13, width: 80 }}>
                  {p.name}
                </Text>
                <View style={{ flex: 1, flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  {p.slots.slice(0, 3).map((s, i) => (
                    <View key={i} style={styles.timeChip}>
                      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>
                        {s.time}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 9, fontFamily: "Inter_500Medium" }}>
                        {s.score}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Scheduled posts */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          À venir
        </Text>

        {posts.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="calendar" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Aucune publication programmée
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Depuis l'écran Publier, activez "Programmer" pour planifier vos contenus aux meilleures heures.
            </Text>
          </View>
        ) : null}

        {posts.map((p) => (
          <View
            key={p.id}
            style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statusPill, { backgroundColor: "rgba(245,158,11,0.18)" }]}>
              <Feather name="clock" size={11} color="#F59E0B" />
              <Text style={{ color: "#F59E0B", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                {fmtCountdown(p.scheduledFor)}
              </Text>
            </View>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 10, lineHeight: 19 }} numberOfLines={2}>
              {p.caption}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 8 }}>
              {fmtDateTime(p.scheduledFor)} · {p.platforms.join(", ")}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
              <Pressable onPress={() => remove(p.id)} style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                <Feather name="trash-2" size={13} color={colors.destructive} />
                <Text style={{ color: colors.destructive, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
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
  optimalCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 18,
  },
  optimalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optimalIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  optimalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 12,
  },
  timeChip: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  postCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  empty: {
    alignItems: "center",
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyDesc: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
});
