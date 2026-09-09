import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import TextLarge from "../../components/TextLarge/TextLarge";
import "./Login.css";
import Button from "../../components/Button/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleOnChangeEmail(e) {
    setEmail(e.target.value);
  }
  function handleOnChangePassword(e) {
    setPassword(e.target.value);
  }
  function handleOnClick(e) {
    navigate("/Home");
  }
  return (
    <div className="divi">
      <p className="text">please log in already</p>
      <TextLarge text="email" />
      <Input
        placeholder="example123@gmail.com"
        value={email}
        onChange={handleOnChangeEmail}
        type="email"
      />
      <TextLarge text="password" />
      <Input
        placeholder="password"
        value={password}
        onChange={handleOnChangePassword}
        type="password"
      />
      <Button onClick={handleOnClick} text="Log In" />
      <Link to="/">Landing</Link>
      <Link to="/Home">Home</Link>
    </div>
  );
}
