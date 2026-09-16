import Button from "../Button/Button";
import { FaDeleteLeft } from "react-icons/fa6";
import { MdDone } from "react-icons/md";
import { MdDoneAll } from "react-icons/md";
import "./TaskItem.css";

export default function TaskItem({ task, onDelete, onUpdate, completed }) {
  return (
    <li className="task-item">
      <span>{task}</span>
      <div className="task-icons">
        {completed ? (
          <MdDoneAll onClick={onUpdate} />
        ) : (
          <MdDone onClick={onUpdate} />
        )}

        <FaDeleteLeft className="delete-icon" onClick={onDelete} />
      </div>
    </li>
  );
}
