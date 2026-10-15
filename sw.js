"use strict";
// Cache only this public application shell, never reports, settings or external URLs.
const BASE = new URL("./", self.location.href).href;
const PREFIX = "mine-shell:" + BASE + ":";
const CACHE = PREFIX + "fe3ff03e1c9f6fb5";
const INDEX = new URL("index.html", BASE).href;
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.add(new Request(INDEX, { cache: "reload" }));
      await self.skipWaiting();
    })(),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith(PREFIX) && name !== CACHE)
          await caches.delete(name);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    (url.origin + url.pathname !== BASE && url.origin + url.pathname !== INDEX)
  )
    return;
  event.respondWith(
    (async () => {
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(event.request, {
          signal: controller.signal,
          cache: "no-cache",
        });
        if (response.ok) return response;
        throw new Error("Website unavailable");
      } catch {
        const cached = await (await caches.open(CACHE)).match(INDEX);
        return (
          cached ||
          new Response(
            "Offline website is unavailable. Reconnect and open the dashboard first.",
            { status: 503 },
          )
        );
      } finally {
        clearTimeout(timer);
      }
    })(),
  );
});
