import React from "react";
import { View, StyleSheet } from "react-native";
import MyButton from "../components/MyButton";

function Landing({ navigation }) {
  function handleLogin() {
    navigation.navigate("Login");
  }
  function handleRegister() {
    navigation.navigate("Register");
  }
  return (
    <View style={styles.container}>
      <MyButton title={"Login"} onPress={handleLogin} />
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
  },
  buttonContainer: {
    backgroundColor: "#eeeef2",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    elevation: 5,
  },
});

export default Landing;
