/* eslint-disable */
/**
 * Service Worker RideCloud — Web Push.
 *
 * Servi statiquement depuis /sw.js, enregistré côté client avec
 * navigator.serviceWorker.register("/sw.js"). On garde un scope racine pour
 * que le SW puisse afficher des notifications relatives à n'importe quelle
 * page de l'app.
 *
 * Volontairement minimaliste : pas de stratégie de cache offline (le projet
 * n'utilise plus next-pwa pour l'instant), uniquement les hooks de
 * notification.
 */

self.addEventListener("install", (event) => {
  // Active immédiatement le nouveau SW sans attendre la fermeture des onglets.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "RideCloud",
    body: "Vous avez un nouvel entretien à prévoir.",
    url: "/categories",
    tag: "ridecloud-generic"
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (error) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag,
    renotify: true,
    data: {
      url: payload.url || "/categories"
    }
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/categories";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      // Si un onglet de l'app est déjà ouvert, on le focus et on navigue.
      for (const client of clientsList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            return client.navigate(targetUrl);
          }
          return undefined;
        }
      }
      // Sinon on ouvre un nouvel onglet.
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
