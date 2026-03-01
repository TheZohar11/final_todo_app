import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import MyTask from "../components/MyTask";
import { Ionicons } from "@expo/vector-icons";
import { getTasks } from "../functions/getTasks";
import { handleAddTask } from "../functions/handleAddTask";
//<ion-icon name="cafe-outline"></ion-icon>

function Home({ route }) {
  const { userData } = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userData?.token) {
      getTasks(userData, setTasks, setLoading);
    }
  }, [userData?.token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My To Do List</Text>
        <View style={styles.inputContainer}>
          <MyInput
            placeholder={"Add a new task"}
            value={newTask}
            onChangeText={setNewTask}
            maxwidth={200}
          />
          <MyButton
            title={"Add"}
            onPress={() => handleAddTask(newTask, setNewTask, setTasks, tasks)}
            maxwidth={100}
            padding={4}
          />
        </View>

        {tasks.length === 0 ? (
          <View style={styles.noTasksContainer}>
            <Ionicons name="cafe-outline" size={24} color="#aaaaaa" />
            <Text style={styles.noTasksText}>No tasks found</Text>
          </View>
        ) : (
          <>
            {isUpdating && <ActivityIndicator size="small" color="#0000ff" />}
            <FlatList
              data={tasks}
              renderItem={(itemData) => {
                const taskTitle = String(
                  itemData.item.description || "Untitled Task",
                );
                // Ensure completed is always a boolean, not a string
                const isCompleted = Boolean(
                  itemData.item.completed === true ||
                  itemData.item.completed === "true" ||
                  itemData.item.completed === 1,
                );
                return (
                  <MyTask
                    description={taskTitle}
                    completed={isCompleted}
                    id={itemData.item._id}
                    onTaskUpdate={() =>
                      getTasks(userData, setTasks, setLoading)
                    }
                    setIsUpdating={setIsUpdating}
                    token={userData?.token}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#a3ccff",
  },
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
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginRight: 80,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#aaaaaa",
  },
});

export default Home;
