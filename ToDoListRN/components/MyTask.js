import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

function MyTask({ description, completed, onPress }) {
  return (
    <View style={styles.taskContainer}>
      <Text>{description}</Text>
      {/*
      <TouchableOpacity onPress={onPress}>
        <Ionicons name="checkmark-circle" size={24} color="#a3ccff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPress}>
        <Ionicons name="close-circle" size={24} color="#a3ccff" />
      </TouchableOpacity>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a3ccff",
  },
});

export default MyTask;
