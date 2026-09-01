/*
 * PURPOSE:
 * Registers the admin PWA service worker in production-capable browser environments.
 *
 * FLOW:
 * Frontend entry point -> service worker registration -> browser-managed shell and push lifecycle.
 *
 * RESPONSIBILITY:
 * Keep service-worker setup outside React components so presentation code does not own PWA lifecycle.
 */

export function registerServiceWorker() {
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The application remains usable online when registration is unavailable.
    });
  });
}
