import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStripe } from "@stripe/stripe-react-native";
import Screen from "../components/Screen";
import { Button, Card, ErrorText, Heading } from "../components/UI";
import { api } from "../api/client";
import { useAuth } from "../../App";
import { colors } from "../theme";

export default function SlotsScreen({ route, navigation }) {
  const { location } = route.params;
  const { token } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const queryClient = useQueryClient();
  const initialStart = useMemo(() => route.params?.start
    ? new Date(route.params.start)
    : new Date(Date.now() + 60 * 60 * 1000), [route.params?.start]);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(route.params?.end
    ? new Date(route.params.end)
    : new Date(initialStart.getTime() + 2 * 60 * 60 * 1000));
  const [picker, setPicker] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const availability = useQuery({
    queryKey: ["availability", location.id, start.toISOString(), end.toISOString()],
    queryFn: () => api(`/locations/${location.id}/availability?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { token }),
    enabled: end > start
  });

  async function reserve() {
    if (!selected) return;
    setBusy(true);
    setError("");
    let bookingId;
    try {
      const booking = await api("/bookings", {
        token,
        method: "POST",
        body: { slotId: selected.id, start: start.toISOString(), end: end.toISOString() }
      });
      bookingId = booking.id;
      const intent = await api("/payments/intent", {
        token,
        method: "POST",
        body: { bookingId: booking.id }
      });
      const initialized = await initPaymentSheet({
        paymentIntentClientSecret: intent.clientSecret,
        merchantDisplayName: "ParkMate",
        returnURL: "parkmate://stripe-redirect"
      });
      if (initialized.error) throw new Error(initialized.error.message);
      const result = await presentPaymentSheet();
      if (result.error) throw new Error(result.error.message);
      await queryClient.invalidateQueries({ queryKey: ["availability"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigation.navigate("ParkMate", { screen: "My bookings" });
    } catch (err) {
      if (bookingId) {
        try {
          await api(`/bookings/${bookingId}/cancel`, { token, method: "POST" });
          await queryClient.invalidateQueries({ queryKey: ["bookings"] });
        } catch (cancelError) {
          setError(`${err.message}. Booking cancellation also failed: ${cancelError.message}`);
        }
      }
      setError(current => current || err.message);
      await queryClient.invalidateQueries({ queryKey: ["availability"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Heading subtitle={`${location.address}, ${location.city}`}>{location.name}</Heading>
      <Card>
        <Text style={styles.label}>Choose your parking time</Text>
        <View style={styles.timeRow}>
          <TimeButton title="Arrival" value={start} onPress={() => setPicker("start")} />
          <TimeButton title="Departure" value={end} onPress={() => setPicker("end")} />
        </View>
        <View style={styles.rateRow}>
          <Ionicons name="pricetag-outline" color={colors.primary} size={15} />
          <Text style={styles.rate}>₹{location.hourlyRate} per hour</Text>
        </View>
      </Card>
      {picker ? (
        <DateTimePicker
          value={picker === "start" ? start : end}
          mode="datetime"
          minimumDate={new Date()}
          onChange={(_, value) => {
            setPicker(null);
            if (value) picker === "start" ? setStart(value) : setEnd(value);
            setSelected(null);
          }}
        />
      ) : null}
      <View style={styles.slotsHeader}>
        <Text style={styles.label}>Available spaces</Text>
        {availability.isFetching ? <ActivityIndicator color={colors.primary} /> : null}
      </View>
      <ErrorText>{end <= start ? "Departure must be after arrival." : availability.error?.message}</ErrorText>
      <FlatList
        data={availability.data || []}
        numColumns={3}
        keyExtractor={item => String(item.id)}
        scrollEnabled={false}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={[styles.slot, selected?.id === item.id && styles.selectedSlot]}>
            <Ionicons name="car-outline" size={16} color={selected?.id === item.id ? "#101010" : colors.muted} />
            <Text style={[styles.slotLabel, selected?.id === item.id && styles.selectedLabel]}>{item.label}</Text>
            <Text style={[styles.slotSub, selected?.id === item.id && styles.selectedLabel]}>Available</Text>
          </Pressable>
        )}
      />
      {!availability.isLoading && !availability.error && availability.data?.length === 0
        ? <Text style={styles.empty}>No spaces available for this time. Try another window.</Text> : null}
      <ErrorText>{error}</ErrorText>
      <Button title={selected ? `Book ${selected.label} · Pay securely` : "Select a parking slot"}
        onPress={reserve} disabled={!selected || !availability.data?.some(slot => slot.id === selected?.id)} loading={busy} />
      <Text style={styles.disclaimer}><Ionicons name="lock-closed" size={11} color={colors.muted} /> Secure payment · Your space is held when your booking is confirmed</Text>
    </Screen>
  );
}

function TimeButton({ title, value, onPress }) {
  return (
    <Pressable style={styles.timeButton} onPress={onPress}>
      <Text style={styles.timeCaption}>{title}</Text>
      <Text style={styles.timeValue}>{value.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  timeRow: { flexDirection: "row", gap: 10 },
  timeButton: { flex: 1, backgroundColor: "#101010", padding: 12, borderRadius: 12, gap: 5, borderWidth: 1, borderColor: colors.border },
  timeCaption: { color: colors.muted, fontSize: 12 },
  timeValue: { color: colors.ink, fontWeight: "700", fontSize: 12 },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rate: { color: colors.primary, fontWeight: "800" },
  slotsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gridRow: { gap: 10, marginBottom: 10 },
  slot: { flex: 1, height: 82, borderRadius: 14, borderColor: colors.border, borderWidth: 1, backgroundColor: "#191919", justifyContent: "center", alignItems: "center", gap: 3 },
  selectedSlot: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotLabel: { fontSize: 15, color: colors.ink, fontWeight: "900" },
  slotSub: { fontSize: 11, color: colors.muted },
  selectedLabel: { color: "#101010" },
  empty: { textAlign: "center", color: colors.muted, padding: 18, backgroundColor: "#191919", borderRadius: 14, overflow: "hidden" },
  disclaimer: { color: colors.muted, textAlign: "center", fontSize: 11, lineHeight: 17 }
});
