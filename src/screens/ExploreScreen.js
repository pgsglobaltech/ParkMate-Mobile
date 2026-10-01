import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import Screen from "../components/Screen";
import { ErrorText, Field } from "../components/UI";
import { api } from "../api/client";
import { useAuth } from "../../App";
import { colors } from "../theme";

const QUICK_CITIES = ["Delhi", "Gurugram", "Noida", "Faridabad"];

export default function ExploreScreen({ navigation }) {
  const { token } = useAuth();
  const [city, setCity] = useState("");
  const [datePicker, setDatePicker] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [start, setStart] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const locations = useQuery({
    queryKey: ["locations", city],
    queryFn: () => api(`/locations${city.trim() ? `?city=${encodeURIComponent(city.trim())}` : ""}`, { token })
  });

  function choose(location) {
    navigation.navigate("Choose a slot", { location, start: start.toISOString(), end: end.toISOString() });
  }

  function setWhen(value) {
    if (value) setStart(value);
    setDatePicker(false);
  }

  return (
    <Screen style={styles.page}>
      <View style={styles.topBar}>
        <View style={styles.area}>
          <View style={styles.areaPin}><Ionicons name="location" size={16} color="#101010" /></View>
          <View>
            <Text style={styles.eyebrow}>PARKING AROUND</Text>
            <Text style={styles.areaTitle}>Delhi NCR <Ionicons name="chevron-down" size={14} color={colors.ink} /></Text>
          </View>
        </View>
        <Pressable style={styles.inboxButton} onPress={() => navigation.navigate("My bookings")}>
          <Ionicons name="receipt-outline" size={18} color={colors.ink} />
          <Text style={styles.inboxText}>Bookings</Text>
        </Pressable>
      </View>

      <View style={styles.modeTabs}>
        <View style={styles.modeActive}><Ionicons name="car-sport" color={colors.ink} size={18} /><Text style={styles.modeActiveText}>Parking</Text></View>
        <Pressable onPress={() => navigation.navigate("My bookings")} style={styles.modeInactive}>
          <Ionicons name="bookmark-outline" color={colors.muted} size={18} /><Text style={styles.modeText}>Reservations</Text>
        </Pressable>
      </View>
      <View style={styles.modeUnderline} />

      <View style={styles.searchCard}>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={21} color={colors.ink} />
          <Field
            value={city}
            onChangeText={setCity}
            placeholder="Where do you want to park?"
            accessibilityLabel="Search parking by city"
            returnKeyType="search"
            autoCorrect={false}
            style={styles.cityField}
          />
          {city.length > 0 && (
            <Pressable onPress={() => setCity("")} hitSlop={12}>
              <Ionicons name="close-circle" size={19} color={colors.muted} />
            </Pressable>
          )}
        </View>
        <View style={styles.searchDivider} />
        <Pressable style={styles.whenButton} onPress={() => setDatePicker(true)}>
          <View style={styles.whenIcon}><Ionicons name="time-outline" color={colors.ink} size={18} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.whenLabel}>ARRIVAL</Text>
            <Text style={styles.whenValue}>{start.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>
        {datePicker && (
          <DateTimePicker
            value={start}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(_, value) => setWhen(value)}
          />
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore by area</Text>
        {city ? (
          <Pressable onPress={() => setCity("")}><Text style={styles.clearText}>Clear</Text></Pressable>
        ) : null}
      </View>
      <View style={styles.cityRow}>
        {QUICK_CITIES.map((item, index) => (
          <Pressable key={item} onPress={() => setCity(city === item ? "" : item)}
            style={[styles.cityChip, city === item && styles.cityChipSelected]}>
            <View style={[styles.cityGlyph, city === item && styles.cityGlyphSelected]}>
              <Ionicons name={["business-outline", "briefcase-outline", "leaf-outline", "sunny-outline"][index]}
                color={city === item ? "#101010" : colors.ink} size={18} />
            </View>
            <Text style={[styles.cityName, city === item && styles.cityNameSelected]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{city ? `Parking in ${city}` : "Parking spots for you"}</Text>
          <Text style={styles.sectionCaption}>
            {locations.data ? `${locations.data.length} ${locations.data.length === 1 ? "location" : "locations"}` : "Live locations"}
          </Text>
        </View>
        <Pressable style={styles.mapToggle} onPress={() => setMapVisible(!mapVisible)}>
          <Ionicons name={mapVisible ? "list-outline" : "map-outline"} size={16} color={colors.ink} />
          <Text style={styles.mapToggleText}>{mapVisible ? "List" : "Map"}</Text>
        </Pressable>
      </View>

      {mapVisible && (
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={{
          latitude: 28.6139, longitude: 77.209, latitudeDelta: 0.28, longitudeDelta: 0.28
        }}>
          {(locations.data || []).map(location => (
            <Marker key={location.id} coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
              <Callout onPress={() => choose(location)}>
                <View style={styles.callout}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text>₹{location.hourlyRate}/hour · Tap to view</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {locations.isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Finding parking nearby…</Text></View>
      ) : null}
      <ErrorText>{locations.error?.message}</ErrorText>

      <FlatList
        data={locations.data || []}
        keyExtractor={item => String(item.id)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => choose(item)} style={styles.locationCard}>
            <View style={styles.parkingIcon}><Ionicons name="car-outline" size={24} color={colors.ink} /></View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.address} numberOfLines={1}>{item.address}, {item.city}</Text>
              <View style={styles.rateTag}>
                <Ionicons name="pricetag-outline" color={colors.primary} size={13} />
                <Text style={styles.rateText}>₹{item.hourlyRate} <Text style={styles.rateUnit}>/ hour</Text></Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.muted} />
          </Pressable>
        )}
      />
      {!locations.isLoading && !locations.error && locations.data?.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Ionicons name="car-outline" size={25} color={colors.ink} /></View>
          <Text style={styles.emptyTitle}>No spots in this area yet</Text>
          <Text style={styles.emptyText}>Try another Delhi NCR city, or check back as more parking locations are added.</Text>
          <Pressable onPress={() => setCity("")}><Text style={styles.clearText}>Show all locations</Text></Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 8 },
  topBar: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  area: { flexDirection: "row", alignItems: "center", gap: 10 },
  areaPin: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: colors.muted, fontWeight: "700", fontSize: 9, letterSpacing: 1.2 },
  areaTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", marginTop: 2 },
  inboxButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingLeft: 10 },
  inboxText: { color: colors.ink, fontWeight: "600", fontSize: 12 },
  modeTabs: { flexDirection: "row", alignItems: "center", gap: 26, paddingTop: 8 },
  modeActive: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  modeActiveText: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  modeInactive: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  modeText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  modeUnderline: { width: 86, height: 3, borderRadius: 2, backgroundColor: colors.ink, marginTop: -17, marginBottom: 2 },
  searchCard: { backgroundColor: "#202020", borderWidth: 1, borderColor: "#292929", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 7 },
  searchInputRow: { minHeight: 53, flexDirection: "row", alignItems: "center", gap: 11 },
  cityField: { flex: 1, minHeight: 48, paddingHorizontal: 0, borderWidth: 0, backgroundColor: "transparent", fontSize: 15 },
  searchDivider: { height: 1, backgroundColor: colors.border, marginLeft: 32 },
  whenButton: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10 },
  whenIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#303030", alignItems: "center", justifyContent: "center" },
  whenLabel: { color: colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  whenValue: { color: colors.ink, fontSize: 13, fontWeight: "600", marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  sectionCaption: { color: colors.muted, fontSize: 12, marginTop: 3 },
  clearText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  cityRow: { flexDirection: "row", justifyContent: "space-between", gap: 7 },
  cityChip: { flex: 1, alignItems: "center", gap: 7, paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: "transparent" },
  cityChipSelected: { borderColor: colors.primary, backgroundColor: "#1b2113" },
  cityGlyph: { width: 52, height: 52, borderRadius: 28, backgroundColor: "#202020", alignItems: "center", justifyContent: "center" },
  cityGlyphSelected: { backgroundColor: colors.primary },
  cityName: { color: colors.ink, fontSize: 11, fontWeight: "600" },
  cityNameSelected: { color: colors.primary },
  mapToggle: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 16, backgroundColor: "#202020", paddingHorizontal: 11, paddingVertical: 8 },
  mapToggleText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  map: { height: 220, borderRadius: 16 },
  locationCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 17, backgroundColor: "#191919", borderWidth: 1, borderColor: "#292929", padding: 13 },
  parkingIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#292929", alignItems: "center", justifyContent: "center" },
  locationInfo: { flex: 1, gap: 4 },
  locationName: { color: colors.ink, fontWeight: "800", fontSize: 14 },
  address: { color: colors.muted, fontSize: 11 },
  rateTag: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  rateText: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  rateUnit: { color: colors.muted, fontWeight: "500" },
  callout: { gap: 4, padding: 4, minWidth: 170 },
  loading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  loadingText: { color: colors.muted, fontSize: 13 },
  emptyCard: { alignItems: "center", padding: 23, gap: 9, borderRadius: 18, backgroundColor: "#191919", borderWidth: 1, borderColor: "#292929" },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#292929", alignItems: "center", justifyContent: "center", marginBottom: 3 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center" }
});
