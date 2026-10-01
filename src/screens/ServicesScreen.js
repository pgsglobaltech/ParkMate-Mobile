import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Screen from "../components/Screen";
import { ErrorText } from "../components/UI";
import VehicleIllustration from "../components/VehicleIllustration";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

const VEHICLE_SERVICES = [
  {
    type: "CAR",
    title: "Car parking",
    description: "Secure parking spaces for your car.",
  },
  {
    type: "RICKSHAW",
    title: "Rickshaw parking",
    description: "Convenient spots for auto-rickshaws.",
  },
  {
    type: "BIKE",
    title: "Bike parking",
    description: "Quick and safe spaces for two-wheelers.",
  }
];

export default function ServicesScreen({ navigation }) {
  const { token } = useAuth();
  const locationsByVehicle = useQuery({
    queryKey: ["service-locations-by-vehicle"],
    queryFn: async () => {
      const entries = await Promise.all(VEHICLE_SERVICES.map(async service => [
        service.type,
        await api(`/locations?vehicleType=${service.type}`, { token })
      ]));
      return Object.fromEntries(entries);
    }
  });

  function browseVehicle(type) {
    navigation.navigate("Home", { vehicleType: type });
  }

  return (
    <Screen style={styles.page}>
      <Text style={styles.eyebrow}>PARKMATE SERVICES</Text>
      <Text style={styles.title}>Services</Text>
      <Text style={styles.subtitle}>What are you parking today?</Text>

      <ErrorText>{locationsByVehicle.error?.message}</ErrorText>

      <View style={styles.grid}>
        {VEHICLE_SERVICES.map((service, index) => {
          const locations = locationsByVehicle.data?.[service.type];
          const countText = locationsByVehicle.isLoading
            ? "Finding parking…"
            : `${locations?.length || 0} ${locations?.length === 1 ? "location" : "locations"}`;

          return (
            <Pressable
              key={service.type}
              accessibilityRole="button"
              accessibilityLabel={`Find ${service.title.toLowerCase()}`}
              onPress={() => browseVehicle(service.type)}
              style={[
                styles.tile,
                index === 0 ? styles.carTile : styles.compactTile,
                service.type === "CAR" ? styles.carAccent : service.type === "RICKSHAW" ? styles.rickshawAccent : styles.bikeAccent
              ]}
            >
              <View style={styles.tileTop}>
                <View style={styles.iconWrap}>
                  <VehicleIllustration
                    type={service.type}
                    width={index === 0 ? 84 : 63}
                    height={index === 0 ? 53 : 44}
                  />
                </View>
                <Ionicons name="arrow-up-outline" size={18} color={colors.muted} style={styles.arrow} />
              </View>
              <View style={styles.tileCopy}>
                <Text style={[styles.serviceTitle, index === 0 && styles.carTitle]}>{service.title}</Text>
                <Text style={styles.description}>{service.description}</Text>
                <View style={styles.availability}>
                  {locationsByVehicle.isLoading
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <View style={styles.liveDot} />}
                  <Text style={styles.availabilityText}>{countText}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={17} color={colors.muted} />
        <Text style={styles.noteText}>Available locations and spaces depend on your selected vehicle type.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 23 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "900", marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: -9, marginBottom: 5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  tile: { position: "relative", overflow: "hidden", borderRadius: 20, padding: 16, backgroundColor: "#202020", borderWidth: 1, borderColor: "#303030", justifyContent: "space-between" },
  carTile: { width: "100%", minHeight: 176, padding: 18 },
  compactTile: { width: "48.2%", minHeight: 176 },
  carAccent: { backgroundColor: "#22271c", borderColor: "#343d27" },
  rickshawAccent: { backgroundColor: "#211e1a", borderColor: "#38312a" },
  bikeAccent: { backgroundColor: "#1a2022", borderColor: "#2a3639" },
  tileTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  iconWrap: { height: 58, alignItems: "flex-start", justifyContent: "center" },
  arrow: { transform: [{ rotate: "45deg" }] },
  tileCopy: { gap: 5, zIndex: 1 },
  serviceTitle: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  carTitle: { fontSize: 18 },
  description: { color: colors.muted, fontSize: 10, lineHeight: 15, maxWidth: "96%" },
  availability: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  availabilityText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  note: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 4, paddingHorizontal: 3 },
  noteText: { color: colors.muted, fontSize: 11, lineHeight: 16, flex: 1 }
});
