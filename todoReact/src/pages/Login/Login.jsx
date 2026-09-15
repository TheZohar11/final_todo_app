import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import TextLarge from "../../components/TextLarge/TextLarge";
import "./Login.css";
import Button from "../../components/Button/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleOnChangeEmail(e) {
    setEmail(e.target.value);
  }
  function handleOnChangePassword(e) {
    setPassword(e.target.value);
  }
  async function handleOnClick(e) {
    try {
      setError("");
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      localStorage.setItem("authToken", data.token);
      navigate("/Home");
    } catch (e) {
      setError("could not reach the server");
    }
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
      {error && <p>{error}</p>}
      <Link className="register-link" to="/Register">
        Don't have an account? Register
      </Link>
    </div>
  );
}
