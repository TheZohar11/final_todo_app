import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import TaskItem from "../../components/TaskItem/TaskItem";
import { API_URL } from "../../config";
import refreshAccessToken from "../../functions/refreshAccessToken";
import "./Home.css";

export default function Home() {
  const [listi, setList] = useState([]);
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function authFetch(url, options = {}) {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      localStorage.removeItem("refreshToken");
      navigate("/Login");
      return null;
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/Login");
        return null;
      }

      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    }

    return response;
  }

  useEffect(() => {
    async function getTasks() {
      if (!localStorage.getItem("accessToken")) {
        navigate("/Login");
        return;
      }
      setLoading(true);
      try {
        const response = await authFetch(`${API_URL}/tasks`, { method: "GET" });
        if (!response) return;

        const data = await response.json();
        if (!response.ok) {
          setError(data.error);
          return;
        }
        setList(data);
      } catch (e) {
        setError("could not reach the server");
      } finally {
        setLoading(false);
      }
    }
    getTasks();
  }, []);

  async function handleOnClick() {
    try {
      if (!task.trim()) return;
      const response = await authFetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: task }),
      });
      if (!response) return;

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
      const response = await authFetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response) return;

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
  async function handleUpdate(taskId) {
    try {
      const response = await authFetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
      });
      if (!response) return;

      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setList(listi.map((t) => (t._id === taskId ? data.task : t)));
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
        {[...listi]
          .sort((a, b) => a.completed - b.completed)
          .map((task) => (
            <TaskItem
              key={task._id}
              task={task.description}
              onDelete={() => handleDelete(task._id)}
              onUpdate={() => handleUpdate(task._id)}
              completed={task.completed}
            />
          ))}
      </ul>
      <ClipLoader loading={loading} size={150} color="#ffecec" />
      <Button
        text="logout"
        onClick={() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/Landing");
        }}
      />
      {error && <p>{error}</p>}
    </div>
  );
}
