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

/**
 * Evaluates whether a service worker registration belongs to a legacy root-scoped
 * deployment of /sw.js on the current origin, ensuring safe targeted cleanup.
 */
export function isLegacyRootWorkerRegistration(
  reg: {
    scope: string;
    active?: { scriptURL: string } | null;
    installing?: { scriptURL: string } | null;
    waiting?: { scriptURL: string } | null;
  },
  currentOrigin: string,
): boolean {
  try {
    const regUrl = new URL(reg.scope);
    if (regUrl.origin !== currentOrigin || regUrl.pathname !== "/") {
      return false;
    }
    const scriptUrl =
      reg.active?.scriptURL ||
      reg.installing?.scriptURL ||
      reg.waiting?.scriptURL;
    if (!scriptUrl) return false;
    return new URL(scriptUrl).pathname === "/sw.js";
  } catch {
    return false;
  }
}

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
    // Narrow cleanup for historical root-scoped registrations from pre-scope-isolation deployments
    if ("getRegistrations" in navigator.serviceWorker) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const reg of registrations) {
            try {
              if (isLegacyRootWorkerRegistration(reg, window.location.origin)) {
                void reg.unregister();
              }
            } catch {
              // Non-blocking cleanup
            }
          }
        })
        .catch(() => {});
    }

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
