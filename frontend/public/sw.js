const STATIC_CACHE = "virtual-reality-admin-shell-v4";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Fallback HTML page when completely offline and /index.html is not in cache
const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offline | Virtual Reality</title>
  <style>
    body {
      margin: 0;
      padding: 2rem 1.5rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0b1320;
      color: #fcfaf6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      box-sizing: border-box;
    }
    .offline-card {
      max-width: 24rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(217, 208, 195, 0.2);
      border-radius: 0.75rem;
      padding: 2rem 1.5rem;
    }
    h1 {
      font-size: 1.35rem;
      margin: 0 0 0.75rem 0;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    p {
      margin: 0 0 1.5rem 0;
      color: #838d85;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    button {
      background: #18382e;
      color: #fcfaf6;
      border: 1px solid rgba(217, 208, 195, 0.3);
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="offline-card">
    <h1>Offline</h1>
    <p>Please check your internet connection and refresh the page to continue.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>`;

function createOfflineResponse() {
  return new Response(OFFLINE_FALLBACK_HTML, {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function createAssetErrorResponse() {
  return new Response(null, {
    status: 504,
    statusText: "Gateway Timeout",
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Individual asset fetch failure does not abort installation
          }
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("virtual-reality-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET, cross-origin requests, and all /api/ endpoints
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // 2. Navigation requests (Network-first with cached shell fallback and guaranteed Response)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put("/index.html", copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          try {
            const cachedIndex = await caches.match("/index.html");
            if (cachedIndex) {
              return cachedIndex;
            }
            const cachedRoot = await caches.match("/");
            if (cachedRoot) {
              return cachedRoot;
            }
          } catch {
            // Cache lookup failure fallback
          }
          return createOfflineResponse();
        }),
    );
    return;
  }

  // 3. Static asset requests (Cache-first with network fallback and clean error handling)
  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => {
            return createAssetErrorResponse();
          });
      })
      .catch(() => {
        return createAssetErrorResponse();
      }),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = {};
  }

  const title = typeof data.title === "string" ? data.title : "New enquiry";
  const body = typeof data.body === "string" ? data.body : "A new lead is ready to review.";
  const url = typeof data.url === "string" ? data.url : "/admin/leads";

  event.waitUntil(self.registration.showNotification(title, {
    body,
    data: { url },
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification.data?.url ?? "/admin/leads";
  let safePath = "/admin/leads";
  if (typeof rawUrl === "string" && (rawUrl.startsWith("/admin/") || rawUrl === "/admin")) {
    safePath = rawUrl;
  }
  const targetUrl = new URL(safePath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) {
        return existing.focus().then(() => existing.navigate(targetUrl));
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
