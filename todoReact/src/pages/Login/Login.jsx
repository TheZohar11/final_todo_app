import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");

  function handleOnChange(e) {
    setEmail(e.target.value);
  }
  return (
    <div className="divi">
      <p className="text">please log in already</p>
      <Input
        placeholder="email.com"
        value={email}
        onChange={handleOnChange}
        type="email"
      />
      <Link to="/">Landing</Link>
      <Link to="/Home">Home</Link>
    </div>
  );
}
