import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/cybersecurity-theme.scss";
import "./styles/dark-theme-override.css";
import { swManager } from "./lib/serviceWorker";
import { performanceMonitor } from "./lib/performance";

// Performance monitoring setup
performanceMonitor.mark('app-init');

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Register service worker for offline support and caching
if (import.meta.env.PROD) {
  swManager.register().then(success => {
    if (success) {
      console.log('Service worker registered successfully');
    }
  });
}

// Performance measurements
performanceMonitor.measure('app-init-complete', 'app-init');
