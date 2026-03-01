export async function getTasks(userData, setTasks, setLoading) {
  try {
    const token = userData?.token;
    if (!token) {
      alert("No token available");
      return;
    }
    const response = await fetch(`http://10.0.2.2:5000/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setTasks(data);
    setLoading(false);
  } catch (error) {
    console.error("get tasks error ", error);
    alert("error getting tasks");
    setLoading(false);
  }
}
