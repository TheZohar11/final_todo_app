import React from "react";
import { StyleSheet, TextInput } from "react-native";

function MyInput({
  placeholder,
  keyboardType,
  autoCapitalize,
  value,
  onChangeText,
  secureTextEntry,
  maxwidth,
}) {
  return (
    <TextInput
      placeholder={placeholder}
      style={[styles.input, { maxWidth: maxwidth || 300 }]}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={Boolean(secureTextEntry)}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 10,
    width: "80%",
    maxWidth: 300,
  },
});

export default MyInput;
