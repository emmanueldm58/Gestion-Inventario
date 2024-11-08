// service-worker.js
const CACHE_NAME = 'productos-cache';
const PRODUCTS_URL = 'https://tiendaonline-79bfc-default-rtdb.firebaseio.com/productos.json';

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(PRODUCTS_URL); // Cache the products URL
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes(PRODUCTS_URL)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // Return cached response if available, else fetch from network
                return response || fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});

const productosSeleccionados = [];
const productosFavoritos = [];

self.addEventListener('message', (event) => {
    const { action, productos } = event.data;
  
    switch (action) {
      case 'setProductosSeleccionados':
        // Actualizar los productos seleccionados
        productosSeleccionados.length = 0; // Limpiar el array
        productosSeleccionados.push(...productos);
        break;
  
      case 'getProductosSeleccionados':
        // Enviar los productos seleccionados de vuelta
        event.source.postMessage({ action: 'productosSeleccionados', productosSeleccionados });
        break;
  
      case 'setProductosFavoritos':
        // Actualizar los productos favoritos
        productosFavoritos.length = 0; // Limpiar el array
        productosFavoritos.push(...productos);
        break;
  
      case 'getProductosFavoritos':
        // Enviar los productos favoritos de vuelta
        event.source.postMessage({ action: 'productosFavoritos', productosFavoritos });
        break;
    }
  });