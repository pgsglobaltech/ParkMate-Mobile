import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

const SHORTCUTS = [
  { title: "Help", icon: "help-circle-outline", action: "help" },
  { title: "Services", icon: "grid-outline", action: "services" },
  { title: "Security", icon: "shield-checkmark-outline", action: "security" },
  { title: "Bookings", icon: "receipt-outline", action: "activity" }
];

function displayName(user) {
  return user?.fullName?.trim() || "ParkMate member";
}

export default function AccountScreen({ navigation }) {
  const { user } = useAuth();
  const name = displayName(user);

  function openShortcut(action) {
    if (action === "help") {
      Alert.alert(
        "ParkMate help",
        "For reservation or payment questions, open Activity and select the booking you need help with."
      );
      return;
    }
    if (action === "security") {
      navigation.navigate("Account details", { section: "Security" });
      return;
    }
    navigation.getParent().navigate(action === "services" ? "Services" : "Activity");
  }

  return (
    <Screen style={styles.page}>
      <View style={styles.profileHeader}>
        <View style={styles.profileCopy}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.memberLabel}>PARKMATE ACCOUNT</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open account details"
          onPress={() => navigation.navigate("Account details")}
          style={styles.profileButton}
        >
          <Ionicons name="person-outline" size={27} color={colors.ink} />
          <View style={styles.profileButtonArrow}>
            <Ionicons name="chevron-forward" size={12} color="#101010" />
          </View>
        </Pressable>
      </View>

      <View style={styles.shortcutGrid}>
        {SHORTCUTS.map(shortcut => (
          <Pressable
            key={shortcut.action}
            accessibilityRole="button"
            onPress={() => openShortcut(shortcut.action)}
            style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
          >
            <Ionicons name={shortcut.icon} size={20} color={colors.ink} />
            <Text style={styles.shortcutText}>{shortcut.title}</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.getParent().navigate("Home")}
        style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
      >
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>Find your next parking space</Text>
          <Text style={styles.featureDescription}>Explore available parking around you and book a slot ahead.</Text>
          <View style={styles.featureAction}>
            <Text style={styles.featureActionText}>Explore parking</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.primary} />
          </View>
        </View>
        <View style={styles.featureIcon}>
          <Ionicons name="location" size={28} color={colors.primary} />
        </View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your ParkMate</Text>
        <Text style={styles.sectionSubtitle}>Everything for a smoother parking trip.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.getParent().navigate("Activity")}
        style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}
      >
        <View style={[styles.infoIcon, { backgroundColor: "#29251b" }]}>
          <Ionicons name="receipt-outline" size={23} color={colors.primary} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Your bookings</Text>
          <Text style={styles.infoDescription}>View reservations and their payment totals in Activity.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Account details", { section: "Personal info" })}
        style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}
      >
        <View style={[styles.infoIcon, { backgroundColor: "#1e2826" }]}>
          <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Account details</Text>
          <Text style={styles.infoDescription}>Review the name and email linked to your account.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 16, gap: 18 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  profileCopy: { flex: 1, gap: 4 },
  name: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  memberLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  profileButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#777777", alignItems: "center", justifyContent: "center", position: "relative" },
  profileButtonArrow: { width: 20, height: 20, borderRadius: 10, position: "absolute", right: -1, bottom: 0, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, justifyContent: "space-between" },
  shortcut: { width: "48.5%", minHeight: 58, paddingHorizontal: 13, borderRadius: 14, backgroundColor: "#222222", flexDirection: "row", alignItems: "center", gap: 9 },
  shortcutText: { color: colors.ink, fontSize: 13, fontWeight: "700", flex: 1 },
  featureCard: { borderRadius: 18, backgroundColor: "#20241a", borderWidth: 1, borderColor: "#343b29", padding: 17, flexDirection: "row", alignItems: "center", gap: 10 },
  featureCopy: { flex: 1, gap: 8 },
  featureTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  featureDescription: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  featureAction: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  featureActionText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  featureIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#2e3523", alignItems: "center", justifyContent: "center" },
  sectionHeading: { gap: 3, marginBottom: -6 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { color: colors.muted, fontSize: 12 },
  infoCard: { borderRadius: 16, backgroundColor: "#191919", borderWidth: 1, borderColor: "#292929", padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { width: 43, height: 43, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  infoCopy: { flex: 1, gap: 4 },
  infoTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  infoDescription: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.72 }
});
