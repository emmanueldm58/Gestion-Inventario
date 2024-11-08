// Informacion.js
import React, { useState, useEffect } from 'react';

const Administrador = () => {
    const [productosFavoritos, setProductosFavoritos] = useState([]);

    useEffect(() => {
        // Cargar productos favoritos desde el service worker
        const obtenerFavoritosDesdeServiceWorker = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.active?.postMessage({ action: 'getProductosFavoritos' });
                });

                navigator.serviceWorker.addEventListener('message', (event) => {
                    const { action, productosFavoritos } = event.data;
                    if (action === 'productosFavoritos') {
                        setProductosFavoritos(productosFavoritos);
                    }
                });
            }
        };

        obtenerFavoritosDesdeServiceWorker();
    }, []);

    const eliminarProducto = (id) => {
        const nuevosFavoritos = productosFavoritos.filter(producto => producto.id !== id);
        setProductosFavoritos(nuevosFavoritos);

        // Enviar la actualización al service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.active?.postMessage({ action: 'setProductosFavoritos', productos: nuevosFavoritos });
            });
        }
    };

    return (
        <div className="container-fluid" style={{ marginTop: '120px' }}>
            <h1 className="text-center my-4">Administrador</h1>
           
        </div>
    );
};

export default Administrador;
