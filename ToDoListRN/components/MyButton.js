import { Button, StyleSheet, View } from "react-native";

function MyButton({ title, onPress, maxwidth, padding }) {
  return (
    <View
      style={[
        styles.buttonContainer,
        { maxWidth: maxwidth || 300 },
        { padding: padding || 10 },
      ]}
    >
      <Button title={title} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "#eeeef2",
    borderRadius: 10,
    margin: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    elevation: 5,
  },
});

export default MyButton;
