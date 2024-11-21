import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Asegúrate de tener tu Firebase configurado correctamente
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const Historial = () => {
    const [historial, setHistorial] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Función para obtener los registros del historial desde la base de datos
    const obtenerHistorial = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'Historial'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Ordenamos los productos por fecha (de más reciente a más antiguo)
            data.sort((a, b) => new Date(b.fecha.toDate()) - new Date(a.fecha.toDate()));
            setHistorial(data);
            setLoading(false);
        } catch (e) {
            console.error('Error al obtener historial:', e);
            setError('Error al cargar el historial.');
            setLoading(false);
        }
    };

    // Función para comparar dos fechas ignorando la hora
    const compararFechasSinHora = (fecha1, fecha2) => {
        const d1 = new Date(fecha1);
        const d2 = new Date(fecha2);

        // Convertimos ambas fechas a formato YYYY-MM-DD para ignorar las horas
        const fecha1Str =`${d1.getUTCFullYear()}-${(d1.getUTCMonth() + 1).toString().padStart(2, '0')}-${d1.getUTCDate().toString().padStart(2, '0')}`;
        const fecha2Str =`${d2.getUTCFullYear()}-${(d2.getUTCMonth() + 1).toString().padStart(2, '0')}-${d2.getUTCDate().toString().padStart(2, '0')}`;

        return fecha1Str === fecha2Str;
    };

    // Filtro del historial según el texto de búsqueda y fecha seleccionada
    const filtrarHistorial = (producto) => {
        const fechaProducto = producto.fecha.toDate(); // Convertir el timestamp a Date
        const fechaSeleccionada = fechaFiltro ? new Date(fechaFiltro) : null;

        // Verificamos si el nombre o tipo de producto incluye el texto de búsqueda (filtro)
        const filtroNombre = producto.producto.toLowerCase().includes(filtro.toLowerCase()) ||
                             producto.tipo.toLowerCase().includes(filtro.toLowerCase());
        
        // Si se seleccionó una fecha, filtramos también por la fecha (comparando solo la fecha, sin hora)
        const filtroFecha = fechaSeleccionada ? compararFechasSinHora(fechaProducto, fechaSeleccionada) : true;

        // Devolverá true si se cumple el filtro por nombre o tipo y, si hay un filtro de fecha, también debe coincidir.
        return filtroNombre && filtroFecha;
    };

    // Función para generar el reporte de Excel con los productos filtrados
    const generarReporte = () => {
        // Filtrar los productos según el filtro de búsqueda y fecha
        const productosFiltrados = historial.filter(filtrarHistorial);

        // Formatear las fechas correctamente antes de generar el reporte
        const productosConFechasFormateadas = productosFiltrados.map(item => ({
            ...item,
            fecha: new Date(item.fecha.toDate()).toLocaleString()
        }));

        // Generar el archivo Excel solo con los productos filtrados y sus fechas formateadas
        const ws = XLSX.utils.json_to_sheet(productosConFechasFormateadas);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historial de Productos');
        XLSX.writeFile(wb, 'Historial_Productos.xlsx');
    };

    useEffect(() => {
        obtenerHistorial();
    }, []);

    if (loading) return <div className="text-center">Cargando historial...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container-fluid" style={{ marginTop: '120px' }}>
            <h1 className="text-center my-4">Historial de Productos</h1>
            <div className="d-flex justify-content-between mb-3">
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control w-50"
                        placeholder="Buscar por producto, tipo o nombre"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <input
                        type="date"
                        className="form-control mx-2"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                    />
                </div>
                <button className="btn btn-success" onClick={generarReporte}>
                    Generar Reporte Excel
                </button>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad Movida</th>
                        <th>Cantidad Anterior</th>
                        <th>Cantidad Nueva</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {historial.length > 0 ? (
                        historial.filter(filtrarHistorial).map(registro => (
                            <tr key={registro.id}>
                                <td>{registro.producto}</td>
                                <td>{registro.tipo}{registro.accion}</td>
                                <td>{registro.cantidadMovida}</td>
                                <td>{registro.cantidadAnterior}</td>
                                <td>{registro.cantidadNueva}</td>
                                <td>{new Date(registro.fecha.toDate()).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No se encontraron registros.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Historial;
