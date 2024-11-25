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
import Administrador from './Components/Administrador.jsx';
import Login from './Components/Login.jsx';
import Notification from './Components/Notification';  // Asegúrate de importar el componente de notificación

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(''); // Estado para almacenar el rol
  const [permisos, setPermisos] = useState(''); // Estado para almacenar el rol
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [notifications, setNotifications] = useState([]);  // Estado de notificaciones

  // Función para obtener los productos y verificar el stock
  const obtenerProductos = () => {
    const unsubscribe = onSnapshot(collection(db, 'Productos'), (querySnapshot) => {
      const dataFirebase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(dataFirebase);

      // Verificar productos con stock bajo y mostrar notificación
      dataFirebase.forEach(producto => {
        if (producto.cantidad < 10) {
          addNotification(`¡Alerta! El producto ${producto.nombre} tiene un stock bajo.`, producto.id);
        }
      });
    });
    // Regresar la función de limpieza para detener la escucha cuando el componente se desmonte
    return unsubscribe;
  };

  // Cargar los productos y escuchar cambios en tiempo real cuando el componente se monta
  useEffect(() => {
    const unsubscribe = obtenerProductos();
    return () => unsubscribe(); // Limpia la escucha cuando el componente se desmonte
  }, []);

  const addNotification = (message, id) => {
    const newNotification = {
      id,
      message,
    };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    // Eliminar notificación después de 5 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Verifica el estado de autenticación y el rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        try {
          // Obtener el rol del usuario desde Firestore
          const userDoc = await getDoc(doc(db, "Users", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role); // Establece el rol del usuario
            setPermisos(userData.permisos); 
          } else {
            setPermisos('');
            setRole(''); // Si no se encuentra el documento, el rol será vacío
          }
        } catch (error) {
          setPermisos('');
          setRole(''); // Si ocurre un error, se vacía el rol
        }

        // Notificación de bienvenida cuando el usuario inicie sesión
        addNotification('Bienvenido, ' + user.email, 'welcome');
      } else {
        setIsAuthenticated(false);
        setRole(''); // Si no hay usuario, el rol es vacío
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
        {/* Pasa el rol al Navbar */}
        {isAuthenticated && <Navbar role={role} />}

        {/* Mostrar notificaciones */}
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
            {/* Ruta para productos, solo accesible si el usuario está autenticado */}
            <Route
              path="/"
              element={isAuthenticated ? <Productos role={role} productos={productos} permisos={permisos}/> : <Navigate to="/login" />}
            />

            {/* Ruta para login */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            {/* Ruta para usuarios */}
            <Route
              path="/usuarios"
              element={role === 'admin' ? <Usuarios role={role}/> : <Navigate to="/" />}
            />

            {/* Ruta para administrador, solo accesible si el usuario es administrador */}
            <Route
              path="/administrador"
              element={role === 'admin' ? <Administrador /> : <Navigate to="/" />}
            />

            <Route
              path="/historial"
              element={role === 'admin' ? <Historial /> : <Navigate to="/" />}
            />

            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;