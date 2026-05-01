import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useHistory, type HistoryItem } from "@/contexts/HistoryContext";
import { CinematicImage } from "@/components/CinematicImage";
import { LUTS } from "@/constants/luts";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";
const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

type Filter = "all" | "best" | "instagram" | "tiktok" | "snapchat" | "youtube" | "facebook";
type Sort = "recent" | "score" | "platform";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "best", label: "⭐ Top" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
  { id: "youtube", label: "YouTube" },
];

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useHistory();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [compareMode, setCompareMode] = useState(false);
  const [compareItem, setCompareItem] = useState<HistoryItem | null>(null);
  const [compareLutIdx, setCompareLutIdx] = useState(0);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === "best") list = list.filter(i => i.score >= 80);
    else if (filter !== "all") list = list.filter(i => i.platforms.includes(filter));
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    else if (sort === "platform") list.sort((a, b) => a.platforms[0]?.localeCompare(b.platforms[0] ?? "") ?? 0);
    return list;
  }, [items, filter, sort]);

  const avgScore = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;
  const bestScore = items.length > 0 ? Math.max(...items.map(i => i.score)) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Galerie IA</Text>
          <Pressable
            onPress={() => { setCompareMode(m => !m); setCompareItem(null); }}
            style={[styles.compareBtn, { backgroundColor: compareMode ? PRIMARY + "22" : colors.card, borderColor: compareMode ? PRIMARY : colors.border }]}
          >
            <Feather name="columns" size={16} color={compareMode ? PRIMARY : colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { paddingHorizontal: 20, marginTop: 16 }]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: PRIMARY }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Photos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{avgScore}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Score moy.</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>{bestScore}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Meilleur</Text>
          </View>
        </View>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 16 }}>
          {FILTERS.map(f => (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, { backgroundColor: filter === f.id ? PRIMARY + "22" : colors.card, borderColor: filter === f.id ? PRIMARY : colors.border }]}
            >
              <Text style={[styles.filterText, { color: filter === f.id ? PRIMARY : colors.foreground }]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tri */}
        <View style={[styles.sortRow, { paddingHorizontal: 20, marginTop: 12 }]}>
          <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Trier par :</Text>
          {(["recent", "score", "platform"] as Sort[]).map(s => (
            <Pressable key={s} onPress={() => setSort(s)} style={[styles.sortChip, { backgroundColor: sort === s ? ACCENT + "22" : "transparent", borderColor: sort === s ? ACCENT : colors.border }]}>
              <Text style={[styles.sortText, { color: sort === s ? ACCENT : colors.mutedForeground }]}>
                {s === "recent" ? "Récent" : s === "score" ? "Score" : "Plateforme"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Mode comparaison LUT */}
        {compareMode && compareItem ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comparer les LUTs</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.compareLabel, { color: colors.mutedForeground }]}>Original</Text>
                <CinematicImage uri={compareItem.uri} lut={LUTS[0]} style={styles.compareImg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.compareLabel, { color: PRIMARY }]}>{LUTS[compareLutIdx]?.name}</Text>
                <CinematicImage uri={compareItem.uri} lut={LUTS[compareLutIdx] ?? LUTS[0]} style={styles.compareImg} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10 }}>
              {LUTS.map((l, i) => (
                <Pressable key={l.id} onPress={() => setCompareLutIdx(i)} style={[styles.lutChip, { borderColor: compareLutIdx === i ? PRIMARY : colors.border, backgroundColor: compareLutIdx === i ? PRIMARY + "18" : colors.card }]}>
                  <Text style={[styles.lutChipText, { color: compareLutIdx === i ? PRIMARY : colors.foreground }]}>{l.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => { setCompareItem(null); setCompareMode(false); }} style={[styles.closeCompare, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>Fermer la comparaison</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Grille photos */}
        {filtered.length === 0 ? (
          <View style={[styles.empty, { marginHorizontal: 20, marginTop: 24, backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="image" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune photo</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Prenez des photos avec ZawIA pour les voir ici.</Text>
          </View>
        ) : (
          <View style={[styles.grid, { paddingHorizontal: 16, marginTop: 16 }]}>
            {filtered.map(item => {
              const lut = LUTS.find(l => l.id === item.lut) ?? LUTS[0];
              const scoreColor = item.score >= 80 ? "#22C55E" : item.score >= 60 ? PRIMARY : "#EF4444";
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (compareMode) { setCompareItem(item); }
                    else { router.push("/shot-analyser"); }
                  }}
                  style={[styles.gridCard, { backgroundColor: colors.card, borderColor: compareItem?.id === item.id ? PRIMARY : colors.border }]}
                >
                  <CinematicImage
                    uri={item.uri}
                    lut={lut}
                    style={styles.gridImg}
                    fallback={<View style={[styles.gridImg, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}><Feather name="image" size={24} color={colors.mutedForeground} /></View>}
                  />
                  {/* Score badge */}
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor + "CC" }]}>
                    <Text style={styles.scoreBadgeText}>{item.score}</Text>
                  </View>
                  {/* Info */}
                  <View style={styles.gridInfo}>
                    <Text style={[styles.gridCaption, { color: colors.foreground }]} numberOfLines={1}>{item.caption}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <Text style={[styles.gridLut, { color: colors.mutedForeground }]}>{lut.name}</Text>
                      <Text style={[styles.gridPlatform, { color: PRIMARY }]}>{item.platforms[0]}</Text>
                    </View>
                  </View>
                  {compareMode ? (
                    <View style={[styles.compareOverlay, { backgroundColor: compareItem?.id === item.id ? PRIMARY + "33" : "transparent" }]}>
                      {compareItem?.id === item.id ? <Feather name="check-circle" size={24} color={PRIMARY} /> : null}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  compareBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sortLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  sortText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  compareLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginBottom: 6 },
  compareImg: { height: 140, borderRadius: 12 },
  lutChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5 },
  lutChipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  closeCompare: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: { width: CARD_W, borderRadius: 14, borderWidth: 1, overflow: "hidden", position: "relative" },
  gridImg: { height: 140 },
  scoreBadge: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  gridInfo: { padding: 10 },
  gridCaption: { fontFamily: "Inter_500Medium", fontSize: 12 },
  gridLut: { fontFamily: "Inter_400Regular", fontSize: 10 },
  gridPlatform: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "capitalize" },
  compareOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  empty: { padding: 32, borderRadius: 18, borderWidth: 1, alignItems: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginTop: 12 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", marginTop: 6 },
});
