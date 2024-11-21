import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, onClose, style, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="notification" style={style} role="alert">
      <p>{message}</p>
      <button 
        onClick={onClose} 
        className="close-button" 
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
