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
  const [notifications, setNotifications] = useState([]);

  const obtenerProductos = () => {
    const unsubscribe = onSnapshot(collection(db, 'Productos'), (querySnapshot) => {
      const dataFirebase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(dataFirebase);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = obtenerProductos();
    return () => unsubscribe();
  }, []);

  const addNotification = (message, id) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { id, message }
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(notification => notification.id !== id)
    );
    setTimeout(() => {
      const producto = productos.find(p => p.id === id && p.cantidad < 10);
      if (producto) {
        addNotification(`Producto: ${producto.nombre}, Stock bajo: ${producto.cantidad}`, id);
      }
    }, 10000);
  };

  useEffect(() => {
    const productosBajos = productos.filter(producto => producto.cantidad < 10);
    productosBajos.forEach(producto => {
      if (!notifications.some(notification => notification.id === producto.id)) {
        addNotification(`Producto: ${producto.nombre}, Stock bajo: ${producto.cantidad}`, producto.id);
      }
    });
  }, [productos]);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 999,
        }}>
          {notifications.map((notification, index) => (
            <Notification
              key={notification.id}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
              style={{ marginTop: `${index * 130}px` }} // Espacio entre cada notificación
            />
          ))}
        </div>
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
