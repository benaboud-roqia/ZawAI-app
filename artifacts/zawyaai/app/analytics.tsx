import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LUTS } from "@/constants/luts";
import { useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";

const formatNumber = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useHistory();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const stats = useMemo(() => {
    if (items.length === 0) {
      return { totalViews: 0, totalLikes: 0, totalShares: 0, avgScore: 0, engagement: 0 };
    }
    const totalViews = items.reduce((s, i) => s + i.views, 0);
    const totalLikes = items.reduce((s, i) => s + i.likes, 0);
    const totalShares = items.reduce((s, i) => s + i.shares, 0);
    const avgScore = Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);
    const engagement = totalViews > 0 ? +((totalLikes / totalViews) * 100).toFixed(1) : 0;
    return { totalViews, totalLikes, totalShares, avgScore, engagement };
  }, [items]);

  // Score evolution: last 7 publications
  const scoreSeries = useMemo(() => {
    const list = [...items].reverse().slice(-7);
    return list.length > 0 ? list.map((i) => i.score) : [60, 65, 70, 75, 78, 82, 85];
  }, [items]);

  // Platform breakdown
  const platformBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) {
      for (const p of i.platforms) {
        map.set(p, (map.get(p) ?? 0) + i.views);
      }
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries())
      .map(([id, views]) => ({ id, views, pct: Math.round((views / total) * 100) }))
      .sort((a, b) => b.views - a.views);
  }, [items]);

  // LUT performance
  const lutPerf = useMemo(() => {
    const map = new Map<string, { count: number; score: number }>();
    for (const i of items) {
      const cur = map.get(i.lut) ?? { count: 0, score: 0 };
      map.set(i.lut, { count: cur.count + 1, score: cur.score + i.score });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({
        id,
        name: LUTS.find((l) => l.id === id)?.name ?? id,
        count: v.count,
        avgScore: Math.round(v.score / v.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }, [items]);

  const topPosts = useMemo(
    () => [...items].sort((a, b) => b.score - a.score).slice(0, 3),
    [items],
  );

  const maxScore = Math.max(...scoreSeries, 100);
  const maxLut = Math.max(...lutPerf.map((l) => l.avgScore), 100);

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
            <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {items.length} publication{items.length > 1 ? "s" : ""} analysée{items.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Hero stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <BigStat
            label="Vues totales"
            value={formatNumber(stats.totalViews)}
            icon="eye"
            colors={colors}
            gradient={["#7C2BD9", "#A855F7"]}
          />
          <BigStat
            label="Engagement"
            value={`${stats.engagement}%`}
            icon="heart"
            colors={colors}
            gradient={["#C026D3", "#EC4899"]}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          <BigStat
            label="J'aime"
            value={formatNumber(stats.totalLikes)}
            icon="thumbs-up"
            colors={colors}
            gradient={["#3B82F6", "#06B6D4"]}
          />
          <BigStat
            label="Score moyen"
            value={String(stats.avgScore)}
            icon="award"
            colors={colors}
            gradient={["#F59E0B", "#EF4444"]}
          />
        </View>

        {/* Score evolution chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>
              Évolution du score viral
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }}>
              7 dernières publications
            </Text>
          </View>
          <View style={styles.barChart}>
            {scoreSeries.map((s, i) => {
              const heightPct = (s / maxScore) * 100;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <LinearGradient
                      colors={["#A855F7", "#C026D3"]}
                      style={[styles.bar, { height: `${heightPct}%` }]}
                    />
                  </View>
                  <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 6, fontFamily: "Inter_600SemiBold" }}>
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Platform breakdown */}
        {platformBreakdown.length > 0 ? (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.foreground, marginBottom: 14 }]}>
              Répartition des vues par plateforme
            </Text>
            {platformBreakdown.map((p) => (
              <View key={p.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13, textTransform: "capitalize" }}>
                    {p.id}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                    {formatNumber(p.views)} · {p.pct}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                  <LinearGradient
                    colors={["#A855F7", "#C026D3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${p.pct}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* LUT performance */}
        {lutPerf.length > 0 ? (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.foreground, marginBottom: 14 }]}>
              Top étalonnages
            </Text>
            {lutPerf.map((l) => (
              <View key={l.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
                    {l.name}
                  </Text>
                  <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>
                    {l.avgScore} · {l.count}×
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(l.avgScore / maxLut) * 100}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Top posts */}
        {topPosts.length > 0 ? (
          <View style={{ marginTop: 6 }}>
            <Text style={[styles.chartTitle, { color: colors.foreground, marginBottom: 12 }]}>
              Top contenus
            </Text>
            {topPosts.map((p, idx) => (
              <View
                key={p.id}
                style={[styles.topPost, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <LinearGradient
                  colors={idx === 0 ? ["#F59E0B", "#EF4444"] : idx === 1 ? ["#A855F7", "#C026D3"] : ["#3B82F6", "#06B6D4"]}
                  style={styles.rankBadge}
                >
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>
                    {idx + 1}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13 }} numberOfLines={1}>
                    {p.caption}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 4 }}>
                    {formatNumber(p.views)} vues · score {p.score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="bar-chart-2" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Pas encore de données
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Publiez du contenu pour voir vos statistiques apparaître ici.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function BigStat({ label, value, icon, gradient }: any) {
  return (
    <View style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 14 }}>
        <View style={styles.bigStatIcon}>
          <Feather name={icon} size={14} color="#fff" />
        </View>
        <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 10 }}>
          {value}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
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
  bigStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barWrap: {
    width: "100%",
    height: 110,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  topPost: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
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
