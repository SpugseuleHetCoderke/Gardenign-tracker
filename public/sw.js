/**
 * Minimal service worker: its only job is to receive a push event and show a
 * notification, and to focus/open the app when that notification is tapped.
 * No offline caching — the app always needs a live connection to the
 * database anyway, so there's nothing useful to cache.
 */

self.addEventListener("push", (event) => {
  let data = { title: "Tuin", body: "Er is iets te doen in de tuin.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload: fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/icon-192.png",
      badge: data.badge ?? "/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window" });
      const existing = clientsList.find((c) => "focus" in c);
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })(),
  );
});
