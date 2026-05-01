import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const ONBOARDING_KEY = "zawyaai.onboarding_done";

const OnboardingContext = React.createContext<{ markDone: () => void }>({ markDone: () => {} });
export const useOnboarding = () => React.useContext(OnboardingContext);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const markDone = React.useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setOnboardingDone(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setOnboardingDone(v === "true");
      setReady(true);
    });
  }, [loading]);

  useEffect(() => {
    if (!ready) return;
    const seg0 = segments[0] as string | undefined;
    const inAuth = seg0 === "(auth)";
    const inOnboarding = seg0 === "onboarding";
    const inTabs = seg0 === "(tabs)";
    // Modals et écrans standalone — ne pas interférer
    const isModal = ["publish", "premium", "history", "support", "notifications", "schedule", "analytics", "rate", "scenarios", "profile", "privacy", "help", "terms", "about", "shot-analyser", "captions", "tracking", "light-coach", "director-ia", "lut-auto", "auto-cut", "viral-score", "gallery", "collaboration", "watermark"].includes(seg0 ?? "");

    if (isModal) return;

    // Utilisateur connecté → app directement (compte existant)
    if (user && inTabs) return;

    // Utilisateur connecté mais dans auth → nouveau compte qui fait le setup
    if (user && inAuth) return;

    // Utilisateur connecté mais nulle part → app
    if (user && !inTabs && !inAuth && !inOnboarding) {
      router.replace("/(tabs)");
      return;
    }

    // Première visite → onboarding
    if (!onboardingDone && !inOnboarding && !user) {
      router.replace("/onboarding");
      return;
    }

    // Onboarding fait, pas connecté → login
    if (onboardingDone && !user && !inAuth) {
      router.replace("/(auth)/login");
      return;
    }
  }, [ready, onboardingDone, user, segments[0]]);

  return (
    <OnboardingContext.Provider value={{ markDone }}>
      {children}
    </OnboardingContext.Provider>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0D0D0F" } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="premium"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="publish"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="history"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="support"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="schedule"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="analytics"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="rate"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="scenarios"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="privacy" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="help" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="terms" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="about" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="shot-analyser" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="captions" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="tracking" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="light-coach" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="director-ia" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="lut-auto" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="auto-cut" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="viral-score" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="gallery" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="collaboration" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="watermark" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
              <AuthProvider>
                <HistoryProvider>
                  <ScheduleProvider>
                    <View style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
                      <StatusBar style="light" />
                      <AuthGate>
                        <RootLayoutNav />
                      </AuthGate>
                    </View>
                  </ScheduleProvider>
                </HistoryProvider>
              </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
