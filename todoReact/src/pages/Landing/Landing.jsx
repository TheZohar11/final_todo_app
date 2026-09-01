import { Link } from "react-router-dom";
import Login from "../Login/Login";
import Register from "../Register/Register";
import "./Landing.css";

export default function Landing() {
  return (
    <>
      <div className="divi">
        <h4>
          "Your last task should always be to orginaize a new to do list" z.
          Simhon
        </h4>
        <Link to="/Login" className="link">
          Login
        </Link>
        <Link to="/Register" className="link">
          Register
        </Link>
      </div>
    </>
  );
}
