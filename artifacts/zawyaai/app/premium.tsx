import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlanCard } from "@/components/PlanCard";
import { PLANS } from "@/constants/plans";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setPlan } = useAuth();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  const onSelect = async (planId: "free" | "pro" | "studio") => {
    await setPlan(planId);
    router.back();
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
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Débloquez tout le potentiel
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Tarifs en Dinar Algérien · Sans engagement
        </Text>

        <View style={{ gap: 14, marginTop: 28 }}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={user?.plan === plan.id}
              onSelect={() => onSelect(plan.id)}
            />
          ))}
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Paiements sécurisés en DZD. Annulation à tout moment depuis vos paramètres.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 14, fontFamily: "Inter_400Regular" },
  disclaimer: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    paddingHorizontal: 20,
  },
});
