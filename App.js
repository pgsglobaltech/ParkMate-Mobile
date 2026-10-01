import React, { useMemo, useState } from "react";
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
import ServicesScreen from "./src/screens/ServicesScreen";
import SlotsScreen from "./src/screens/SlotsScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import AccountScreen from "./src/screens/AccountScreen";
import AccountDetailsScreen from "./src/screens/AccountDetailsScreen";
import { colors } from "./src/theme";
import { AuthContext, useAuth } from "./src/state/AuthContext";

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});

function MainTabs() {
  return (
    <Tabs.Navigator initialRouteName="Home" screenOptions={{
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
      <Tabs.Screen name="Home" component={ExploreScreen} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
      }} />
      <Tabs.Screen name="Services" component={ServicesScreen} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} color={color} size={size} />
      }} />
      <Tabs.Screen name="Activity" component={BookingsScreen} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "receipt" : "receipt-outline"} color={color} size={size} />
      }} />
      <Tabs.Screen name="Account" component={AccountNavigator} options={{
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
      }} />
    </Tabs.Navigator>
  );
}

function AccountNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="Account overview" component={AccountScreen} />
      <AccountStack.Screen name="Account details" component={AccountDetailsScreen} />
    </AccountStack.Navigator>
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
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  React.useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync("parkmate.token"),
      SecureStore.getItemAsync("parkmate.fullName"),
      SecureStore.getItemAsync("parkmate.email")
    ])
      .then(([savedToken, fullName, email]) => {
        setToken(savedToken);
        if (fullName || email) setUser({ fullName, email });
      })
      .finally(() => setReady(true));
  }, []);
  const auth = useMemo(() => ({
    token,
    user,
    ready,
    async signIn(value, profile = {}) {
      await Promise.all([
        SecureStore.setItemAsync("parkmate.token", value),
        SecureStore.setItemAsync("parkmate.fullName", profile.fullName || ""),
        SecureStore.setItemAsync("parkmate.email", profile.email || "")
      ]);
      setUser({ fullName: profile.fullName || "", email: profile.email || "" });
      setToken(value);
    },
    async signOut() {
      await Promise.all([
        SecureStore.deleteItemAsync("parkmate.token"),
        SecureStore.deleteItemAsync("parkmate.fullName"),
        SecureStore.deleteItemAsync("parkmate.email")
      ]);
      queryClient.clear();
      setUser(null);
      setToken(null);
    }
  }), [token, user, ready]);

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
