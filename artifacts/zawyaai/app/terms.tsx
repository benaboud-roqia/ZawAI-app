import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TERMS = [
  { title: "1. Acceptation des conditions", content: "En utilisant ZawIA, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application." },
  { title: "2. Description du service", content: "ZawIA est une application mobile de création de contenu assistée par intelligence artificielle. Elle permet de capturer, analyser et publier du contenu sur les réseaux sociaux." },
  { title: "3. Compte utilisateur", content: "Vous êtes responsable de la sécurité de votre compte. Ne partagez pas vos identifiants. ZawIA ne sera pas responsable des pertes dues à un accès non autorisé." },
  { title: "4. Contenu publié", content: "Vous êtes seul responsable du contenu que vous publiez via ZawIA. Tout contenu illégal, offensant ou violant les droits d'auteur est strictement interdit." },
  { title: "5. Intelligence artificielle", content: "Les analyses et recommandations de l'IA sont fournies à titre indicatif. ZawIA ne garantit pas l'exactitude des résultats générés par l'IA." },
  { title: "6. Propriété intellectuelle", content: "ZawIA et son contenu sont protégés par les lois algériennes et internationales sur la propriété intellectuelle. Toute reproduction non autorisée est interdite." },
  { title: "7. Limitation de responsabilité", content: "ZawIA ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de l'application." },
  { title: "8. Modifications", content: "ZawIA se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants." },
  { title: "9. Droit applicable", content: "Ces conditions sont régies par le droit algérien. Tout litige sera soumis aux tribunaux compétents d'Oum El Bouaghi, Algérie." },
];

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Conditions d'utilisation</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.date, { color: colors.mutedForeground }]}>Dernière mise à jour : Janvier 2025</Text>

        <View style={{ gap: 16, marginTop: 16 }}>
          {TERMS.map((t) => (
            <View key={t.title} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.title}</Text>
              <Text style={[styles.sectionContent, { color: colors.mutedForeground }]}>{t.content}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          ZawIA · Startup Algérien · Université d'Oum El Bouaghi
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  section: { padding: 16, borderRadius: 14, borderWidth: 1 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 8 },
  sectionContent: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  footer: { textAlign: "center", marginTop: 24, fontSize: 12, fontFamily: "Inter_400Regular" },
});
