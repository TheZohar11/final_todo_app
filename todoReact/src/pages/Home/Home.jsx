import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <p>Home is whenever Im with you</p>
      <Link to="/Login">Login</Link>
    </>
  );
}
