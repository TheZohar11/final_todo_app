import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";

function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <MyInput placeholder={"email"} />
      <MyInput placeholder={"password"} />
      <MyInput placeholder={"confirm password"} />
      <MyButton title={"Register"} onPress={() => {}} />
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
