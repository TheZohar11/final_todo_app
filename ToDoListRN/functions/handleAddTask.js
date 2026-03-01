export function handleAddTask(newTask, setNewTask, setTasks, tasks) {
  console.log("add task");
  try {
    const newTaskObject = { description: newTask, completed: Boolean(false) };
    setNewTask("");
    setTasks([...tasks, newTaskObject]);
  } catch (error) {
    console.error("add task error ", error);
    alert("error adding task");
  }
}
