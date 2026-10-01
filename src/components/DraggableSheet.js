import React, { useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors } from "../theme";

export default function DraggableSheet({ children, height, collapsedHeight, onExpandedChange }) {
  const insets = useSafeAreaInsets();
  const maxTranslate = Math.max(0, height - collapsedHeight);
  const position = useRef(new Animated.Value(maxTranslate)).current;
  const positionAtGrant = useRef(maxTranslate);
  const expandedRef = useRef(false);
  const onExpandedChangeRef = useRef(onExpandedChange);
  onExpandedChangeRef.current = onExpandedChange;

  const snapTo = (shouldExpand) => {
    if (expandedRef.current !== shouldExpand) Haptics.selectionAsync();
    expandedRef.current = shouldExpand;
    onExpandedChangeRef.current?.(shouldExpand);
    Animated.spring(position, {
      toValue: shouldExpand ? 0 : maxTranslate,
      useNativeDriver: true,
      damping: 26,
      stiffness: 220,
      mass: 0.8
    }).start();
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => {
      position.stopAnimation(value => {
        positionAtGrant.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(0, Math.min(maxTranslate, positionAtGrant.current + gesture.dy));
      position.setValue(next);
    },
    onPanResponderRelease: (_, gesture) => {
      const projected = positionAtGrant.current + gesture.dy + gesture.vy * 90;
      snapTo(projected < maxTranslate * 0.52);
    },
    onPanResponderTerminate: () => snapTo(expandedRef.current),
    onPanResponderTerminationRequest: () => false
  }), [maxTranslate, position]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        { height, paddingBottom: Math.max(insets.bottom, 14), transform: [{ translateY: position }] }
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expandedRef.current ? "Collapse parking results" : "Expand parking results"}
        onPress={() => snapTo(!expandedRef.current)}
        style={styles.handleZone}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
      </Pressable>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#2b2b2b",
    overflow: "hidden"
  },
  handleZone: { height: 34, alignItems: "center", justifyContent: "center" },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: "#686868" }
});
