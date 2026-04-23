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
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PLANS } from "@/constants/plans";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [haptics, setHaptics] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [voice, setVoice] = useState(false);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const currentPlan = PLANS.find((p) => p.id === (user?.plan ?? "free"))!;

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      signOut();
      return;
    }
    Alert.alert("Déconnexion", "Confirmer la déconnexion ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnecter", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Paramètres
          </Text>
        </View>

        {/* Profile */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LinearGradient
              colors={["#A855F7", "#C026D3"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? "Z"}
              </Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {user?.name ?? "Créateur"}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                {user?.email ?? ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium card */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Pressable onPress={() => router.push("/premium")}>
            <LinearGradient
              colors={["#A855F7", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumLabel}>PLAN ACTUEL</Text>
                <Text style={styles.premiumPlan}>{currentPlan.name}</Text>
                <Text style={styles.premiumPrice}>{currentPlan.priceLabel}</Text>
              </View>
              <View style={styles.premiumCta}>
                <Text style={{ color: "#7C2BD9", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                  {currentPlan.id === "studio" ? "Gérer" : "Améliorer"}
                </Text>
                <Feather name="arrow-right" size={14} color="#7C2BD9" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Preferences */}
        <Section title="Préférences" colors={colors}>
          <ToggleRow
            icon="zap"
            label="Retours haptiques"
            value={haptics}
            onChange={setHaptics}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon="save"
            label="Sauvegarde automatique"
            value={autoSave}
            onChange={setAutoSave}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon="mic"
            label="Assistant vocal"
            value={voice}
            onChange={setVoice}
            colors={colors}
          />
        </Section>

        <Section title="Compte" colors={colors}>
          <NavRow icon="user" label="Profil" colors={colors} />
          <Divider colors={colors} />
          <NavRow icon="shield" label="Confidentialité" colors={colors} />
          <Divider colors={colors} />
          <NavRow icon="bell" label="Notifications" colors={colors} />
        </Section>

        <Section title="Support" colors={colors}>
          <NavRow icon="help-circle" label="Centre d'aide" colors={colors} />
          <Divider colors={colors} />
          <NavRow icon="message-square" label="Contacter ZawyaAI" colors={colors} />
          <Divider colors={colors} />
          <NavRow icon="file-text" label="Conditions" colors={colors} />
        </Section>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOut,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={16} color={colors.destructive} />
            <Text style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              Déconnexion
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          ZawyaAI · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Divider({ colors }: any) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 50 }} />;
}

function ToggleRow({ icon, label, value, onChange, colors }: any) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.secondary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function NavRow({ icon, label, colors }: any) {
  return (
    <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <View style={[styles.rowIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
        {label}
      </Text>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 },
  profileName: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  profileEmail: { marginTop: 2, fontSize: 13, fontFamily: "Inter_400Regular" },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  premiumLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  premiumPlan: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  premiumPrice: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  premiumCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  sectionCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  version: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
