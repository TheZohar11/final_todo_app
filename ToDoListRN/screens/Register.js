import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || "Registration failed");
        return;
      }
      
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      navigation.navigate("Home", { userData: data });
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <MyInput placeholder={"email"} value={email} onChangeText={setEmail} />
      <MyInput
        placeholder={"password"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <MyInput
        placeholder={"confirm password"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />
      <MyButton title={"Register"} onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a3ccff",
    alignItems: "center",
    justifyContent: "center",
    //paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default Register;
