// Saves the game on the device so it keeps working offline once installed.
// Bump CACHE whenever a picture, sound, or icon file changes so installed copies download it again.
// Every game on mariotristan.github.io shares one Cache Storage: only ever touch our own caches.
const CACHE_PREFIX = "numbers-";
const CACHE = `${CACHE_PREFIX}v2`;

// Every file the game needs. tests/pwa.test.js keeps this list in sync with the repo.
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "art/badges/coins-100.webp",
  "art/badges/first-perfect.webp",
  "art/badges/grade-2.webp",
  "art/badges/grade-3.webp",
  "art/badges/grade-4.webp",
  "art/badges/rounds-10.webp",
  "art/stickers/artist-palette.webp",
  "art/stickers/butterfly.webp",
  "art/stickers/cat.webp",
  "art/stickers/dog.webp",
  "art/stickers/dolphin.webp",
  "art/stickers/doughnut.webp",
  "art/stickers/glowing-star.webp",
  "art/stickers/guitar.webp",
  "art/stickers/ice-cream.webp",
  "art/stickers/kite.webp",
  "art/stickers/octopus.webp",
  "art/stickers/panda.webp",
  "art/stickers/pizza.webp",
  "art/stickers/rainbow.webp",
  "art/stickers/ringed-planet.webp",
  "art/stickers/robot.webp",
  "art/stickers/rocket.webp",
  "art/stickers/soccer-ball.webp",
  "art/stickers/sunflower.webp",
  "art/stickers/t-rex.webp",
  "art/stickers/teddy-bear.webp",
  "art/stickers/trophy.webp",
  "art/stickers/unicorn.webp",
  "art/stickers/volcano.webp",
  "css/style.css",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "js/audio.js",
  "js/blocks.js",
  "js/bruno.js",
  "js/data/credits.js",
  "js/data/levels.js",
  "js/data/shop.js",
  "js/data/strings.js",
  "js/i18n.js",
  "js/icons-data.js",
  "js/icons.js",
  "js/main.js",
  "js/math/choices.js",
  "js/math/entry.js",
  "js/math/explain.js",
  "js/math/problems.js",
  "js/progress.js",
  "js/round.js",
  "js/scenery.js",
  "js/screens/path.js",
  "js/screens/play.js",
  "js/screens/results.js",
  "js/screens/settings.js",
  "js/screens/shop.js",
  "js/screens/stickers.js",
  "js/screens/welcome.js",
  "js/ui.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(isCacheFirst(url.pathname) ? cacheFirst(request) : networkFirst(request));
});

// Pictures and icons never change within a CACHE version.
function isCacheFirst(pathname) {
  return /\.(png|webp)$/.test(pathname);
}

// Serve the saved copy of pictures and icons.
async function cacheFirst(request) {
  const response = (await caches.match(request, { ignoreSearch: true })) ?? (await fetch(request));
  const header = request.headers.get("range");
  if (!header || response.status !== 200) return response;
  return partialResponse(response, header);
}

// Pages and code: newest version when online, saved copy when offline.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return caches.match("index.html");
    throw err;
  }
}

// Safari asks for audio in byte ranges and won't play a full 200 response from a service worker.
async function partialResponse(response, header) {
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const range = parseRange(header, size);
  if (!range) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(body.slice(range.start, range.end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      "Content-Length": String(range.end - range.start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

// "bytes=0-1", "bytes=5-", "bytes=-3" → { start, end } (inclusive), or null if unusable.
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return null;
  const [, first, last] = match;
  const start = first === "" ? Math.max(0, size - Number(last)) : Number(first);
  const end = first === "" || last === "" ? size - 1 : Math.min(Number(last), size - 1);
  return start <= end && start < size ? { start, end } : null;
}
