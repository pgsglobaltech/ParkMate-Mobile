import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import { Button, ErrorText, Field, Heading } from "../components/UI";
import { api } from "../api/client";
import { useAuth } from "../../App";
import { colors } from "../theme";

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [register, setRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const result = await api(`/auth/${register ? "signup" : "login"}`, {
        method: "POST",
        body: { ...(register ? { fullName: fullName.trim() } : {}), email: email.trim(), password }
      });
      await signIn(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.brand}><Text style={styles.mark}>P</Text><Text style={styles.brandName}>ParkMate</Text></View>
      <Heading subtitle="Find a space. Book ahead. Park with confidence.">
        {register ? "Create your account" : "Welcome back"}
      </Heading>
      {register && <Field value={fullName} onChangeText={setFullName} placeholder="Full name" autoCapitalize="words" />}
      <Field value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" secureTextEntry />
      <ErrorText>{error}</ErrorText>
      <Button title={register ? "Create account" : "Log in"} onPress={submit} loading={busy} />
      <Text onPress={() => { setRegister(!register); setError(""); }} style={styles.toggle}>
        {register ? "Already have an account? Log in" : "New to ParkMate? Create an account"}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  mark: { width: 42, height: 42, textAlign: "center", textAlignVertical: "center", borderRadius: 14, overflow: "hidden", backgroundColor: colors.primary, color: "#101010", fontWeight: "900", fontSize: 24 },
  brandName: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  toggle: { textAlign: "center", color: colors.primary, padding: 12, fontWeight: "700" }
});
