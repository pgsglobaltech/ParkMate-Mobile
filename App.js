import React, { createContext, useContext, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import AuthScreen from "./src/screens/AuthScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import SlotsScreen from "./src/screens/SlotsScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import { colors } from "./src/theme";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.ink,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: {
        backgroundColor: "#111111",
        borderTopColor: "#262626",
        height: 66,
        paddingTop: 8,
        paddingBottom: 8
      },
      tabBarLabelStyle: { fontWeight: "700", fontSize: 11 }
    }}>
      <Tabs.Screen name="Explore" component={ExploreScreen} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
      }} />
      <Tabs.Screen name="My bookings" component={BookingsScreen} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "receipt" : "receipt-outline"} color={color} size={size} />
      }} />
    </Tabs.Navigator>
  );
}

function AppNavigation() {
  const { token, ready } = useAuth();
  if (!ready) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={colors.primary} /></View>;
  if (!token) return <AuthScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ParkMate" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Choose a slot" component={SlotsScreen} options={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background }
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);
  React.useEffect(() => {
    SecureStore.getItemAsync("parkmate.token").then(setToken).finally(() => setReady(true));
  }, []);
  const auth = useMemo(() => ({
    token,
    ready,
    async signIn(value) {
      await SecureStore.setItemAsync("parkmate.token", value);
      setToken(value);
    },
    async signOut() {
      await SecureStore.deleteItemAsync("parkmate.token");
      queryClient.clear();
      setToken(null);
    }
  }), [token, ready]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""} urlScheme="parkmate">
          <StatusBar style="light" />
          <AppNavigation />
        </StripeProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
