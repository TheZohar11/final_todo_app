import React, { useState } from "react";
import Input from "../../components/Input/Input";
import TextLarge from "../../components/TextLarge/TextLarge";
import "./Register.css";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleOnClick(e) {
    try {
      if (password !== verifyPassword) {
        setError("password must be equal to verify password");
        return;
      }
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/Home");
    } catch (e) {
      setError("could not reach the server");
    }
  }
  return (
    <div className="container">
      <p>to be registerd</p>
      <TextLarge text="enter your email" />
      <Input
        placeholder="youremail@gmail.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextLarge text="enter your password" />
      <Input
        placeholder="password.."
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextLarge text="verify password" />
      <Input
        placeholder="password.."
        type="password"
        value={verifyPassword}
        onChange={(e) => setVerifyPassword(e.target.value)}
      />
      <Button text="Register" onClick={handleOnClick} />
      {error && <p>{error}</p>}
    </div>
  );
}
