"use strict";
const BASE = new URL("./", self.location.href).href;
// Use the former app's scoped prefix so old capture shells are retired.
const PREFIX = "mine-shell:" + BASE + ":";
const CACHE = PREFIX + "maintenance-bdf8b8cfa5edf46b";
const INDEX = new URL("index.html", BASE).href;
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const response = await fetch(new Request(INDEX, { cache: "reload" }));
  if (!response.ok || !(await response.clone().text()).includes("The dashboard is closed for maintenance."))
    throw new Error("Maintenance page not available yet.");
  await cache.put(INDEX, response);
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin ||
      ![new URL(BASE).pathname, new URL(INDEX).pathname].includes(url.pathname)) return;
  event.respondWith((async () => {
    // Once installed, serve only the maintenance shell, including old bookmarked query strings.
    const cached = await (await caches.open(CACHE)).match(INDEX);
    return cached || new Response("The dashboard is closed for maintenance. Reconnect and refresh this page.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  })());
});
