import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import { globalStyles } from "../styles/globalStyles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money</Text>
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={globalStyles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 40, textAlign: "center" },
  button: { backgroundColor: "#00702f", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", color: "#3498db" },
});