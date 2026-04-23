import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import type { Lut } from "@/constants/luts";

type Props = {
  uri?: string | null;
  lut: Lut;
  style?: ViewStyle;
  fallback?: React.ReactNode;
};

export function CinematicImage({ uri, lut, style, fallback }: Props) {
  return (
    <View style={[{ overflow: "hidden" }, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        fallback ?? null
      )}

      {lut.layers.map((layer, idx) => {
        const overlayStyle: ViewStyle = {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: layer.color,
          opacity: layer.opacity,
        };
        if (Platform.OS === "web" && layer.blendMode) {
          (overlayStyle as Record<string, unknown>).mixBlendMode = layer.blendMode;
        }
        return <View key={`${lut.id}-${idx}`} style={overlayStyle} pointerEvents="none" />;
      })}

      {lut.vignette && lut.vignette > 0 ? (
        <LinearGradient
          colors={["rgba(0,0,0,0)", `rgba(0,0,0,${lut.vignette})`]}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
}
