import { getTasks } from "./getTasks";
import { API_URL } from "../config";

export async function handleAddTask(
  newTask,
  setNewTask,
  setTasks,
  setLoading,
  userData,
) {
  console.log("add task");
  try {
    const token = userData?.token;
    if (!token) {
      alert("No token available");
      return;
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description: newTask, completed: false }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    setNewTask("");
    // Reload tasks from server to get the complete task object with _id
    await getTasks(userData, setTasks, setLoading);
  } catch (error) {
    console.error("add task error ", error);
    alert("error adding task");
  }
}
