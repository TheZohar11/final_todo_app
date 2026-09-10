import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import TaskItem from "../../components/TaskItem/TaskItem";
import "./Home.css";

export default function Home() {
  const [listi, setList] = useState([]);
  const [task, setTask] = useState("");

  function handleOnClick() {
    setList([...listi, task]);
    setTask("");
  }
  return (
    <>
      <p>Home is whenever Im with you</p>
      <div className="input-area">
        <Input
          placeholder="enter a to do.."
          onChange={(e) => setTask(e.target.value)}
          value={task}
        />
        <Button text="add" onClick={handleOnClick} />
      </div>
      <ul>
        {listi.map((task, index) => (
          <TaskItem key={index} task={task} />
        ))}
      </ul>
      <Link to="/Login">Login</Link>
    </>
  );
}
