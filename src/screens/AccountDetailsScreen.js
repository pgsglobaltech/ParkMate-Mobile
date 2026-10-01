import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

const SECTIONS = ["Home", "Personal info", "Security", "Privacy & data"];

function nameFor(user) {
  return user?.fullName?.trim() || "ParkMate member";
}

export default function AccountDetailsScreen({ navigation, route }) {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState(route.params?.section || "Home");
  const name = nameFor(user);
  const initial = name === "ParkMate member" ? "P" : name.charAt(0).toUpperCase();

  useEffect(() => {
    if (route.params?.section) setSection(route.params.section);
  }, [route.params?.section]);

  function openActivity() {
    navigation.getParent().navigate("Activity");
  }

  return (
    <Screen style={styles.page}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to account"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>ParkMate account</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabBar}
      >
        {SECTIONS.map(item => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: section === item }}
            onPress={() => setSection(item)}
            style={[styles.tab, section === item && styles.activeTab]}
          >
            <Text style={[styles.tabText, section === item && styles.activeTabText]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {section === "Home" ? (
        <View style={styles.sectionContent}>
          <Pressable onPress={() => setSection("Security")} style={styles.secureBanner}>
            <Ionicons name="shield-checkmark" size={22} color="#f2f2f2" />
            <View style={styles.secureCopy}>
              <Text style={styles.secureTitle}>Review your account security</Text>
              <Text style={styles.secureDescription}>Check your sign-in session and account access.</Text>
            </View>
            <Text style={styles.bannerAction}>Review</Text>
          </Pressable>

          <View style={styles.profileSummary}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
            <Text style={styles.profileName}>{name}</Text>
            {!!user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
          </View>

          <View style={styles.featureGrid}>
            <FeatureTile title="Personal info" icon="person-outline" onPress={() => setSection("Personal info")} />
            <FeatureTile title="Security" icon="shield-checkmark-outline" onPress={() => setSection("Security")} />
            <FeatureTile title="Privacy & data" icon="lock-closed-outline" onPress={() => setSection("Privacy & data")} />
          </View>

          <View style={styles.suggestions}>
            <Text style={styles.suggestionsHeading}>Suggestions</Text>
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionIcon}>
                <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
              </View>
              <Text style={styles.suggestionTitle}>Complete your account check-up</Text>
              <Text style={styles.suggestionDescription}>Review the profile details and sign-in settings used by ParkMate.</Text>
              <Pressable onPress={() => setSection("Personal info")} style={styles.checkupButton}>
                <Text style={styles.checkupText}>Review account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {section === "Personal info" ? (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Personal info</Text>
          <Text style={styles.sectionDescription}>These are the profile details linked to your ParkMate sign-in.</Text>
          <DetailRow icon="person-outline" label="Full name" value={name} />
          <DetailRow icon="mail-outline" label="Email address" value={user?.email || "Not available"} />
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
            <Text style={styles.noticeText}>Profile editing is not available in this version.</Text>
          </View>
        </View>
      ) : null}

      {section === "Security" ? (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.sectionDescription}>Manage access to your ParkMate account on this device.</Text>
          <DetailRow icon="key-outline" label="Sign-in" value="Email and password" />
          <DetailRow icon="shield-checkmark-outline" label="Current device" value="Signed in" />
          <Pressable onPress={signOut} style={styles.signOutRow}>
            <View style={styles.signOutIcon}><Ionicons name="log-out-outline" size={20} color={colors.danger} /></View>
            <View style={styles.signOutCopy}>
              <Text style={styles.signOutTitle}>Sign out on this device</Text>
              <Text style={styles.signOutDescription}>Remove this device's saved ParkMate session.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>
      ) : null}

      {section === "Privacy & data" ? (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Privacy & data</Text>
          <Text style={styles.sectionDescription}>A clear view of the account information used to provide parking services.</Text>
          <DetailRow icon="person-outline" label="Account profile" value="Name and email address" />
          <DetailRow icon="receipt-outline" label="Parking history" value="Available in Activity" />
          <Pressable onPress={openActivity} style={styles.activityButton}>
            <Text style={styles.activityButtonText}>View your bookings</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
            <Text style={styles.noticeText}>Account and reservation data is used to provide sign-in and booking features.</Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function FeatureTile({ title, icon, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.featureTile, pressed && styles.pressed]}>
      <Ionicons name={icon} size={24} color={colors.ink} />
      <Text style={styles.featureTileText}>{title}</Text>
    </Pressable>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}><Ionicons name={icon} size={20} color={colors.ink} /></View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 24, gap: 0 },
  header: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18 },
  backButton: { width: 28, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  tabScroll: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: "#2b2b2b" },
  tabBar: { flexGrow: 1, flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 8 },
  tab: { paddingHorizontal: 9, minHeight: 50, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { color: "#c0c0c0", fontSize: 12, fontWeight: "600" },
  activeTabText: { color: colors.ink, fontWeight: "800" },
  sectionContent: { paddingHorizontal: 18, paddingTop: 20, gap: 14 },
  secureBanner: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 15, padding: 14, backgroundColor: "#382813" },
  secureCopy: { flex: 1, gap: 3 },
  secureTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  secureDescription: { color: "#c8bca8", fontSize: 11, lineHeight: 15 },
  bannerAction: { color: colors.ink, fontSize: 11, fontWeight: "800", paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: "#55432c" },
  profileSummary: { alignItems: "center", paddingTop: 8, paddingBottom: 2, gap: 4 },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#777777", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.ink, fontSize: 36, fontWeight: "700" },
  profileName: { color: colors.ink, fontSize: 21, fontWeight: "900", marginTop: 1 },
  profileEmail: { color: colors.muted, fontSize: 12 },
  featureGrid: { flexDirection: "row", gap: 9 },
  featureTile: { flex: 1, minHeight: 97, borderRadius: 15, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", gap: 10, padding: 9 },
  featureTileText: { color: colors.ink, fontSize: 11, fontWeight: "700", textAlign: "center" },
  suggestions: { gap: 12, marginTop: 4 },
  suggestionsHeading: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  suggestionCard: { position: "relative", borderRadius: 16, borderWidth: 1, borderColor: "#303030", padding: 16, gap: 9, backgroundColor: "#121212" },
  suggestionIcon: { position: "absolute", right: 14, top: 14, width: 42, height: 42, borderRadius: 12, backgroundColor: "#20271a", alignItems: "center", justifyContent: "center" },
  suggestionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", lineHeight: 23, maxWidth: "78%" },
  suggestionDescription: { color: "#b6b6b6", fontSize: 12, lineHeight: 19, marginTop: 1 },
  checkupButton: { alignSelf: "flex-start", borderRadius: 22, backgroundColor: "#292929", paddingHorizontal: 15, paddingVertical: 10, marginTop: 2 },
  checkupText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  sectionTitle: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  sectionDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: -8, marginBottom: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#282828" },
  detailIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#222222", alignItems: "center", justifyContent: "center" },
  detailCopy: { flex: 1, gap: 4 },
  detailLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  detailValue: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderRadius: 13, backgroundColor: "#1b1e17", marginTop: 4 },
  noticeText: { flex: 1, color: "#c3c3c3", fontSize: 12, lineHeight: 18 },
  signOutRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 13 },
  signOutIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#30201f", alignItems: "center", justifyContent: "center" },
  signOutCopy: { flex: 1, gap: 4 },
  signOutTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  signOutDescription: { color: colors.muted, fontSize: 11 },
  activityButton: { flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start", paddingVertical: 10 },
  activityButtonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72 }
});
