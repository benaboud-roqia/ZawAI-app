import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaymentSuccessScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0D0D0F", "#1A1A1F"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={["#4DC8E8", "#7C3AED"]}
            style={styles.iconGradient}
          >
            <Ionicons name="checkmark" size={80} color="#fff" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Paiement réussi !</Text>

        {/* Message */}
        <Text style={styles.message}>
          Votre abonnement a été activé avec succès.{"\n"}
          Profitez de toutes les fonctionnalités premium !
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4DC8E8" />
            <Text style={styles.featureText}>Analyses IA illimitées</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4DC8E8" />
            <Text style={styles.featureText}>Export PDF</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4DC8E8" />
            <Text style={styles.featureText}>Pas de publicités</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <LinearGradient
              colors={["#4DC8E8", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.secondaryButtonText}>Voir mon abonnement</Text>
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
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 40,
    fontFamily: "Inter",
  },
  featuresContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
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
    overflow: "hidden",
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
    color: "#4DC8E8",
    fontFamily: "Inter",
  },
});
