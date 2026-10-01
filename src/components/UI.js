import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

export function Heading({ children, subtitle }) {
  return <View style={styles.heading}><Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Field(props) {
  return <TextInput placeholderTextColor={colors.muted} selectionColor={colors.primary} {...props} style={[styles.field, props.style]} />;
}

export function Button({ title, onPress, disabled, secondary, loading }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.button, secondary && styles.secondary, (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={secondary ? colors.primary : "#fff"} /> : <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>}
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ErrorText({ children }) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}

const styles = StyleSheet.create({
  heading: { gap: 4, marginBottom: 4 },
  title: { color: colors.ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  field: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, backgroundColor: colors.surface, color: colors.ink, fontSize: 15 },
  button: { minHeight: 52, borderRadius: 14, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  buttonText: { color: "#101010", fontWeight: "800", fontSize: 15 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.ink },
  disabled: { opacity: 0.55 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 }
});
