import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import TaskItem from "../../components/TaskItem/TaskItem";
import "./Home.css";

export default function Home() {
  const [listi, setList] = useState([]);
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    async function getTasks() {
      try {
        const response = await fetch("http://localhost:5000/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error);
          return;
        }
        setList(data);
      } catch (e) {
        setError("could not reach the server");
      }
    }
    getTasks();
  }, []);

  async function handleOnClick() {
    try {
      if (!task.trim()) return;
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ description: task }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setList([
        ...listi,
        { _id: data.taskId, description: task, completed: false },
      ]);
      setTask("");
    } catch (e) {
      setError("could not reach the server");
    }
  }
  async function handleDelete(taskId) {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setList(listi.filter((t) => t._id !== taskId));
    } catch (e) {
      setError("could not reach server");
    }
  }
  return (
    <div className="container">
      <p>Home is whenever Im with you</p>
      <div className="input-area">
        <Input
          placeholder="enter a to do.."
          onChange={(e) => setTask(e.target.value)}
          value={task}
        />
        <Button text="add" onClick={handleOnClick} />
      </div>
      <ul className="list">
        {listi.map((task) => (
          <TaskItem
            key={task._id}
            task={task.description}
            onDelete={() => handleDelete(task._id)}
          />
        ))}
      </ul>
      {error && <p>{error}</p>}
    </div>
  );
}
