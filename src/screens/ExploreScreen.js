import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import DraggableSheet from "../components/DraggableSheet";
import { ErrorText, Field } from "../components/UI";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

const QUICK_CITIES = ["All areas", "Delhi", "Gurugram", "Noida", "Faridabad"];
const NCR_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.29,
  longitudeDelta: 0.29
};
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#202124" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#b9bdc5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#202124" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#42464d" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#282a2e" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#9298a1" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#373a40" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#25272b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#aeb4bd" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#303239" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#111820" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#738091" }] }
];

export default function ExploreScreen({ navigation, route }) {
  const { token } = useAuth();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const selectedIndex = useRef(0);
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState(route.params?.vehicleType || "");
  const [selectedId, setSelectedId] = useState(null);
  const [datePicker, setDatePicker] = useState(false);
  const [start, setStart] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const locations = useQuery({
    queryKey: ["locations", city, vehicleType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (vehicleType) params.set("vehicleType", vehicleType);
      const query = params.toString();
      return api(`/locations${query ? `?${query}` : ""}`, { token });
    }
  });

  const results = locations.data || [];
  const activeLocation = results.find(item => item.id === selectedId) || results[0] || null;
  const cardWidth = Math.max(260, windowWidth - 68);
  const sheetHeight = Math.min(windowHeight * 0.78, windowHeight - insets.top - 78);
  const collapsedHeight = Math.min(windowHeight * 0.39, sheetHeight - 90);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  useEffect(() => {
    if (route.params?.vehicleType && route.params.vehicleType !== vehicleType) {
      setVehicleType(route.params.vehicleType);
      setSelectedId(null);
      selectedIndex.current = 0;
    }
  }, [route.params?.vehicleType]);

  useEffect(() => {
    if (results.length === 1 && results[0].id !== selectedId) setSelectedId(results[0].id);
    if (selectedId && !results.some(item => item.id === selectedId)) setSelectedId(null);
    if (results.length > 1) {
      const coordinates = results.map(item => ({ latitude: item.latitude, longitude: item.longitude }));
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 170, right: 45, bottom: 330, left: 45 },
        animated: true
      });
    }
  }, [results, city, vehicleType]);

  const vehicleLabel = vehicleType === "RICKSHAW"
    ? "Rickshaw"
    : vehicleType === "BIKE" ? "Bike" : vehicleType === "CAR" ? "Car" : "";
  function chooseLocation(location) {
    setSelectedId(location.id);
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.028,
      longitudeDelta: 0.028
    }, 420);
  }

  function openSlots(location) {
    if (!location) return;
    navigation.navigate("Choose a slot", {
      location,
      vehicleType,
      start: start.toISOString(),
      end: end.toISOString()
    });
  }

  function handleCarouselScroll(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 12));
    if (index >= 0 && index < results.length && index !== selectedIndex.current) {
      selectedIndex.current = index;
      chooseLocation(results[index]);
    }
  }

  function setArrival(value) {
    if (value) setStart(value);
    setDatePicker(false);
  }

  async function setCityFilter(value) {
    await Haptics.selectionAsync();
    const nextCity = value === "All areas" ? "" : value;
    selectedIndex.current = 0;
    setSelectedId(null);
    setCity(nextCity);
  }

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={NCR_REGION}
        showsCompass={false}
        showsIndoors
        toolbarEnabled={false}
      >
        {results.map(location => {
          const selected = activeLocation?.id === location.id;
          return (
            <Marker
              key={location.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              onPress={() => {
                chooseLocation(location);
                setSheetExpanded(true);
                Haptics.selectionAsync();
              }}
              tracksViewChanges={false}
              zIndex={selected ? 2 : 1}
            >
              <View style={[styles.priceMarker, selected && styles.priceMarkerSelected]}>
                <Text style={[styles.markerPrice, selected && styles.markerPriceSelected]}>
                  ₹{Number(location.hourlyRate).toLocaleString("en-IN")}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.safeOverlay}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}><Ionicons name="car-sport" size={19} color="#101010" /></View>
            <View>
              <Text style={styles.brandName}>ParkMate</Text>
              <Text style={styles.brandSub}>{vehicleLabel ? `${vehicleLabel.toUpperCase()} PARKING · NCR` : "PARKING AROUND NCR"}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open activity"
            onPress={() => navigation.navigate("Activity")}
            style={styles.headerAction}
          >
            <Ionicons name="receipt-outline" size={19} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.searchCard}>
          <Ionicons name="search" size={20} color={colors.ink} />
          <Field
            value={city}
            onChangeText={setCity}
            placeholder={vehicleLabel ? `Find ${vehicleLabel.toLowerCase()} parking` : "Where do you want to park?"}
            accessibilityLabel="Search parking by city"
            returnKeyType="search"
            autoCorrect={false}
            style={styles.cityField}
          />
          {city.length > 0 && (
            <Pressable onPress={() => setCityFilter("All areas")} hitSlop={10}>
              <Ionicons name="close-circle" size={19} color={colors.muted} />
            </Pressable>
          )}
          <View style={styles.searchDivider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change arrival time, currently ${start.toLocaleString()}`}
            onPress={() => setDatePicker(true)}
            style={styles.arrivalButton}
          >
            <Ionicons name="time-outline" size={18} color={colors.ink} />
            <View>
              <Text style={styles.arrivalLabel}>ARRIVE</Text>
              <Text style={styles.arrivalValue}>{start.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}</Text>
            </View>
          </Pressable>
        </View>
        {datePicker && (
          <DateTimePicker value={start} mode="datetime" minimumDate={new Date()} onChange={(_, value) => setArrival(value)} />
        )}
      </SafeAreaView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show all Delhi NCR parking locations on the map"
        onPress={() => {
          setCityFilter("All areas");
          mapRef.current?.animateToRegion(NCR_REGION, 450);
        }}
        style={[styles.recenterButton, { top: insets.top + 160 }]}
      >
        <Ionicons name="scan-outline" size={21} color={colors.ink} />
      </Pressable>

      <DraggableSheet
        height={sheetHeight}
        collapsedHeight={collapsedHeight}
        onExpandedChange={setSheetExpanded}
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeading}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{city ? `Parking in ${city}` : "Find your parking"}</Text>
              <Text style={styles.sheetSubtitle}>
                {locations.isLoading
                  ? "Searching locations…"
                  : `${results.length} ${results.length === 1 ? "location" : "locations"} · 2 hour session`}
              </Text>
            </View>
            {locations.isLoading ? <ActivityIndicator color={colors.primary} /> : (
              <View style={styles.countPill}>
                <View style={styles.liveDot} />
                <Text style={styles.countText}>LIVE</Text>
              </View>
            )}
          </View>

          <FlatList
            horizontal
            data={QUICK_CITIES}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityFilters}
            renderItem={({ item }) => {
              const active = item === "All areas" ? !city : city === item;
              return (
                <Pressable
                  onPress={() => setCityFilter(item)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              );
            }}
          />

          {locations.error ? <ErrorText>{locations.error.message}</ErrorText> : null}
          {!locations.isLoading && !locations.error && results.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" color={colors.ink} size={26} />
              <Text style={styles.emptyTitle}>No {vehicleLabel ? `${vehicleLabel.toLowerCase()} ` : ""}parking found here</Text>
              <Text style={styles.emptyText}>Try another area or choose All areas to browse Delhi NCR.</Text>
              <Pressable onPress={() => setCityFilter("All areas")}><Text style={styles.emptyAction}>Browse all locations</Text></Pressable>
            </View>
          ) : null}

          {results.length > 0 && (
            <FlatList
              ref={carouselRef}
              horizontal
              pagingEnabled={false}
              snapToInterval={cardWidth + 12}
              decelerationRate="fast"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              data={results}
              keyExtractor={item => String(item.id)}
              onMomentumScrollEnd={handleCarouselScroll}
              contentContainerStyle={styles.carousel}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => chooseLocation(item)}
                  style={[styles.locationCard, { width: cardWidth }, activeLocation?.id === item.id && styles.locationCardActive]}
                >
                  <View style={styles.locationTop}>
                    <View style={styles.parkingIcon}><Ionicons name="car-outline" size={23} color={colors.ink} /></View>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.address} numberOfLines={1}>{item.address}, {item.city}</Text>
                    </View>
                    <View style={styles.priceBlock}>
                      <Text style={styles.price}>₹{Number(item.hourlyRate).toLocaleString("en-IN")}</Text>
                      <Text style={styles.perHour}>per hour</Text>
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Choose a slot at ${item.name}`}
                    onPress={() => openSlots(item)}
                    style={styles.chooseButton}
                  >
                    <Text style={styles.chooseText}>View available spaces</Text>
                    <Ionicons name="arrow-forward" size={17} color="#101010" />
                  </Pressable>
                </Pressable>
              )}
            />
          )}
          <Text style={styles.gestureHint}>
            <Ionicons name="swap-horizontal-outline" size={13} color={colors.muted} /> Swipe cards to explore · {sheetExpanded ? "Drag down to see the map" : "Drag the handle to expand"}
          </Text>
        </View>
      </DraggableSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeOverlay: { paddingHorizontal: 18, paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: { height: 38, width: 38, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandName: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  brandSub: { color: colors.muted, fontSize: 8, letterSpacing: 1.1, marginTop: 2, fontWeight: "700" },
  headerAction: { height: 40, width: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#202020", borderWidth: 1, borderColor: "#353535" },
  searchCard: { flexDirection: "row", alignItems: "center", minHeight: 61, borderRadius: 18, paddingHorizontal: 15, backgroundColor: "#181818", borderWidth: 1, borderColor: "#333333", gap: 10 },
  cityField: { flex: 1, minHeight: 48, paddingHorizontal: 0, borderWidth: 0, backgroundColor: "transparent", fontSize: 14 },
  searchDivider: { height: 32, width: 1, backgroundColor: colors.border },
  arrivalButton: { flexDirection: "row", alignItems: "center", gap: 7, paddingLeft: 1 },
  arrivalLabel: { color: colors.muted, fontWeight: "800", fontSize: 8, letterSpacing: 0.8 },
  arrivalValue: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 2 },
  recenterButton: { position: "absolute", right: 18, height: 44, width: 44, borderRadius: 22, backgroundColor: "#181818", borderWidth: 1, borderColor: "#383838", alignItems: "center", justifyContent: "center" },
  priceMarker: { borderRadius: 16, backgroundColor: "#202020", paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "#383838", elevation: 4 },
  priceMarkerSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  markerPrice: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  markerPriceSelected: { color: "#101010" },
  sheetContent: { flex: 1, paddingBottom: 8 },
  sheetHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 13 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  sheetSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  countPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, backgroundColor: "#20251a" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  countText: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  cityFilters: { gap: 8, paddingHorizontal: 20, paddingBottom: 15 },
  filterChip: { borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8, borderWidth: 1, borderColor: "#343434", backgroundColor: "#191919" },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#101010" },
  carousel: { paddingHorizontal: 20, gap: 12 },
  locationCard: { borderRadius: 18, padding: 13, backgroundColor: "#1b1b1b", borderWidth: 1, borderColor: "#303030" },
  locationCardActive: { borderColor: "#536e2c" },
  locationTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  parkingIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: "#2b2b2b", alignItems: "center", justifyContent: "center" },
  locationInfo: { flex: 1, gap: 4 },
  locationName: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  address: { color: colors.muted, fontSize: 10 },
  priceBlock: { alignItems: "flex-end" },
  price: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  perHour: { color: colors.muted, fontSize: 9, marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: "#303030", marginVertical: 11 },
  chooseButton: { minHeight: 43, borderRadius: 13, backgroundColor: colors.primary, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chooseText: { color: "#101010", fontSize: 12, fontWeight: "900" },
  gestureHint: { color: colors.muted, fontSize: 10, textAlign: "center", paddingTop: 10 },
  emptyState: { marginHorizontal: 20, padding: 18, borderRadius: 16, backgroundColor: "#1b1b1b", alignItems: "center", gap: 8 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 11, textAlign: "center", lineHeight: 16 },
  emptyAction: { color: colors.primary, fontSize: 12, fontWeight: "800", padding: 5 }
});
