// src/Components/ReporteGraficos.jsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import './ReporteGraficos.css'; // Asegúrate de tener este archivo CSS para tus estilos personalizados

const ReporteGraficos = ({ historial }) => {
  const [datosGraficoMas, setDatosGraficoMas] = useState([]);
  const [datosGraficoMenos, setDatosGraficoMenos] = useState([]);

  useEffect(() => {
    if (historial && historial.length > 0) {
      console.log('Historial:', historial); // Verificar los datos de productos
      generarDatosGrafico(historial);
    }
  }, [historial]);

  const generarDatosGrafico = (historial) => {
    // Filtrar solo las salidas
    const salidas = historial.filter((item) => item.accion === "salida");

    // Crear un objeto para contar las salidas por producto
    const productosSalidas = {};

    salidas.forEach((item) => {
      if (!productosSalidas[item.producto]) {
        productosSalidas[item.producto] = 0;
      }
      productosSalidas[item.producto] += item.cantidad;
    });

    // Convertir el objeto a un array de objetos con el formato adecuado
    const datosOrdenados = Object.keys(productosSalidas).map((producto) => ({
      name: producto,
      value: productosSalidas[producto],
    }));

    // Ordenar de mayor a menor
    datosOrdenados.sort((a, b) => b.value - a.value);

    // Dividir los primeros 5 productos más vendidos y los 5 productos con menos salidas
    const top5MasVendidos = datosOrdenados.slice(0, 5);
    const top5MenosVendidos = datosOrdenados.slice(-5).reverse(); // Los menos vendidos al revés (menor a mayor)

    setDatosGraficoMas(top5MasVendidos);
    setDatosGraficoMenos(top5MenosVendidos);
  };

  // Colores personalizados para las gráficas
  const colores = ['#FF6363', '#FFD700', '#32CD32', '#00BFFF', '#FF8C00']; // 5 colores diferentes


return (
  <div className="reporte-graficos-container" style={{ marginTop: '80px' }}>
    <h2 className="titulo-grafico">Reporte de Salidas de Productos</h2>

    {/* Gráfico: Productos con más salidas */}
    <div className="grafico-container">
      <h3>Los 5 productos con más salidas</h3>
      <div className="grafico-responsivo">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={datosGraficoMas}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              fill="#8884d8"
              label
            >
              {datosGraficoMas.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colores[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Gráfico: Productos con menos salidas */}
    <div className="grafico-container">
      <h3>Los 5 productos con menos salidas</h3>
      <div className="grafico-responsivo">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={datosGraficoMenos}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              fill="#8884d8"
              label
            >
              {datosGraficoMenos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colores[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

};

export default ReporteGraficos;
