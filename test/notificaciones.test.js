// test/notificaciones.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import SendNotification from '../src/Components/Notification';

describe('Notificaciones Push', () => {
  it('debería mostrar una notificación correctamente', () => {
    const message = 'Hola, esta es una prueba';

    render(<SendNotification message={message} />);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('maneja errores al enviar notificación', async () => {
    const message = null; // Prueba con un mensaje nulo

    // Verifica que se lance un error
    expect(() => SendNotification({ message })).toThrow('El mensaje no puede estar vacío');
  });
});
