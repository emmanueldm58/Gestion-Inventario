import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFavoritos, setProductosFavoritos] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await fetch('https://tiendaonline-79bfc-default-rtdb.firebaseio.com/productos.json');
                if (!response.ok) throw new Error('Error en la respuesta de la API');
                const data = await response.json();
                setProductos(data);
            } catch (error) {
                console.error('Error al obtener los productos:', error);
                setError('No se pudieron cargar los productos.');
            } finally {
                setLoading(false);
            }
        };

        obtenerProductos();
    }, []);

    const handleFavoriteClick = async (producto) => {
        const nuevosFavoritos = new Set(productosFavoritos);
        nuevosFavoritos.add(producto);
        setProductosFavoritos(nuevosFavoritos);

        try {
            const favoritosRef = ref(db, 'favoritos');
            await set(favoritosRef, Array.from(nuevosFavoritos));
        } catch (error) {
            console.error('Error al guardar favoritos en Firebase:', error);
        }
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const productosFiltrados = productos.filter((producto) =>
        normalizeString(producto.nombre.toLowerCase()).includes(normalizeString(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center">Cargando productos...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container" style={{ marginTop: '20px' }}>
            <h1 className="text-center my-4">Productos</h1>

            {/* Campo de búsqueda */}
            <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Tabla de productos */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Stock</th> {/* Nueva columna de Stock */}
                        <th>Editar</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosFiltrados.length > 0 ? (
                        productosFiltrados.map((producto) => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>{producto.stock}</td> {/* Mostrar stock del producto */}
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        placeholder="Editar"
                                        style={{ width: '80px' }}
                                    />
                                </td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm mx-1"
                                        onClick={() => console.log('Agregar', producto.nombre)}
                                    >
                                        Entrada
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm mx-1"
                                        onClick={() => handleFavoriteClick(producto)}
                                    >
                                        Salida
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm mx-1"
                                        onClick={() => console.log('Editar', producto.nombre)}
                                    >
                                        Editar producto
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">
                                No se encontraron productos que coincidan con la búsqueda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Productos;
