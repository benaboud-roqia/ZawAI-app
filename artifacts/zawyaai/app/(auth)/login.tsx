import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

// Icônes sociales avec les vraies libs
type SocialItem = {
  id: string;
  label: string;
  gradient: [string, string];
  iconLib: "fa" | "fa5";
  iconName: string;
};

const SOCIAL: SocialItem[] = [
  { id: "facebook", label: "Facebook", gradient: ["#1877F2", "#0A5BC4"], iconLib: "fa", iconName: "facebook" },
  { id: "instagram", label: "Instagram", gradient: ["#F58529", "#DD2A7B"], iconLib: "fa", iconName: "instagram" },
  { id: "tiktok", label: "TikTok", gradient: ["#25F4EE", "#FE2C55"], iconLib: "fa5", iconName: "tiktok" },
];

function SocialIcon({ lib, name, size, color }: { lib: "fa" | "fa5"; name: string; size: number; color: string }) {
  if (lib === "fa5") return <FontAwesome5 name={name} size={size} color={color} />;
  return <FontAwesome name={name as any} size={size} color={color} />;
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) { setError("Renseignez votre email et mot de passe."); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Si plateforme déjà choisie → app directement
      const existingPlatform = await AsyncStorage.getItem("zawia.platform");
      if (existingPlatform) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/platform-setup");
      }
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally { setLoading(false); }
  };

  const onSocialLogin = async (s: SocialItem) => {
    setSocialLoading(s.id);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const fakeEmail = `${s.id}_${Date.now()}@zawia.app`;
      await signUp(`Utilisateur ${s.label}`, fakeEmail, `social_${s.id}`);
      router.replace("/(auth)/platform-setup");
    } catch {
      Alert.alert("Erreur", `Connexion ${s.label} indisponible.`);
    } finally { setSocialLoading(null); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 32, paddingBottom: insets.bottom + 60 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            <Text style={{ color: "#fff" }}>Zaw</Text>
            <Text style={{ color: "#4DC8E8" }}>IA</Text>
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Bon retour{"\n"}dans ton studio.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Votre directeur photo IA vous attend.</Text>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={[styles.sepLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.sepText, { color: colors.mutedForeground }]}>ou avec email</Text>
          <View style={[styles.sepLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Formulaire */}
        <View style={{ gap: 12 }}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>E-MAIL</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: email.trim() ? "#4DC8E8" : colors.border }]}>
              <Feather name="mail" size={18} color="#4DC8E8" />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="ton@email.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {email.trim() ? <Feather name="check-circle" size={16} color="#22C55E" /> : null}
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>MOT DE PASSE</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: password ? "#4DC8E8" : colors.border }]}>
              <Feather name="lock" size={18} color="#4DC8E8" />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {password ? <Feather name="check-circle" size={16} color="#22C55E" /> : null}
            </View>
          </View>

          {error ? <Text style={{ color: "#EF4444", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text> : null}

          <Pressable onPress={onSubmit} disabled={loading} style={({ pressed }) => ({ opacity: pressed || loading ? 0.85 : 1, marginTop: 4 })}>
            <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
              <Text style={styles.submitText}>{loading ? "Connexion…" : "Se connecter"}</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          {/* Connexion sociale — icônes sous le bouton */}
          <View style={styles.separator}>
            <View style={[styles.sepLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.sepText, { color: colors.mutedForeground }]}>ou continuer avec</Text>
            <View style={[styles.sepLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
            {SOCIAL.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => onSocialLogin(s)}
                disabled={!!socialLoading}
                style={({ pressed }) => ({ opacity: pressed || socialLoading === s.id ? 0.7 : 1 })}
              >
                <LinearGradient
                  colors={s.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.socialIconBtn}
                >
                  {socialLoading === s.id
                    ? <Feather name="loader" size={22} color="#fff" />
                    : <SocialIcon lib={s.iconLib} name={s.iconName} size={22} color="#fff" />
                  }
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.privacyRow}>
          <Feather name="lock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>Ton profil reste sur ton téléphone.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>Nouveau sur ZawIA ? </Text>
          <Link href="/(auth)/register" style={{ color: "#4DC8E8", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Créer un compte</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28 },
  badgeDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#4DC8E8" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  title: { fontSize: 34, fontFamily: "Inter_700Bold", letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { marginTop: 12, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  socialIconBtn: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  socialText: { flex: 1, color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  separator: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  sepLine: { flex: 1, height: 1 },
  sepText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  label: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 56, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 58, borderRadius: 16 },
  submitText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
  privacyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
  privacyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28, flexWrap: "wrap" },
});
