import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Asegúrate de tener tu Firebase configurado correctamente
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const Administrador = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [productoEditando, setProductoEditando] = useState(null);
    const [historialProductos, setHistorialProductos] = useState([]);
    const [filtro, setFiltro] = useState('');

    const obtenerProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'Productos'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProductos(data);
            setLoading(false);
        } catch (e) {
            console.error('Error al obtener productos:', e);
            setError('Error al cargar productos.');
            setLoading(false);
        }
    };

    const obtenerHistorialProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'HistorialProductos'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistorialProductos(data);
        } catch (e) {
            console.error('Error al obtener historial de productos:', e);
        }
    };

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                await deleteDoc(doc(db, 'Productos', id));
                setProductos(productos.filter(producto => producto.id !== id));
                alert("Producto eliminado con éxito");
            } catch (e) {
                console.error('Error al eliminar producto:', e);
                alert("Hubo un error al eliminar el producto");
            }
        }
    };

    const moverProducto = (id) => {
        // Lógica para mover el producto a otra categoría o estado
        console.log(`Producto ${id} movido`);
    };

    const editarProducto = (producto) => {
        setProductoEditando(producto);
    };

    const guardarCambios = async () => {
        if (productoEditando) {
            try {
                await updateDoc(doc(db, 'Productos', productoEditando.id), productoEditando);
                setProductoEditando(null);
                obtenerProductos();  // Volver a cargar los productos
                alert("Producto actualizado con éxito");
            } catch (e) {
                console.error('Error al actualizar producto:', e);
                alert("Hubo un error al actualizar el producto");
            }
        }
    };

    const generarReporte = () => {
        const ws = XLSX.utils.json_to_sheet(productos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte de Productos");
        XLSX.writeFile(wb, "Reporte_Productos.xlsx");
    };

    const filtrarProductos = (producto) => {
        return producto.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
               producto.precio.toString().includes(filtro);
    };

    useEffect(() => {
        obtenerProductos();
    }, []);

    if (loading) return <div className="text-center">Cargando productos...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container-fluid" style={{ marginTop: '120px' }}>
            <h1 className="text-center my-4">Administrador</h1>

            {/* Filtro de búsqueda */}
            <div className="d-flex justify-content-between mb-3">
                <input 
                    type="text" 
                    className="form-control w-50" 
                    placeholder="Buscar producto..." 
                    value={filtro} 
                    onChange={(e) => setFiltro(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={generarReporte}>
                    Generar Reporte Excel
                </button>
            </div>

            {/* Tabla de productos */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.filter(filtrarProductos).length > 0 ? (
                        productos.filter(filtrarProductos).map(producto => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>$ {producto.precio}</td>
                                <td>{producto.cantidad}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm mx-1"
                                        onClick={() => eliminarProducto(producto.id)}
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm mx-1"
                                        onClick={() => moverProducto(producto.id)}
                                    >
                                        Mover
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm mx-1"
                                        onClick={() => editarProducto(producto)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No se encontraron productos.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal de edición de producto */}
            {productoEditando && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Producto</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setProductoEditando(null)} 
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={productoEditando.nombre} 
                                        onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Precio</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={productoEditando.precio} 
                                        onChange={(e) => setProductoEditando({ ...productoEditando, precio: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Cantidad</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={productoEditando.cantidad} 
                                        onChange={(e) => setProductoEditando({ ...productoEditando, cantidad: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setProductoEditando(null)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={guardarCambios}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Administrador;
