import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
// <ion-icon name="checkmark-done-outline"></ion-icon>
//<ion-icon name="alarm-outline"></ion-icon>
//<ion-icon name="backspace-outline"></ion-icon>

function MyTask({ description, completed, id, onTaskUpdate, setIsUpdating, token }) {
  // Ensure completed is always a proper boolean
  const isCompleted = Boolean(completed === true || completed === "true" || completed === 1);
  
  async function handleCompleteTask() {
    try {
      setIsUpdating(true);
      const newCompleted = !isCompleted;
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // Send token in Authorization header
        },
        body: JSON.stringify({ completed: newCompleted }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        await onTaskUpdate();
      } else {
        alert("Failed to update task completion status.");
      }
    } catch (error) {
      alert("Error completing task:", error);
    } finally {
      setIsUpdating(false);
    }
  }
  function handleDeleteTask() {
    console.log("delete task");
  }
  return (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{description}</Text>
      <TouchableOpacity onPress={handleCompleteTask}>
        <Ionicons
          name={isCompleted ? "checkmark-done-outline" : "alarm-outline"}
          size={24}
          color={isCompleted ? "#0affa0" : "#ffe7ac"}
          style={styles.taskIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDeleteTask}>
        <Ionicons
          name="backspace-outline"
          size={24}
          color="#fff"
          style={styles.taskIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a3ccff",
  },
  taskText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 30,
  },
  taskIcon: {
    marginRight: 10,
  },
});

export default MyTask;
