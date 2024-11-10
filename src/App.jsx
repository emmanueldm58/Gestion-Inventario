// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer.jsx';
import Productos from './Components/Productos.jsx';
import Notification from './Components/Notification.jsx';
import Administrador from './Components/Administrador.jsx';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const App = () => {
  const [productos, setProductos] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Función para obtener los productos desde Firebase y escuchar cambios en tiempo real
  const obtenerProductos = () => {
    const unsubscribe = onSnapshot(collection(db, 'Productos'), (querySnapshot) => {
      const dataFirebase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(dataFirebase); // Actualiza el estado de productos
    });

    // Regresar la función de limpieza para detener la escucha cuando el componente se desmonte
    return unsubscribe;
  };

  // Cargar los productos y escuchar cambios en tiempo real cuando el componente se monta
  useEffect(() => {
    const unsubscribe = obtenerProductos();
    return () => unsubscribe(); // Limpia la escucha cuando el componente se desmonte
  }, []);

  // Configurar un intervalo para mostrar la notificación cada 15 segundos si hay productos con stock bajo
  useEffect(() => {
    const interval = setInterval(() => {
      const productosBajos = productos.filter(producto => producto.cantidad < 10);
      if (productosBajos.length > 0) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000); // Oculta la notificación después de 5 segundos
      }
    }, 15000); // Verificar cada 15 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [productos]);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        {showNotification && (
          <Notification message="¡Alerta! Algunos productos están con stock bajo (menos de 10)." />
        )}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Productos productos={productos} />} />
            <Route path="/administrador" element={<Administrador />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;


