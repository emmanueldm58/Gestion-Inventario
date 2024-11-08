// src/Components/Notification.jsx
import React from 'react';

const SendNotification = ({ message }) => {
  if (!message) {
    throw new Error('El mensaje no puede estar vacío');
  }

  return (
    <div className="notification">
      {message}
    </div>
  );
};

export default SendNotification;


