// src/Components/ReporteGraficos.jsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import './ReporteGraficos.css'; // Agregar archivo CSS para estilos personalizados

const ReporteGraficos = ({ productos }) => {
  const [datosGrafico, setDatosGrafico] = useState([]);

  useEffect(() => {
    generarDatosGrafico(productos);
  }, [productos]);

  const generarDatosGrafico = (productos) => {
    const productosBajoStock = productos.filter((producto) => producto.cantidad < 10);
    const productosEnExceso = productos.filter((producto) => producto.cantidad > 50);
    const productosMasUtilizados = productos.filter((producto) => producto.ventas > 100);

    setDatosGrafico([
      {
        name: 'Bajo Stock',
        value: productosBajoStock.length,
        color: '#FF6363',
      },
      {
        name: 'En Exceso',
        value: productosEnExceso.length,
        color: '#FFD700',
      },
      {
        name: 'Mas Utilizados',
        value: productosMasUtilizados.length,
        color: '#32CD32',
      },
    ]);
  };

  return (
    <div className="reporte-graficos-container">
      <h2 className="titulo-grafico">Reporte Gráfico de Inventario</h2>
      <div className="grafico-container">
        <PieChart width={800} height={400}>
          <Pie
            data={datosGrafico}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {datosGrafico.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default ReporteGraficos;
