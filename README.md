# ParkMate Mobile

Cross-platform parking app built with Expo and React Native. It connects to the ParkMate REST API for account access, parking discovery, vehicle-specific availability, bookings, and payments.

## Features

- Home screen with map-based parking discovery and location results
- Services for **Car**, **Rickshaw**, and **Bike** parking
- Vehicle selection filters locations and available spaces through the API
- Slot selection, time-range booking, and booking confirmation
- Activity screen for booking history and cancellation of upcoming bookings
- Account dashboard and profile, security, and privacy sections
- JWT-based sign-in with the session token stored using Expo SecureStore
- Stripe React Native payment integration

## Requirements

- Node.js 20+
- npm
- Expo-compatible Android or iOS development environment
- A running ParkMate API (see the [backend repository](https://github.com/pgsglobaltech/ParkMate))
- Google Maps API keys for native map builds

Building or running the iOS native app requires macOS with Xcode. Android native builds require Android Studio and the Android SDK.

## Install and configure

From this directory:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_API_HOST:8080/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

Use the API host that is reachable from the device:

| Client | Example API URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080/api/v1` |
| iOS simulator | `http://localhost:8080/api/v1` |
| Physical phone | `http://YOUR_COMPUTER_LAN_IP:8080/api/v1` |

For a physical phone, the phone and computer must be on the same network. Use the computer's LAN IPv4 address (on Windows, run `ipconfig`), allow inbound TCP port `8080` through the computer firewall, and ensure the API is listening on the network interface. `localhost` and `10.0.2.2` do not refer to your development computer from a physical phone.

Before opening the app on a phone, test the API from its browser:

```text
http://YOUR_COMPUTER_LAN_IP:8080/api/v1/health
```

It should return `{"status":"UP"}`. If the phone cannot open this URL, troubleshoot the API, Wi-Fi, and firewall connection before changing app settings. Native phone requests are not subject to browser CORS.

## Start the app

Start the Expo development server:

```powershell
npx expo start
```

Launch the app in an available simulator or scan the QR code with Expo Go where the app's native dependencies are supported.

This app uses native integrations including Stripe. To build and run with the native development client:

```powershell
npx expo run:android
npx expo run:ios
```

The iOS command requires macOS and Xcode. For development builds, configure the Google Maps key for the Android and iOS native apps; the Expo config reads it from `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Checks and Android export

Type-check the project:

```powershell
npm run typecheck
```

Check Expo configuration and dependencies:

```powershell
npx expo-doctor
```

Export a production JavaScript bundle for Android:

```powershell
npx expo export --platform android
```

## Parking and booking flow

The bottom navigation has Home, Services, Activity, and Account. Services lists parking by vehicle category. Choosing a category applies `vehicleType=CAR`, `vehicleType=RICKSHAW`, or `vehicleType=BIKE` to location and availability requests. Bookings require an authenticated account and a valid future time range. Payment processing requires a configured API-side Stripe secret and mobile publishable key; configure a Stripe webhook on the backend to receive verified payment status events.

## Security and configuration notes

- Keep `.env` local; never commit API keys or other credentials.
- Values prefixed with `EXPO_PUBLIC_` are included in the client bundle and are not secrets. Never put a server-side Stripe secret or JWT signing secret in this file.
- The mobile Stripe publishable key may be shared with the client; the backend Stripe secret and webhook signing secret must only be configured on the server.
- Configure Google Maps API-key restrictions for the intended Android and iOS applications.
