import React from "react";
// src/index.jsx
import { createRoot } from "react-dom/client";
import App from "./components/App";
import Landing from "./components/Landing";
import Home from "./components/Home";

//createRoot(document.getElementById("root")).render(<App />);

//createRoot(document.getElementById("root")).render(<Landing />);

createRoot(document.getElementById("root")).render(<Home />);
