import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function Screen({ children, scroll = true, style }) {
  const Content = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe}>
      <Content contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled">
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30, gap: 18 }
});
