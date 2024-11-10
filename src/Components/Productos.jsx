import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Asegúrate de que este import esté correcto
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cantidad, setCantidad] = useState({});
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        cantidad: 0,  // Aseguramos que la cantidad sea un número
        precio: 0     // Aseguramos que el precio sea un número
    });
    const [showModal, setShowModal] = useState(false); // Modal para agregar nuevo producto
    const [showMovimientoModal, setShowMovimientoModal] = useState(false); // Modal para registrar movimiento
    const [showEditarModal, setShowEditarModal] = useState(false); // Modal para editar producto
    const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Producto seleccionado para editar
    const [movimiento, setMovimiento] = useState({ cantidad: 0, tipo: '', fecha: Timestamp.now() }); // Datos del movimiento

    // Función para obtener productos de Firestore
    const obtenerProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "Productos"));
            const dataFirebase = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            //console.log("Datos consultados de Firebase:", dataFirebase);
            setProductos(dataFirebase);
            setLoading(false);
        } catch (e) {
            console.error("Error al consultar los datos en Firebase: ", e);
            setError('Error al obtener productos.');
            setLoading(false);
        }
    };

    // Llamar a la función al cargar el componente
    useEffect(() => {
        obtenerProductos();
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCantidadChange = (e, id) => {
        setCantidad({
            ...cantidad,
            [id]: e.target.value
        });
    };

    const handleNuevoProductoChange = (e) => {
        const { name, value } = e.target;
        // Aseguramos que los valores de cantidad y precio sean números
        setNuevoProducto({
            ...nuevoProducto,
            [name]: name === 'cantidad' || name === 'precio' ? parseFloat(value) : value
        });
    };

    const handleSubmitNuevoProducto = async (e) => {
        e.preventDefault();
        const confirmacion = window.confirm("¿Confirma que el producto que ingresaste este bien?");
        if (!confirmacion) {
            return; // Si el usuario cancela, no hace nada
        }
        try {
            // Agregar el nuevo producto a Firestore, asegurándonos que cantidad y precio son números
            await addDoc(collection(db, "Productos"), {
                ...nuevoProducto,
                cantidad: parseFloat(nuevoProducto.cantidad), // Aseguramos que la cantidad sea un número
                precio: parseFloat(nuevoProducto.precio),     // Aseguramos que el precio sea un número
                fechaRegistro: Timestamp.now() // Guardamos la fecha actual en Firestore
            });
            setShowModal(false); // Cierra el modal
            setNuevoProducto({
                nombre: '',
                cantidad: 0,
                precio: 0
            });
            console.log('Producto agregado');
            // Recargar los productos después de agregar uno nuevo
            obtenerProductos(); // Llamamos a obtenerProductos para actualizar la lista
        } catch (e) {
            console.error("Error al agregar el producto: ", e);
        }
    };

    const handleRegistrarMovimiento = async () => {
        if (!productoSeleccionado) return;
    
        // Convertir la cantidad a número
        const cantidadMovida = parseFloat(movimiento.cantidad);
        if (isNaN(cantidadMovida) || cantidadMovida <= 0) {
            alert('Por favor ingrese una cantidad válida.');
            return;
        }
    
        // Confirmación antes de proceder con el movimiento
        const confirmAction = window.confirm(`¿Estás seguro de que deseas ${movimiento.tipo === 'entrada' ? 'agregar' : 'restar'} ${cantidadMovida} unidades?`);
        if (!confirmAction) return;  // Si el usuario cancela, no se realiza el movimiento.
    
        try {
            // Registrar movimiento en la colección Historial
            const nuevoMovimiento = {
                ...movimiento,
                producto: productoSeleccionado.nombre,
                productoId: productoSeleccionado.id,
                cantidadAnterior: productoSeleccionado.cantidad, // Cantidad antes del movimiento
                cantidadMovida,
                cantidadNueva: movimiento.tipo === 'entrada' 
                    ? productoSeleccionado.cantidad + cantidadMovida
                    : productoSeleccionado.cantidad - cantidadMovida,
            };
            await addDoc(collection(db, "Historial"), nuevoMovimiento);
    
            // Actualizar la cantidad del producto
            let nuevaCantidad = productoSeleccionado.cantidad;
            if (movimiento.tipo === 'entrada') {
                nuevaCantidad += cantidadMovida;
            } else if (movimiento.tipo === 'salida') {
                nuevaCantidad -= cantidadMovida;
            }
    
            // Verificar que la cantidad no sea negativa
            if (nuevaCantidad < 0) {
                alert('La cantidad no puede ser negativa.');
                return;
            }
    
            // Actualizar el producto en la base de datos
            const productoRef = doc(db, "Productos", productoSeleccionado.id);
            await updateDoc(productoRef, { cantidad: nuevaCantidad });
    
            // Resetear el formulario y cerrar el modal
            setShowMovimientoModal(false);
            setMovimiento({ cantidad: 0, tipo: '', fecha: Timestamp.now() });
            obtenerProductos();  // Recargar los productos después del movimiento
    
        } catch (e) {
            console.error("Error al registrar el movimiento: ", e);
        }
    };
    

    const handleEditarProducto = async () => {
        const confirmacion = window.confirm("¿Estás seguro de que deseas editar este producto?");
        if (!confirmacion) {
            return; // Si el usuario cancela, no hace nada
        }
    
        try {
            const productoRef = doc(db, "Productos", productoSeleccionado.id);
            await updateDoc(productoRef, {
                nombre: productoSeleccionado.nombre,
                cantidad: parseFloat(productoSeleccionado.cantidad),
                precio: parseFloat(productoSeleccionado.precio)
            });
    
            setShowEditarModal(false); // Cierra el modal
            obtenerProductos(); // Recargar los productos después de editar
        } catch (e) {
            console.error("Error al editar el producto: ", e);
        }
    };
    

    const handleEntrada = (producto) => {
        setProductoSeleccionado(producto);
        setShowMovimientoModal(true);
    };

    const handleSalida = (producto) => {
        setProductoSeleccionado(producto);
        setShowMovimientoModal(true);
    };

    const handleEditar = (producto) => {
        setProductoSeleccionado(producto);
        setShowEditarModal(true);
    };

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

            {/* Botón Nuevo Producto */}
            <div className="d-flex justify-content-end mb-3">
                <button 
                    className="btn btn-success" 
                    onClick={() => setShowModal(true)}  // Aseguramos que el modal se abra correctamente
                >
                    Nuevo Producto
                </button>
            </div>

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
                    {productosFiltrados.length > 0 ? (
                        productosFiltrados.map((producto) => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>$ {producto.precio}</td>
                                <td>{producto.cantidad}</td>
                              
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm mx-1"
                                        onClick={() => handleEntrada(producto)}
                                    >
                                        Movimiento
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm mx-1"
                                        onClick={() => handleEditar(producto)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">
                                No se encontraron productos.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal para agregar nuevo producto */}
            {showModal && (
                <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-content" style={{ margin: '100px auto', padding: '20px', backgroundColor: '#fff', width: '80%', maxWidth: '500px' }}>
                        <h3>Nuevo Producto</h3>
                        <form onSubmit={handleSubmitNuevoProducto}>
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    name="nombre"
                                    value={nuevoProducto.nombre}
                                    onChange={handleNuevoProductoChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="cantidad" className="form-label">Cantidad</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="cantidad"
                                    name="cantidad"
                                    value={nuevoProducto.cantidad}
                                    onChange={handleNuevoProductoChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="precio" className="form-label">Precio</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="precio"
                                    name="precio"
                                    value={nuevoProducto.precio}
                                    onChange={handleNuevoProductoChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Agregar Producto</button>
                            <button 
                                type="button" 
                                className="btn btn-secondary mx-2" 
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para registrar movimiento */}
            {showMovimientoModal && (
                <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-content" style={{ margin: '100px auto', padding: '20px', backgroundColor: '#fff', width: '80%', maxWidth: '500px' }}>
                        <h3>Registrar Movimiento</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleRegistrarMovimiento(); }}>
                            <div className="mb-3">
                                <label htmlFor="cantidad" className="form-label">Cantidad</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="cantidad"
                                    value={movimiento.cantidad}
                                    onChange={(e) => setMovimiento({ ...movimiento, cantidad: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="tipo" className="form-label">Tipo</label>
                                <select
                                    id="tipo"
                                    className="form-select"
                                    value={movimiento.tipo}
                                    onChange={(e) => setMovimiento({ ...movimiento, tipo: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione un tipo de movimiento</option>
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Registrar Movimiento</button>
                            <button 
                                type="button" 
                                className="btn btn-secondary mx-2" 
                                onClick={() => setShowMovimientoModal(false)}
                            >
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar producto */}
            {showEditarModal && (
                <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-content" style={{ margin: '100px auto', padding: '20px', backgroundColor: '#fff', width: '80%', maxWidth: '500px' }}>
                        <h3>Editar Producto</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleEditarProducto(); }}>
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={productoSeleccionado.nombre}
                                    onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="cantidad" className="form-label">Cantidad</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="cantidad"
                                    value={productoSeleccionado.cantidad}
                                    onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, cantidad: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="precio" className="form-label">Precio</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="precio"
                                    value={productoSeleccionado.precio}
                                    onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, precio: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Actualizar Producto</button>
                            <button 
                                type="button" 
                                className="btn btn-secondary mx-2" 
                                onClick={() => setShowEditarModal(false)}
                            >
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
