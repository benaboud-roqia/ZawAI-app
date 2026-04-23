import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";

const SHOTS = [
  { id: "wide", label: "Plan général", icon: "image" },
  { id: "full", label: "Plan d'ensemble", icon: "users" },
  { id: "medium", label: "Plan moyen", icon: "user" },
  { id: "american", label: "Plan américain", icon: "user" },
  { id: "close", label: "Gros plan", icon: "smile" },
  { id: "extreme", label: "Très gros plan", icon: "eye" },
];

const ANGLES = [
  { id: "eye", label: "Eye Level", value: "0°" },
  { id: "high", label: "High", value: "+30°" },
  { id: "low", label: "Low", value: "-25°" },
  { id: "dutch", label: "Dutch", value: "15°" },
  { id: "top", label: "Top Shot", value: "90°" },
  { id: "over", label: "Over Shoulder", value: "—" },
  { id: "pov", label: "POV", value: "—" },
  { id: "worm", label: "Worm Eye", value: "-45°" },
];

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [shot, setShot] = useState("medium");
  const [angle, setAngle] = useState("eye");
  const [iso, setIso] = useState(400);
  const [shutter, setShutter] = useState("1/120");
  const [wb, setWb] = useState(5600);
  const [grid, setGrid] = useState(true);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setLastPhoto(photo.uri);
        router.push({ pathname: "/publish", params: { uri: photo.uri } });
      }
    } catch {
      // ignore
    } finally {
      setCapturing(false);
    }
  };

  const flipCamera = () => setFacing((f) => (f === "back" ? "front" : "back"));

  const renderViewfinder = () => {
    if (!permission) {
      return (
        <View style={styles.permissionWrap}>
          <Text style={{ color: "#fff" }}>Initialisation…</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.permissionWrap}>
          <Feather name="camera-off" size={32} color="#fff" />
          <Text style={[styles.permTitle]}>Activer la caméra</Text>
          <Text style={[styles.permDesc]}>
            ZawyaAI a besoin d'accéder à votre caméra pour la composition en direct.
          </Text>
          <PrimaryButton
            label="Autoriser la caméra"
            onPress={requestPermission}
            style={{ marginTop: 18, paddingHorizontal: 28 }}
          />
        </View>
      );
    }
    return (
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Caméra
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Composition cinématographique
            </Text>
          </View>
          <Pressable
            onPress={flipCamera}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="refresh-cw" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => setGrid(!grid)}
            style={[
              styles.iconBtn,
              {
                backgroundColor: grid ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather
              name="grid"
              size={18}
              color={grid ? "#fff" : colors.foreground}
            />
          </Pressable>
        </View>

        {/* Viewfinder */}
        <View
          style={[
            styles.viewfinder,
            { borderColor: colors.border, backgroundColor: "#000" },
          ]}
        >
          {renderViewfinder()}

          {/* Grid overlay */}
          {grid && permission?.granted ? (
            <>
              <View style={[styles.gridLine, { left: "33.3%", top: 0, bottom: 0, width: 1 }]} />
              <View style={[styles.gridLine, { left: "66.6%", top: 0, bottom: 0, width: 1 }]} />
              <View style={[styles.gridLine, { top: "33.3%", left: 0, right: 0, height: 1 }]} />
              <View style={[styles.gridLine, { top: "66.6%", left: 0, right: 0, height: 1 }]} />
            </>
          ) : null}

          {/* Top HUD */}
          {permission?.granted ? (
            <>
              <View style={styles.hudTop} pointerEvents="none">
                <View style={styles.hudPill}>
                  <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
                  <Text style={styles.hudText}>IA active</Text>
                </View>
                <View style={styles.hudPill}>
                  <Text style={styles.hudText}>9:16 · 4K</Text>
                </View>
              </View>

              {/* Focus reticle */}
              <View style={styles.reticle} pointerEvents="none">
                <View style={styles.reticleInner} />
              </View>

              {/* Bottom HUD */}
              <View style={styles.hudBottom} pointerEvents="none">
                <View style={styles.hudPill}>
                  <Feather name="sun" size={12} color="#F59E0B" />
                  <Text style={styles.hudText}>Lumière 72%</Text>
                </View>
                <View style={styles.hudPill}>
                  <Feather name="check-circle" size={12} color="#22C55E" />
                  <Text style={styles.hudText}>Cadrage OK</Text>
                </View>
                <View style={styles.hudPill}>
                  <Feather name="zap" size={12} color="#A855F7" />
                  <Text style={styles.hudText}>Score 86</Text>
                </View>
              </View>

              {/* Capture button */}
              <View style={styles.captureWrap}>
                <Pressable
                  onPress={takePhoto}
                  disabled={capturing}
                  style={[styles.captureOuter, { opacity: capturing ? 0.5 : 1 }]}
                >
                  <LinearGradient
                    colors={["#A855F7", "#C026D3"]}
                    style={styles.captureInner}
                  />
                </Pressable>
              </View>

              {/* Last photo thumbnail / publish shortcut */}
              {lastPhoto ? (
                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/publish", params: { uri: lastPhoto } })
                  }
                  style={styles.lastThumb}
                >
                  <View style={styles.lastThumbInner}>
                    <Feather name="send" size={14} color="#fff" />
                  </View>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        {/* Shot types */}
        <Section title="Plans cinématographiques">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SHOTS.map((s) => {
              const active = shot === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setShot(s.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={s.icon as any}
                    size={14}
                    color={active ? "#fff" : colors.foreground}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#fff" : colors.foreground },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Section>

        {/* Angles */}
        <Section title="Angles professionnels (8)">
          <View style={styles.grid}>
            {ANGLES.map((a) => {
              const active = angle === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => setAngle(a.id)}
                  style={[
                    styles.angleCard,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.angleLabel,
                      { color: active ? "#fff" : colors.foreground },
                    ]}
                  >
                    {a.label}
                  </Text>
                  <Text
                    style={[
                      styles.angleValue,
                      {
                        color: active
                          ? "rgba(255,255,255,0.85)"
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {a.value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Tech controls */}
        <Section title="Contrôles techniques">
          <View style={[styles.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Control
              icon="circle"
              label="ISO"
              value={String(iso)}
              onMinus={() => setIso(Math.max(50, iso - 100))}
              onPlus={() => setIso(Math.min(6400, iso + 100))}
              colors={colors}
            />
            <Divider colors={colors} />
            <Control
              icon="clock"
              label="Vitesse"
              value={shutter}
              onMinus={() => setShutter("1/60")}
              onPlus={() => setShutter("1/250")}
              colors={colors}
            />
            <Divider colors={colors} />
            <Control
              icon="thermometer"
              label="Balance des blancs"
              value={`${wb}K`}
              onMinus={() => setWb(Math.max(2500, wb - 200))}
              onPlus={() => setWb(Math.min(10000, wb + 200))}
              colors={colors}
            />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

function Control({
  icon,
  label,
  value,
  onMinus,
  onPlus,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.controlRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        <Feather name={icon as any} size={16} color={colors.primary} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14 }}>{label}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={onMinus}
          style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="minus" size={14} color={colors.foreground} />
        </Pressable>
        <Text
          style={{
            minWidth: 64,
            textAlign: "center",
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          }}
        >
          {value}
        </Text>
        <Pressable
          onPress={onPlus}
          style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, fontFamily: "Inter_400Regular" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  viewfinder: {
    marginHorizontal: 20,
    height: 460,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  permissionWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#0A0612",
  },
  permTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 14,
    textAlign: "center",
  },
  permDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  hudTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hudBottom: {
    position: "absolute",
    bottom: 90,
    left: 14,
    right: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hudPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  hudText: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 11 },
  dot: { width: 7, height: 7, borderRadius: 999 },
  reticle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 90,
    height: 90,
    marginTop: -45,
    marginLeft: -45,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.6)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  reticleInner: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#A855F7",
  },
  captureWrap: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureOuter: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    padding: 4,
  },
  captureInner: { flex: 1, borderRadius: 999 },
  lastThumb: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  lastThumbInner: {
    flex: 1,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  angleCard: {
    width: "31%",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  angleLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  angleValue: { marginTop: 2, fontSize: 11, fontFamily: "Inter_500Medium" },
  controlCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
