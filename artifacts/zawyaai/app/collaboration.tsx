import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { generateCollaborationPDF } from "@/lib/pdf";

const PRIMARY = "#4DC8E8";
const ACCENT  = "#7C3AED";

type Project = { id: string; name: string; creator: string; members: number; photos: number; lastActivity: string; color: string };

const DEMO_PROJECTS: Project[] = [
  { id: "1", name: "Campagne Mode Été", creator: "Roqia", members: 3, photos: 12, lastActivity: "Il y a 2h", color: "#EC4899" },
  { id: "2", name: "Shooting Produit", creator: "Roqia", members: 2, photos: 8, lastActivity: "Hier", color: PRIMARY },
];

export default function CollaborationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const onExportBrief = async (project: Project) => {
    setPdfLoading(true);
    try {
      await generateCollaborationPDF({
        projectName: project.name,
        creator: project.creator,
        members: [`${project.creator}`, "Membre 2", "Membre 3"].slice(0, project.members),
        photos: project.photos,
        comments: [
          { user: "Membre 2", comment: "Super cadrage sur la photo #3 !", time: "Il y a 1h" },
          { user: "Membre 3", comment: "Le LUT Golden Hour est parfait.", time: "Il y a 3h" },
        ],
        schedule: [
          { platform: "Instagram", date: "Demain 12:30", caption: "Contenu du projet..." },
          { platform: "TikTok", date: "Demain 18:00", caption: "Version courte..." },
        ],
      });
    } catch {
      Alert.alert("Erreur", "Impossible de générer le PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const createProject = () => {
    if (!projectName.trim()) { Alert.alert("Erreur", "Entrez un nom de projet."); return; }
    Alert.alert("Projet créé ✅", `"${projectName}" a été créé. Invitez des collaborateurs par email.`);
    setProjectName("");
    setShowCreate(false);
  };

  const inviteCollaborator = () => {
    if (!inviteEmail.trim()) { Alert.alert("Erreur", "Entrez un email."); return; }
    Alert.alert("Invitation envoyée ✅", `Une invitation a été envoyée à ${inviteEmail}.`);
    setInviteEmail("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Collaboration</Text>
          <Pressable onPress={() => setShowCreate(s => !s)} style={{ overflow: "hidden", borderRadius: 12 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newBtn}>
              <Feather name="plus" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Hero */}
        <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Feather name="users" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Créez ensemble</Text>
            <Text style={styles.heroDesc}>Partagez vos projets photo avec d'autres créateurs et collaborez en temps réel.</Text>
          </View>
        </LinearGradient>

        {/* Créer un projet */}
        {showCreate ? (
          <View style={[styles.createCard, { backgroundColor: colors.card, borderColor: PRIMARY + "40" }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nouveau projet</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="folder" size={16} color={colors.mutedForeground} />
              <TextInput value={projectName} onChangeText={setProjectName} placeholder="Nom du projet..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
            </View>
            <Pressable onPress={createProject} style={{ marginTop: 12 }}>
              <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.ctaBtnText}>Créer le projet</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}

        {/* Mes projets */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes projets</Text>
        {DEMO_PROJECTS.map(p => (
          <Pressable key={p.id} onPress={() => Alert.alert(p.name, `${p.photos} photos · ${p.members} membres\nDernière activité : ${p.lastActivity}`)} style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.projectIcon, { backgroundColor: p.color + "22" }]}>
              <Feather name="folder" size={20} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectName, { color: colors.foreground }]}>{p.name}</Text>
              <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>{p.members} membres · {p.photos} photos · {p.lastActivity}</Text>
            </View>
            <Pressable onPress={() => onExportBrief(p)} disabled={pdfLoading} style={{ padding: 8 }}>
              <Feather name={pdfLoading ? "loader" : "file-text"} size={18} color="#4DC8E8" />
            </Pressable>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}

        {/* Inviter */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Inviter un collaborateur</Text>
        <View style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput value={inviteEmail} onChangeText={setInviteEmail} placeholder="email@exemple.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { color: colors.foreground }]} />
          </View>
          <Pressable onPress={inviteCollaborator} style={{ marginTop: 12 }}>
            <LinearGradient colors={[PRIMARY, ACCENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.ctaBtnText}>Envoyer l'invitation</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Commentaires */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Commentaires récents</Text>
        {[
          { user: "Membre 2", comment: "Super cadrage sur la photo #3 !", time: "Il y a 1h", color: "#22C55E" },
          { user: "Membre 3", comment: "Le LUT Golden Hour est parfait pour ce shooting.", time: "Il y a 3h", color: "#F59E0B" },
        ].map((c, i) => (
          <View key={i} style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.commentAvatar, { backgroundColor: c.color + "22" }]}>
              <Text style={{ color: c.color, fontFamily: "Inter_700Bold", fontSize: 14 }}>{c.user[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[styles.commentUser, { color: colors.foreground }]}>{c.user}</Text>
                <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{c.time}</Text>
              </View>
              <Text style={[styles.commentText, { color: colors.mutedForeground }]}>{c.comment}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  newBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, marginBottom: 24 },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 8 },
  createCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 50, borderRadius: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14 },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
  projectCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  projectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  projectName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  projectMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  inviteCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  commentCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  commentAvatar: { width: 36, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  commentUser: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  commentTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  commentText: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3 },
});
