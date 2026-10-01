const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

export async function api(path, { token, method = "GET", body } = {}) {
  if (!API_URL || API_URL.includes("YOUR_COMPUTER_LAN_IP")) {
    throw new Error("Set EXPO_PUBLIC_API_URL in mobile/.env. For a physical phone, use your computer's LAN IP, not localhost or 10.0.2.2.");
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    throw new Error(`Cannot reach ${API_URL}. On a physical phone, use your computer's LAN IP, keep both devices on the same Wi-Fi, allow inbound TCP port 8080 through Windows Firewall, then restart Expo with npx expo start --clear.`);
  }
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload;
}
