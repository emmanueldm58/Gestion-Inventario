import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Productos from '../src/Components/Productos';

// Mock de la API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, nombre: 'Producto 1', categoria: 'Categoría 1', precio: 100, photo: null },
      // Agrega más productos si es necesario
    ]),
  })
);

// Mock de console.error para evitar que se imprima en la consola
const originalConsoleError = console.error; // Guardar el original
beforeAll(() => {
  console.error = jest.fn(); // Mockear console.error
});

afterAll(() => {
  console.error = originalConsoleError; // Restaurar console.error después de las pruebas
});

describe('Productos', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks antes de cada prueba
  });

  it('debería mostrar productos correctamente', async () => {
    render(<Productos />);

    // Esperar a que los productos se carguen
    await waitFor(() => {
      expect(screen.getByText('Lista de Productos')).toBeInTheDocument();
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });
  });

  it('debería manejar errores al obtener productos', async () => {
    // Simular error en la API
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false })
    );

    render(<Productos />);

    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar los productos.')).toBeInTheDocument();
    });
  });

  // Aquí puedes agregar más pruebas para verificar la lógica de selección y favoritos
});
