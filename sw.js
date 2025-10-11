// Service Worker for GitHub Pages Caching
// Version 1.0.2

const CACHE_NAME = 'mindquest-v1.0.2';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/script.js',
  '/assets/mindquest-logomark.png',
  '/assets/mindquestlogowithtag-01.png',
  '/assets/gecbta-loga.png',
  '/assets/ackaf-logo.png',
  '/assets/pattern-01.png',
  '/assets/favicon/favicon-96x96.png',
  '/assets/favicon/favicon.svg',
  '/assets/favicon/apple-touch-icon.png'
];

// External resources to cache
const EXTERNAL_CACHE_URLS = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Lato:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static resources');
        return cache.addAll([...STATIC_CACHE_URLS, ...EXTERNAL_CACHE_URLS]);
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - use different strategies based on resource type
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external API calls and analytics
  if (event.request.url.includes('googletagmanager') ||
      event.request.url.includes('google-analytics') ||
      event.request.url.includes('gtag')) {
    return;
  }

  const url = new URL(event.request.url);

  // Network First strategy for HTML files (always get fresh content)
  if (event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Stale-While-Revalidate for CSS, JS, and images (serve cached but update in background)
  else if (shouldCache(event.request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
  // Network only for everything else
  else {
    event.respondWith(fetch(event.request));
  }
});

// Network First Strategy: Try network, fall back to cache
async function networkFirstStrategy(request) {
  try {
    console.log('[SW] Network First - fetching from network:', request.url);
    const networkResponse = await fetch(request);

    // Cache the fresh response
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First - falling back to cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale-While-Revalidate Strategy: Serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    // Update cache in the background
    if (networkResponse && networkResponse.status === 200) {
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Stale-While-Revalidate - updating cache:', request.url);
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Stale-While-Revalidate - fetch failed:', error.message);
    return null;
  });

  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('[SW] Stale-While-Revalidate - serving from cache:', request.url);
    return cachedResponse;
  }

  // Otherwise wait for network
  console.log('[SW] Stale-While-Revalidate - waiting for network:', request.url);
  return fetchPromise;
}

// Helper function to determine if URL should be cached
function shouldCache(url) {
  const cacheableExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.woff', '.woff2'];
  const cacheableDomains = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

  return cacheableExtensions.some(ext => url.includes(ext)) ||
         cacheableDomains.some(domain => url.includes(domain));
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
