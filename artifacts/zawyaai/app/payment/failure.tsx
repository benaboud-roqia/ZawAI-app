import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaymentFailureScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="close" size={80} color="#FF4444" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Paiement échoué</Text>

        {/* Message */}
        <Text style={styles.message}>
          Le paiement n'a pas pu être effectué.{"\n"}
          Veuillez réessayer ou contacter le support.
        </Text>

        {/* Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Raisons possibles :</Text>
          <View style={styles.reasonRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonText}>Fonds insuffisants</Text>
          </View>
          <View style={styles.reasonRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonText}>Carte expirée ou invalide</Text>
          </View>
          <View style={styles.reasonRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonText}>Problème de connexion</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Réessayer</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
          </Pressable>

          <Pressable
            style={styles.tertiaryButton}
            onPress={() => router.push("/support")}
          >
            <Text style={styles.tertiaryButtonText}>Contacter le support</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#2A1A1F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FF4444",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Inter",
  },
  message: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: "Inter",
  },
  reasonsContainer: {
    width: "100%",
    backgroundColor: "#1A1A1F",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    fontFamily: "Inter",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#FF4444",
    marginRight: 8,
    fontFamily: "Inter",
  },
  reasonText: {
    fontSize: 14,
    color: "#ccc",
    flex: 1,
    fontFamily: "Inter",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4DC8E8",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter",
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1F",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter",
  },
  tertiaryButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4DC8E8",
    fontFamily: "Inter",
  },
});
