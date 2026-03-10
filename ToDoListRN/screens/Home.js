import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import MyTask from "../components/MyTask";
import { Ionicons } from "@expo/vector-icons";
import { getTasks } from "../functions/getTasks";
import { handleAddTask } from "../functions/handleAddTask";
import { loadUserData } from "../functions/loadUserData";
//<ion-icon name="cafe-outline"></ion-icon>

function Home({ route, navigation }) {
  const [userData, setUserData] = useState(route.params?.userData || null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      if (!userData) {
        const data = await loadUserData();
        if (data) setUserData(data);
      }
    })();
  }, []);

  useEffect(() => {
    if (userData?.token) {
      getTasks(userData, setTasks, setLoading);
    }
  }, [userData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
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
            onPress={() =>
              handleAddTask(newTask, setNewTask, setTasks, setLoading, userData)
            }
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
      <View style={{ width: "100%", alignItems: "center" }}>
        <MyButton
          style={styles.logoutButton}
          title={"Logout"}
          onPress={async () => {
            await AsyncStorage.removeItem("userData");
            navigation.reset({
              index: 0,
              routes: [{ name: "Landing" }],
            });
          }}
          maxwidth={100}
          padding={4}
        />
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
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#000",
  },
});

export default Home;
