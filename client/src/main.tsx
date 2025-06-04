import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/cybersecurity-theme.scss";
import "./styles/dark-theme-override.css";

createRoot(document.getElementById("root")!).render(<App />);
