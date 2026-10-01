import React, { useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export default function SwipeAction({
  label,
  completeLabel,
  onComplete,
  disabled = false,
  loading = false,
  direction = "right",
  destructive = false
}) {
  const [width, setWidth] = useState(0);
  const [completed, setCompleted] = useState(false);
  const offset = useRef(new Animated.Value(0)).current;
  const completionInProgress = useRef(false);
  const latest = useRef({ disabled, loading, completed, onComplete });
  latest.current = { disabled, loading, completed, onComplete };

  const thumbTravel = Math.max(0, width - 56);
  const complete = async (_animationResult) => {
    if (latest.current.disabled || latest.current.loading || completionInProgress.current) return;
    completionInProgress.current = true;
    setCompleted(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await latest.current.onComplete?.();
    } finally {
      completionInProgress.current = false;
      setCompleted(false);
      Animated.spring(offset, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220 }).start();
    }
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_, gesture) => {
      const distance = direction === "right" ? gesture.dx : -gesture.dx;
      offset.setValue(Math.max(0, Math.min(thumbTravel, distance)));
    },
    onPanResponderRelease: (_, gesture) => {
      const distance = direction === "right" ? gesture.dx : -gesture.dx;
      if (distance >= thumbTravel * 0.72) {
        Animated.timing(offset, { toValue: thumbTravel, duration: 100, useNativeDriver: true }).start(complete);
      } else {
        Animated.spring(offset, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220 }).start();
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start();
    }
  }), [direction, offset, thumbTravel]);

  const accent = destructive ? colors.danger : colors.primary;
  const thumbStyle = direction === "right"
    ? { left: 4, transform: [{ translateX: offset }] }
    : { right: 4, transform: [{ translateX: Animated.multiply(offset, -1) }] };

  return (
    <View
      style={[styles.track, destructive && styles.destructiveTrack, (disabled || loading) && styles.disabled]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={`Swipe ${direction} to continue, or double tap to activate`}
        accessibilityState={{ disabled: disabled || loading }}
        onAccessibilityTap={complete}
        onPress={complete}
        disabled={disabled || loading || completed}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.centerLabel}>
        <Text style={[styles.label, destructive && styles.destructiveLabel]}>
          {loading ? "Please wait…" : completed ? completeLabel : label}
        </Text>
        <Ionicons name={destructive ? "close" : "chevron-forward"} size={16} color={accent} />
      </View>
      <Animated.View pointerEvents="none" style={[styles.thumb, { backgroundColor: accent }, thumbStyle]}>
        <Ionicons
          name={loading ? "ellipsis-horizontal" : destructive ? "close" : "arrow-forward"}
          size={22}
          color="#101010"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: "#20281a",
    borderWidth: 1,
    borderColor: "#354326",
    overflow: "hidden"
  },
  destructiveTrack: { backgroundColor: "#2c1b1a", borderColor: "#4d2c2a" },
  disabled: { opacity: 0.58 },
  centerLabel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  label: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  destructiveLabel: { color: colors.danger },
  thumb: {
    position: "absolute",
    top: 4,
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  }
});
