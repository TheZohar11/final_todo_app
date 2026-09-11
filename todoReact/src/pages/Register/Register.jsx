import React from "react";
import Input from "../../components/Input/Input";
import TextLarge from "../../components/TextLarge/TextLarge";
import "./Register.css";
import Button from "../../components/Button/Button";

export default function Register() {
  return (
    <div className="container">
      <p>to be registerd</p>
      <TextLarge text="enter your email" />
      <Input placeholder="youremail@gmail.com" type="email" />
      <TextLarge text="enter your password" />
      <Input placeholder="password.." type="password" />
      <TextLarge text="verify password" />
      <Input placeholder="password.." type="password" />
      <Button text="Register" />
    </div>
  );
}
