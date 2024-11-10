// src/Components/Notification.jsx
import React from 'react';
import './Notification.css'; // Asegúrate de que el archivo CSS esté en la misma carpeta

const Notification = ({ message }) => {
  return (
    <div className="notification">
      <p>{message}</p>
    </div>
  );
};

export default Notification;
