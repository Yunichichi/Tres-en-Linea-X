// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Failed to find the root element");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
