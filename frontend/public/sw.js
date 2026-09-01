const STATIC_CACHE = "virtual-reality-admin-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(["/", "/index.html", "/manifest.webmanifest", "/icons/app-icon.svg"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== STATIC_CACHE)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
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
    icon: "/icons/app-icon.svg",
    badge: "/icons/app-icon.svg",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url ?? "/admin/leads", self.location.origin).href;

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
