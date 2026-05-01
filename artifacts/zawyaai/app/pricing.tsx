import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://zawai-app.onrender.com";

type Plan = {
  id: "free" | "pro" | "studio";
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  popular?: boolean;
};

export default function PricingScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: "free",
      name: "Gratuit",
      price: { monthly: 0, yearly: 0 },
      features: [
        "10 analyses IA par jour",
        "Fonctionnalités de base",
        "Publicités",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: 500, yearly: 5000 },
      features: [
        "Analyses IA illimitées",
        "Export PDF",
        "Pas de publicités",
        "Support prioritaire",
      ],
      popular: true,
    },
    {
      id: "studio",
      name: "Studio",
      price: { monthly: 1500, yearly: 15000 },
      features: [
        "Tout du Plan Pro",
        "Collaboration en équipe",
        "Statistiques avancées",
        "Publication automatique",
        "Support 24/7",
      ],
    },
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === "free") {
      Alert.alert("Plan Gratuit", "Vous utilisez déjà le plan gratuit !");
      return;
    }

    if (!user) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour continuer");
      router.push("/auth");
      return;
    }

    setLoading(plan.id);

    try {
      // Créer une session de paiement Chargily
      const response = await fetch(`${API_URL}/api/payment/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.id,
          period,
          user_id: user.id,
          user_email: user.email,
        }),
      });

      const data = (await response.json()) as {
        checkout_url?: string;
        order_id?: string;
        message?: string;
      };

      if (!data.checkout_url) {
        Alert.alert("Erreur", data.message ?? "Impossible de créer le paiement");
        setLoading(null);
        return;
      }

      // Ouvrir la page de paiement Chargily
      const result = await WebBrowser.openBrowserAsync(data.checkout_url);

      if (result.type === "cancel") {
        Alert.alert("Paiement annulé", "Vous avez annulé le paiement");
      }

      setLoading(null);
    } catch (err) {
      console.error("[Payment error]", err);
      Alert.alert("Erreur", "Une erreur est survenue lors du paiement");
      setLoading(null);
    }
  };

  const getSavings = (plan: Plan) => {
    if (period === "yearly") {
      const monthlyCost = plan.price.monthly * 12;
      const yearlyCost = plan.price.yearly;
      return monthlyCost - yearlyCost;
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Choisir un plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Toggle */}
        <View style={styles.periodToggle}>
          <Pressable
            style={[styles.periodButton, period === "monthly" && styles.periodButtonActive]}
            onPress={() => setPeriod("monthly")}
          >
            <Text
              style={[styles.periodText, period === "monthly" && styles.periodTextActive]}
            >
              Mensuel
            </Text>
          </Pressable>
          <Pressable
            style={[styles.periodButton, period === "yearly" && styles.periodButtonActive]}
            onPress={() => setPeriod("yearly")}
          >
            <Text style={[styles.periodText, period === "yearly" && styles.periodTextActive]}>
              Annuel
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Économie</Text>
            </View>
          </Pressable>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const price = plan.price[period];
            const savings = getSavings(plan);
            const isLoading = loading === plan.id;

            return (
              <View key={plan.id} style={styles.planCard}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Populaire</Text>
                  </View>
                )}

                <Text style={styles.planName}>{plan.name}</Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{price.toLocaleString()}</Text>
                  <Text style={styles.currency}>DA</Text>
                  <Text style={styles.period}>/{period === "monthly" ? "mois" : "an"}</Text>
                </View>

                {savings > 0 && (
                  <Text style={styles.savingsInfo}>
                    Économie de {savings.toLocaleString()} DA
                  </Text>
                )}

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#4DC8E8" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={[
                    styles.selectButton,
                    plan.popular && styles.selectButtonPopular,
                    isLoading && styles.selectButtonLoading,
                  ]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      {plan.popular && (
                        <LinearGradient
                          colors={["#4DC8E8", "#7C3AED"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <Text
                        style={[
                          styles.selectButtonText,
                          plan.popular && styles.selectButtonTextPopular,
                        ]}
                      >
                        {plan.id === "free" ? "Plan actuel" : "Choisir ce plan"}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Text style={styles.paymentTitle}>Moyens de paiement acceptés</Text>
          <View style={styles.paymentIcons}>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>💳 CCP</Text>
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>🏦 Edahabia</Text>
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>💰 Carte bancaire</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Paiement sécurisé par Chargily Pay 🔒
          </Text>
          <Text style={styles.footerSubtext}>
            Annulation possible à tout moment
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: "#1A1A1F",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    position: "relative",
  },
  periodButtonActive: {
    backgroundColor: "#4DC8E8",
  },
  periodText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Inter",
  },
  periodTextActive: {
    color: "#fff",
  },
  savingsBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter",
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: "#1A1A1F",
    borderRadius: 16,
    padding: 24,
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: 24,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter",
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: "800",
    color: "#4DC8E8",
    fontFamily: "Inter",
  },
  currency: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4DC8E8",
    marginLeft: 4,
    fontFamily: "Inter",
  },
  period: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
    fontFamily: "Inter",
  },
  savingsInfo: {
    fontSize: 14,
    color: "#7C3AED",
    marginBottom: 16,
    fontFamily: "Inter",
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#ccc",
    flex: 1,
    fontFamily: "Inter",
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2F",
    overflow: "hidden",
  },
  selectButtonPopular: {
    backgroundColor: "transparent",
  },
  selectButtonLoading: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter",
  },
  selectButtonTextPopular: {
    color: "#fff",
  },
  paymentMethods: {
    marginTop: 32,
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Inter",
  },
  paymentIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paymentIcon: {
    backgroundColor: "#1A1A1F",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  paymentIconText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Inter",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#4DC8E8",
    marginBottom: 4,
    fontFamily: "Inter",
  },
  footerSubtext: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Inter",
  },
});
