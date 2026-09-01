import React from "react";
import { Link } from "react-router-dom";
import Home from "../Home/Home";

export default function Login() {
  return (
    <>
      <p className="text">please log in already</p>
      <Link to="/">Landing</Link>
      <Link to="/Home">Home</Link>
    </>
  );
}
