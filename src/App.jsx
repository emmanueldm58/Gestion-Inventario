// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer.jsx';
import Usuarios from './Components/Usuarios.jsx';
import Productos from './Components/Productos.jsx';
import Historial from './Components/Historial.jsx';
import Login from './Components/Login.jsx';
import Notification from './Components/Notification';
import ReporteGraficos from './Components/ReporteGraficos'; // Importa el componente de gráficos

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('');
  const [permisos, setPermisos] = useState('');
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [dataHistorial, setDataHistorial] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const obtenerProductos = () => {
    const unsubscribeProductos = onSnapshot(collection(db, 'Productos'), (querySnapshot) => {
      const dataFirebase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(dataFirebase);
      dataFirebase.forEach(producto => {
        if (producto.cantidad < 10) {
          addNotification(`¡Alerta! El producto ${producto.nombre} tiene un stock bajo.`, producto.id);
        }
      });
    });

    const unsubscribeHistorial = onSnapshot(collection(db, 'Historial'), (querySnapshot) => {
      const dataHistorial = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setDataHistorial(dataHistorial);
    });

    return () => {
      unsubscribeProductos();
      unsubscribeHistorial();
    };
  };

  useEffect(() => {
    const unsubscribe = obtenerProductos();
    return () => unsubscribe();
  }, []);

  const addNotification = (message, id) => {
    const newNotification = { id, message };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            setPermisos(userData.permisos);
          } else {
            setPermisos('');
            setRole('');
          }
        } catch (error) {
          setPermisos('');
          setRole('');
        }
        addNotification('Bienvenido, ' + user.email, 'welcome');
      } else {
        setIsAuthenticated(false);
        setRole('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isAuthenticated && <Navbar role={role} />}

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
              style={{ marginTop: `${index * 130}px` }}
            />
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Productos role={role} productos={productos} permisos={permisos} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/usuarios" element={role === 'admin' ? <Usuarios role={role} /> : <Navigate to="/" />} />
            <Route path="/historial" element={role === 'admin' ? <Historial /> : <Navigate to="/" />} />
            <Route path="/graficos" element={isAuthenticated ? <ReporteGraficos historial={dataHistorial} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
