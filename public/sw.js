// Only handle the home-screen launch. Readings, account data and API calls stay online.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.mode !== "navigate" || request.method !== "GET" ||
      request.url !== new URL("/", self.location.origin).href) return;

  event.respondWith(fetch(request).catch(() => new Response(
    '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>ASTROLOGAI</title>' +
    '<style>body{background:#0b1020;color:#fff;font:1.15rem/1.6 system-ui;text-align:center;padding:18vh 1rem}a{color:#ffda83}</style>' +
    '<h1>ASTROLOGAI</h1><p>כדי לפתוח את האתר דרוש חיבור לאינטרנט.</p><a href="/">ניסיון נוסף</a></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  )));
});
