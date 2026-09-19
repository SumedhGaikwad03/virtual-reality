import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { registerServiceWorker } from "./pwa/registerServiceWorker";

// Automatic recovery for Vite dynamic-import chunk version skew
const CHUNK_RELOAD_KEY = "vr_chunk_reload_guard";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
  if (!hasReloaded) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
    window.location.reload();
  }
});

// Clear reload guard after successful application startup
setTimeout(() => {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Ignore storage access errors
  }
}, 5000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
