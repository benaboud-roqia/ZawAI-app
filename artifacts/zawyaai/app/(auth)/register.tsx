import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const onSubmit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || password.length < 6) { setError("Nom, email et mot de passe (6+ caractères) requis."); return; }
    setLoading(true);
    try { await signUp(name.trim(), email.trim(), password); router.replace("/(auth)/platform-setup"); }
    catch { setError("Une erreur est survenue. Réessayez."); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { paddingTop: topPad + 32, paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}><Text style={{ color: "#fff" }}>Zaw</Text><Text style={{ color: "#4DC8E8" }}>IA</Text></Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Bienvenue dans{"\n"}ton studio de poche.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Crée ton profil pour activer l'IA Director.</Text>

        <View style={{ gap: 12, marginTop: 36 }}>
          {[
            { label: "NOM", icon: "user" as const, value: name, onChange: setName, placeholder: "Ex: Yacine B.", secure: false, keyboard: "default" as const },
            { label: "E-MAIL", icon: "mail" as const, value: email, onChange: setEmail, placeholder: "ton@email.com", secure: false, keyboard: "email-address" as const },
            { label: "MOT DE PASSE", icon: "lock" as const, value: password, onChange: setPassword, placeholder: "6 caractères minimum", secure: true, keyboard: "default" as const },
          ].map((f) => (
            <View key={f.label}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{f.label}</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={f.icon} size={18} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground} autoCapitalize="none" keyboardType={f.keyboard} secureTextEntry={f.secure} value={f.value} onChangeText={f.onChange} />
              </View>
            </View>
          ))}

          {error ? <Text style={{ color: "#EF4444", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text> : null}

          <Pressable onPress={onSubmit} disabled={loading} style={({ pressed }) => ({ opacity: pressed || loading ? 0.85 : 1, marginTop: 8 })}>
            <LinearGradient colors={["#4DC8E8", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
              <Text style={styles.submitText}>{loading ? "Chargement…" : "Commencer"}</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>Déjà un compte ? </Text>
          <Link href="/(auth)/login" style={{ color: "#4DC8E8", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Se connecter</Link>
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
  label: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 56, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 58, borderRadius: 16 },
  submitText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28, flexWrap: "wrap" },
});
