// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer.jsx';
import Productos from './Components/Productos.jsx';
import Notification from './Components/Notification.jsx'; // Importar el componente de notificación
import Administrador from './Components/Administrador.jsx';

const App = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000); // La notificación se oculta después de 5 segundos
    }, 30000); // Cada 30 segundos
  
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> {/* Contenedor principal con flexbox */}
        <Navbar />
        {showNotification && <Notification message="¡Oferta de tiempo limitado!" />}
        <div style={{ flex: 1 }}> {/* Espacio flexible para el contenido */}
          <Routes>
            <Route path="/" element={<Productos />} />
            <Route path="/administrador" element={<Administrador   />} />
          </Routes>
        </div>
        <Footer /> {/* El footer se mantendrá al final */}
      </div>
    </BrowserRouter>
  );
};

export default App;
