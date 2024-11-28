import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Asegúrate de tener tu Firebase configurado correctamente
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import './Historial.css';

const Historial = () => {
    const [historial, setHistorial] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Función para comparar fechas (sin hora) basadas en cadenas de texto
    const compararFechasSinHora = (fecha1, fecha2) => {
        if (!fecha1 || !fecha2) {
            return false;  // Si alguna de las fechas es inválida, retornamos false
        }
    
        const fecha1Str = fecha1.split(' ')[0]; // Extraer "YYYY-MM-DD" de "YYYY-MM-DD HH:mm:ss"
        const fecha2Str = fecha2.split(' ')[0];
        return fecha1Str === fecha2Str;
    };
    

    // Filtro del historial según texto de búsqueda y fecha seleccionada
    const filtrarHistorial = (producto) => {
        const filtroTexto = filtro.toLowerCase();
        const fechaSeleccionada = fechaFiltro ? fechaFiltro : null;

        // Validar que el producto tenga las propiedades requeridas
        const cumpleTexto = (
            (producto.producto?.toLowerCase().includes(filtroTexto) || '') ||
            (producto.accion?.toLowerCase().includes(filtroTexto) || '')
        );

        const cumpleFecha = fechaSeleccionada
            ? compararFechasSinHora(producto.fecha, fechaSeleccionada)
            : true;

        return cumpleTexto && cumpleFecha;
    };

    // Función para obtener los registros del historial desde la base de datos
    const obtenerHistorial = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'Historial'));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Ordenar los datos por fecha (de más reciente a más antiguo)
            data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setHistorial(data);
            setLoading(false);
        } catch (e) {
            console.error('Error al obtener historial:', e);
            setError('Error al cargar el historial.');
            setLoading(false);
        }
    };

    // Función para generar el reporte de Excel con los productos filtrados
    const generarReporte = () => {
        // Filtrar los productos según el filtro de búsqueda y fecha
        const productosFiltrados = historial.filter(filtrarHistorial);

        // Generar el archivo Excel solo con los productos filtrados
        const ws = XLSX.utils.json_to_sheet(productosFiltrados);
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
                        placeholder="Buscar por producto o acción"
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
            <div className="table-responsive">
    <table className="table table-bordered tabla-ajustada">
        <thead>
            <tr>
                <th style={{ width: '15%' }}>Usuario</th>
                <th style={{ width: '20%' }}>Producto</th>
                <th style={{ width: '20%' }}>Cantidad Movida/Precio</th>
                <th style={{ width: '15%' }}>Cantidad Anterior</th>
                <th style={{ width: '15%' }}>Cantidad Nueva</th>
                <th style={{ width: '10%' }}>Acción</th>
                <th style={{ width: '15%' }}>Fecha</th>
            </tr>
        </thead>
        <tbody>
            {historial.length > 0 ? (
                historial.filter(filtrarHistorial).map((registro) => (
                    <tr key={registro.id}>
                        <td>{registro.user}</td>
                        <td>{registro.producto}</td>
                        <td>{registro.cantidadMovida || registro.precio || registro.cantidad}</td>
                        <td>{registro.cantidadAnterior || "N/A"}</td>
                        <td>{registro.cantidadNueva || registro.cantidad}</td>
                        <td>{registro.accion}</td>
                        <td>{registro.fecha}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="7" className="text-center">
                        No se encontraron registros.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>


        </div>
    );
    
};
export default Historial;
