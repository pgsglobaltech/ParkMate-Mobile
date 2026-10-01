import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Screen from "../components/Screen";
import { ErrorText } from "../components/UI";
import SwipeAction from "../components/SwipeAction";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

export default function BookingsScreen() {
  const { token, signOut } = useAuth();
  const cache = useQueryClient();
  const bookings = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api("/bookings/me", { token })
  });
  const cancel = useMutation({
    mutationFn: id => api(`/bookings/${id}/cancel`, { token, method: "POST" }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["bookings"] })
  });

  return (
    <Screen style={styles.page}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>YOUR PARKING</Text>
          <Text style={styles.title}>Bookings</Text>
        </View>
        <Pressable onPress={signOut} style={styles.signOut}>
          <Ionicons name="log-out-outline" size={17} color={colors.ink} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>All your upcoming and past reservations in one place.</Text>
      {bookings.isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.helper}>Loading your bookings…</Text></View>
      ) : null}
      <ErrorText>{bookings.error?.message || cancel.error?.message}</ErrorText>
      <FlatList
        data={bookings.data || []}
        keyExtractor={item => String(item.id)}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const upcoming = item.status === "CONFIRMED" && new Date(item.start) > new Date();
          return (
            <View style={styles.bookingCard}>
              <View style={styles.cardTop}>
                <View style={styles.carIcon}><Ionicons name="car-outline" size={22} color={colors.ink} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingTitle}>Parking reservation</Text>
                  <Text style={styles.bookingNumber}>Booking #{item.id} · Slot {item.slotId}</Text>
                </View>
                <View style={[styles.statusPill, item.status === "CANCELLED" && styles.cancelledPill]}>
                  <Text style={[styles.status, item.status === "CANCELLED" && styles.cancelled]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.muted} />
                <Text style={styles.detailText}>{new Date(item.start).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={styles.detailText}>Until {new Date(item.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
                <Text style={styles.amount}>₹{Number(item.totalAmount).toFixed(2)}</Text>
              </View>
              {upcoming ? (
                <SwipeAction
                  label="Swipe left to cancel"
                  completeLabel="Cancelling reservation"
                  direction="left"
                  destructive
                  onComplete={() => cancel.mutateAsync(item.id).catch(() => {})}
                  loading={cancel.isPending}
                />
              ) : null}
            </View>
          );
        }}
      />
      {!bookings.isLoading && !bookings.error && bookings.data?.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Ionicons name="receipt-outline" size={26} color={colors.ink} /></View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Your confirmed parking reservations will show up here.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 12 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900", marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: -10 },
  signOut: { flexDirection: "row", alignItems: "center", gap: 5, padding: 9, borderRadius: 18, backgroundColor: colors.surface },
  signOutText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  loading: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 9, padding: 22 },
  helper: { color: colors.muted, fontSize: 13 },
  bookingCard: { borderRadius: 18, backgroundColor: "#191919", borderWidth: 1, borderColor: "#292929", padding: 15, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  carIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: "#292929", alignItems: "center", justifyContent: "center" },
  bookingTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  bookingNumber: { color: colors.muted, fontSize: 11, marginTop: 3 },
  statusPill: { backgroundColor: "#28351B", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  cancelledPill: { backgroundColor: "#3A211F" },
  status: { color: colors.primary, fontWeight: "800", fontSize: 9 },
  cancelled: { color: colors.danger },
  divider: { height: 1, backgroundColor: colors.border },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { flex: 1, color: colors.muted, fontSize: 12 },
  amount: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  emptyCard: { alignItems: "center", padding: 26, gap: 10, borderRadius: 18, backgroundColor: "#191919", borderWidth: 1, borderColor: "#292929", marginTop: 8 },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#292929", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center" }
});
