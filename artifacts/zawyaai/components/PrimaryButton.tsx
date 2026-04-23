import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "ghost" | "outline";

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  if (variant === "primary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={["#A855F7", "#C026D3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, { borderRadius: colors.radius }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.btn,
          {
            borderRadius: colors.radius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: "transparent",
            opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
          },
          style,
        ]}
      >
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        {
          borderRadius: colors.radius,
          backgroundColor: pressed ? colors.secondary : "transparent",
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
