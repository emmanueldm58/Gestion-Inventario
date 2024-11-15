// src/Components/Notification.jsx
import React from 'react';
import './Notification.css';

const Notification = ({ message, onClose, style }) => {
  return (
    <div className="notification" style={style}>
      <p>{message}</p>
      <button onClick={onClose} className="close-button">Cerrar</button>
    </div>
  );
};

export default Notification;
