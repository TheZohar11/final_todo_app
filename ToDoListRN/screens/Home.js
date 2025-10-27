import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import MyButton from "../components/MyButton";

function Home({ route }) {
  const { userData } = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.token) {
      getTasks();
    }
  }, [userData?.token]);

  async function getTasks() {
    try {
      const token = userData?.token;
      if (!token) {
        alert("No token available");
        return;
      }
      const response = await fetch(
        `http://localhost:5000/tasks?token=${token}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error("get tasks error ", error);
      alert("error getting tasks");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      {tasks.length === 0 ? (
        <Text>No tasks found</Text>
      ) : (
        <>
          <FlatList
            data={tasks}
            renderItem={(itemData) => {
              const taskTitle = String(
                itemData.item.description || "Untitled Task"
              );
              return (
                <MyButton
                  title={taskTitle}
                  onPress={() =>
                    console.log("Task pressed:", itemData.item._id)
                  }
                />
              );
            }}
            keyExtractor={(item, index) => {
              return item._id || index.toString();
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a3ccff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default Home;
