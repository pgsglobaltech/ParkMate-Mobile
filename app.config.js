export default {
  expo: {
    name: "ParkMate",
    slug: "parkmate",
    scheme: "parkmate",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      package: "com.parkmate.mobile",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    plugins: [
      "expo-font",
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.parkmate"
        }
      ]
    ]
  }
};
