import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { LUTS } from "@/constants/luts";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory, type HistoryItem } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";
import { generateTips, type AiTip } from "@/lib/api";

type Notif = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  ts: number;
  unread: boolean;
};

const fmtRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

function buildNotifications(items: HistoryItem[], userName: string): Notif[] {
  const list: Notif[] = [];

  // Welcome
  list.push({
    id: "welcome",
    icon: "star",
    iconBg: "rgba(168,85,247,0.18)",
    iconColor: "#4DC8E8",
    title: `Bienvenue ${userName} sur ZawyaAI`,
    body: "Découvrez les 8 étalonnages cinéma et la publication multi-plateformes.",
    ts: Date.now() - 1000 * 60 * 60 * 24 * 2,
    unread: false,
  });

  for (const item of items) {
    const lutName = LUTS.find((l) => l.id === item.lut)?.name ?? "Original";
    const platforms = item.platforms.join(", ");

    list.push({
      id: `pub_${item.id}`,
      icon: "send",
      iconBg: "rgba(34,197,94,0.18)",
      iconColor: "#22C55E",
      title: "Publication réussie",
      body: `Diffusion sur ${platforms} avec étalonnage ${lutName}.`,
      ts: item.createdAt + 5000,
      unread: Date.now() - item.createdAt < 1000 * 60 * 60 * 24,
    });

    if (item.views >= 10000) {
      list.push({
        id: `views_${item.id}`,
        icon: "eye",
        iconBg: "rgba(59,130,246,0.18)",
        iconColor: "#3B82F6",
        title: `${(item.views / 1000).toFixed(1)}k vues atteintes`,
        body: `Votre publication "${item.caption.slice(0, 40)}…" cartonne.`,
        ts: item.createdAt + 1000 * 60 * 30,
        unread: Date.now() - item.createdAt < 1000 * 60 * 60 * 12,
      });
    }

    if (item.score >= 90) {
      list.push({
        id: `score_${item.id}`,
        icon: "award",
        iconBg: "rgba(192,38,211,0.2)",
        iconColor: "#7C3AED",
        title: `Score viral ${item.score} 🔥`,
        body: "Excellent travail, ce contenu est dans le top 5% des publications ZawyaAI.",
        ts: item.createdAt + 1000 * 60 * 60,
        unread: Date.now() - item.createdAt < 1000 * 60 * 60 * 24,
      });
    } else if (item.score >= 80) {
      list.push({
        id: `score_${item.id}`,
        icon: "trending-up",
        iconBg: "rgba(245,158,11,0.18)",
        iconColor: "#F59E0B",
        title: `Score viral ${item.score}`,
        body: "Très bonne performance. Reproduisez ce style pour vos prochains contenus.",
        ts: item.createdAt + 1000 * 60 * 60,
        unread: false,
      });
    }
  }

  return list.sort((a, b) => b.ts - a.ts);
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useHistory();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const [tips, setTips] = useState<AiTip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);

  const userName = user?.name?.split(" ")[0] ?? "créateur";

  const notifications = useMemo(
    () => buildNotifications(items, userName),
    [items, userName],
  );

  const loadTips = useCallback(async () => {
    setTipsLoading(true);
    setTipsError(null);
    try {
      const recentLuts = items.slice(0, 5).map((i) => {
        return LUTS.find((l) => l.id === i.lut)?.name ?? i.lut;
      });
      const recentPlatforms = Array.from(
        new Set(items.slice(0, 5).flatMap((i) => i.platforms)),
      );
      const avgScore =
        items.length > 0
          ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length)
          : undefined;
      const result = await generateTips({
        recentLuts,
        recentPlatforms,
        avgScore,
        publishedCount: items.length,
      });
      setTips(result);
    } catch (e) {
      setTipsError((e as Error).message);
    } finally {
      setTipsLoading(false);
    }
  }, [items]);

  useEffect(() => {
    loadTips();
  }, [loadTips]);

  const todayItems: Notif[] = [];
  const earlierItems: Notif[] = [];
  const dayMs = 1000 * 60 * 60 * 24;
  for (const n of notifications) {
    if (Date.now() - n.ts < dayMs) todayItems.push(n);
    else earlierItems.push(n);
  }

  const unreadCount = notifications.filter(
    (n) => n.unread && !readIds.includes(n.id),
  ).length;

  const markAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
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
              Notifications
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Tout est à jour"}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <Pressable onPress={markAllRead} style={styles.markRead}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                Tout lire
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* AI Tips card */}
        <LinearGradient
          colors={["#4DC8E8", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tipsCard}
        >
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIcon}>
              <Feather name="zap" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 }}>
                Conseils IA personnalisés
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 }}>
                Propulsé par Claude · adapté à votre activité
              </Text>
            </View>
            <Pressable
              onPress={loadTips}
              disabled={tipsLoading}
              style={styles.refreshBtn}
            >
              {tipsLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="refresh-cw" size={14} color="#fff" />
              )}
            </Pressable>
          </View>

          {tipsError ? (
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 12 }}>
              {tipsError}
            </Text>
          ) : null}

          {tipsLoading && tips.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 8 }}>
                Génération des conseils…
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: 14, gap: 10 }}>
            {tips.map((t, idx) => (
              <View key={idx} style={styles.tipItem}>
                <View style={styles.tipIconBox}>
                  <Feather name={(t.icon as any) ?? "zap"} size={14} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13, flex: 1 }}>
                      {t.title}
                    </Text>
                    <View style={styles.tipCategory}>
                      <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 }}>
                        {t.category?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, marginTop: 4 }}>
                    {t.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {todayItems.length > 0 ? (
          <>
            <SectionLabel label="Aujourd'hui" colors={colors} />
            {todayItems.map((n) => (
              <NotifRow
                key={n.id}
                n={n}
                colors={colors}
                read={readIds.includes(n.id)}
              />
            ))}
          </>
        ) : null}

        {earlierItems.length > 0 ? (
          <>
            <SectionLabel label="Plus ancien" colors={colors} />
            {earlierItems.map((n) => (
              <NotifRow
                key={n.id}
                n={n}
                colors={colors}
                read={readIds.includes(n.id)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label, colors }: any) {
  return (
    <Text
      style={{
        color: colors.mutedForeground,
        fontFamily: "Inter_700Bold",
        fontSize: 11,
        letterSpacing: 0.6,
        marginTop: 22,
        marginBottom: 10,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
  );
}

function NotifRow({ n, colors, read }: { n: Notif; colors: any; read: boolean }) {
  const unread = n.unread && !read;
  return (
    <View
      style={[
        styles.notifRow,
        {
          backgroundColor: colors.card,
          borderColor: unread ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={[styles.notifIcon, { backgroundColor: n.iconBg }]}>
        <Feather name={n.icon as any} size={16} color={n.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              flex: 1,
            }}
          >
            {n.title}
          </Text>
          {unread ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
        </View>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {n.body}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            marginTop: 6,
          }}
        >
          {fmtRelative(n.ts)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 13, fontFamily: "Inter_400Regular" },
  markRead: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 18,
    marginTop: 4,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipsIcon: {
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
  tipItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
  },
  tipIconBox: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipCategory: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  notifRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
