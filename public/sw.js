self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const fallbackPayload = {
    body: "今日足球简报已经更新。",
    title: "Clean Football",
    url: "/today"
  };
  let payload = fallbackPayload;

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        ...fallbackPayload,
        body: event.data.text() || fallbackPayload.body
      };
    }
  }

  const title = payload.title || fallbackPayload.title;

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: "/clean-football-logo.svg",
      body: payload.body || fallbackPayload.body,
      data: {
        url: payload.url || fallbackPayload.url
      },
      icon: "/clean-football-logo.svg",
      tag: payload.tag || "clean-football-daily",
      vibrate: [80, 40, 80]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/today", self.location.origin)
    .href;

  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        const focusedClient = clients.find((client) => client.url === targetUrl);

        if (focusedClient) {
          return focusedClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      })
  );
});
