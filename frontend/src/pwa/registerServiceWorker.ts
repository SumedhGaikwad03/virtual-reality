/*
 * PURPOSE:
 * Registers the admin PWA service worker and coordinates clean client updates.
 *
 * FLOW:
 * Frontend entry point -> service worker registration -> update check -> controllerchange reload.
 *
 * RESPONSIBILITY:
 * Keep service-worker setup outside React components so presentation code does not own PWA lifecycle.
 * Ensure already-installed PWAs update automatically to new deployments without manual storage clearing.
 */

export function registerServiceWorker() {
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) return;

  let isRefreshing = false;
  const hadPreviousController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (isRefreshing) return;
    if (!hadPreviousController) {
      // First-time worker registration: page already loaded fresh assets, no reload needed.
      return;
    }
    isRefreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/admin" })
      .then((registration) => {
        // Check for an updated service worker once on application load
        void registration.update().catch(() => {});
      })
      .catch(() => {
        // The application remains usable online when registration is unavailable.
      });
  });
}
