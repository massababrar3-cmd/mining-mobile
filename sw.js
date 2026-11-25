"use strict";
const BASE=new URL("./",self.location.href).href,PREFIX="mine-shell:"+BASE+":",CACHE=PREFIX+"retired-2026-11-25",PAGE=new URL("404.html",BASE).href;
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.add(new Request(PAGE,{cache:"reload"}));await self.skipWaiting();})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const n of await caches.keys())if(n.startsWith(PREFIX)&&n!==CACHE)await caches.delete(n);await self.clients.claim();})()));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==self.location.origin||![new URL(BASE).pathname,new URL("index.html",BASE).pathname].includes(u.pathname))return;e.respondWith((async()=>{const r=await(await caches.open(CACHE)).match(PAGE);return new Response(r?await r.text():"This portal is no longer available.",{status:410,headers:{"Content-Type":"text/html; charset=utf-8"}});})());});
