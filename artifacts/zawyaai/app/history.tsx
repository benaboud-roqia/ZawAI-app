import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CinematicImage } from "@/components/CinematicImage";
import { LUTS } from "@/constants/luts";
import { useHistory, type HistoryItem } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";

const PLATFORM_ICONS: Record<string, { icon: any; lib: "fa" | "fa5" }> = {
  instagram: { icon: "instagram", lib: "fa" },
  tiktok: { icon: "tiktok", lib: "fa5" },
  snapchat: { icon: "snapchat-ghost", lib: "fa" },
  youtube: { icon: "youtube-play", lib: "fa" },
  facebook: { icon: "facebook", lib: "fa" },
  x: { icon: "twitter", lib: "fa" },
};

const formatNumber = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, remove, clear } = useHistory();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const totals = items.reduce(
    (acc, i) => ({
      views: acc.views + i.views,
      likes: acc.likes + i.likes,
      score: acc.score + i.score,
    }),
    { views: 0, likes: 0, score: 0 },
  );
  const avgScore = items.length > 0 ? Math.round(totals.score / items.length) : 0;

  const onDelete = (item: HistoryItem) => {
    if (Platform.OS === "web") {
      remove(item.id);
      return;
    }
    Alert.alert("Supprimer", "Retirer cet élément de l'historique ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => remove(item.id) },
    ]);
  };

  const onClearAll = () => {
    if (items.length === 0) return;
    if (Platform.OS === "web") {
      clear();
      return;
    }
    Alert.alert("Tout effacer", "Vider tout l'historique ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Effacer", style: "destructive", onPress: () => clear() },
    ]);
  };

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
            <Text style={[styles.title, { color: colors.foreground }]}>
              Mes publications
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {items.length} contenu{items.length > 1 ? "s" : ""} créé{items.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {items.length > 0 ? (
          <LinearGradient
            colors={["#A855F7", "#C026D3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <Stat label="Vues totales" value={formatNumber(totals.views)} />
            <View style={styles.statDivider} />
            <Stat label="J'aime" value={formatNumber(totals.likes)} />
            <View style={styles.statDivider} />
            <Stat label="Score moyen" value={`${avgScore}`} />
          </LinearGradient>
        ) : null}

        {items.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="image" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Aucune publication
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Capturez une photo et publiez-la pour la voir apparaître ici avec son score viral.
            </Text>
          </View>
        ) : null}

        {items.map((item) => {
          const lut = LUTS.find((l) => l.id === item.lut) ?? LUTS[0];
          return (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <CinematicImage
                uri={item.uri}
                lut={lut}
                style={styles.itemImage}
                fallback={
                  <LinearGradient colors={["#1a0e2e", "#2A1B4A"]} style={StyleSheet.absoluteFill} />
                }
              />

              <View style={{ padding: 14, gap: 10 }}>
                <View style={styles.itemHeader}>
                  <View style={[styles.statusPill, { backgroundColor: "rgba(34,197,94,0.18)" }]}>
                    <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
                    <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <Text
                  numberOfLines={2}
                  style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 19 }}
                >
                  {item.caption}
                </Text>

                <View style={styles.platformsRow}>
                  {item.platforms.map((pid) => {
                    const p = PLATFORM_ICONS[pid];
                    if (!p) return null;
                    return (
                      <View
                        key={pid}
                        style={[styles.platformDot, { backgroundColor: colors.secondary }]}
                      >
                        {p.lib === "fa5" ? (
                          <FontAwesome5 name={p.icon} size={12} color={colors.foreground} />
                        ) : (
                          <FontAwesome name={p.icon} size={12} color={colors.foreground} />
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.metricsRow, { borderTopColor: colors.border }]}>
                  <Metric icon="eye" value={formatNumber(item.views)} label="vues" colors={colors} />
                  <Metric icon="heart" value={formatNumber(item.likes)} label="likes" colors={colors} />
                  <Metric icon="share-2" value={formatNumber(item.shares)} label="partages" colors={colors} />
                  <View style={styles.scoreCol}>
                    <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 18 }}>
                      {item.score}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium" }}>
                      score
                    </Text>
                  </View>
                </View>

                <Pressable onPress={() => onDelete(item)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={13} color={colors.destructive} />
                  <Text style={{ color: colors.destructive, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                    Supprimer
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {items.length > 0 ? (
          <Pressable onPress={onClearAll} style={[styles.clearBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              Effacer tout l'historique
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function Metric({
  icon,
  value,
  label,
  colors,
}: {
  icon: any;
  value: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Feather name={icon} size={12} color={colors.mutedForeground} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
          {value}
        </Text>
      </View>
      <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 2 }}>
        {label}
      </Text>
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
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  itemImage: {
    height: 200,
    backgroundColor: "#000",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 999 },
  platformsRow: { flexDirection: "row", gap: 6 },
  platformDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  scoreCol: {
    width: 56,
    alignItems: "center",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
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
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyDesc: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
  clearBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
});
