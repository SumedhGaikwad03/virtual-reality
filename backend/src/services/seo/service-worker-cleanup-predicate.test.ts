import assert from "node:assert/strict";
import test from "node:test";

/**
 * Pure predicate mirroring frontend/src/pwa/registerServiceWorker.ts
 * to verify isolation boundaries without cross-root compilation coupling.
 */
function isLegacyRootWorkerRegistration(
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

test("isLegacyRootWorkerRegistration accurately targets only root-scoped /sw.js on current origin", () => {
  const origin = "https://www.virtual2reality.in";

  // 1. Targets legacy root-scoped registration on same origin
  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://www.virtual2reality.in/",
        active: { scriptURL: "https://www.virtual2reality.in/sw.js" },
      },
      origin,
    ),
    true,
  );

  // 2. Ignores admin-scoped registration (must never unregister /admin or /admin/)
  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://www.virtual2reality.in/admin",
        active: { scriptURL: "https://www.virtual2reality.in/sw.js" },
      },
      origin,
    ),
    false,
  );

  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://www.virtual2reality.in/admin/",
        active: { scriptURL: "https://www.virtual2reality.in/sw.js" },
      },
      origin,
    ),
    false,
  );

  // 3. Ignores registrations from different origins
  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://another-domain.com/",
        active: { scriptURL: "https://another-domain.com/sw.js" },
      },
      origin,
    ),
    false,
  );

  // 4. Ignores unrelated service worker scripts (e.g., push notifications, third-party)
  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://www.virtual2reality.in/",
        active: { scriptURL: "https://www.virtual2reality.in/firebase-messaging-sw.js" },
      },
      origin,
    ),
    false,
  );

  // 5. Handles malformed or missing scriptURL safely without throwing
  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "https://www.virtual2reality.in/",
        active: null,
        installing: null,
        waiting: null,
      },
      origin,
    ),
    false,
  );

  assert.equal(
    isLegacyRootWorkerRegistration(
      {
        scope: "not-a-valid-url",
        active: { scriptURL: "not-a-valid-url" },
      },
      origin,
    ),
    false,
  );
});
