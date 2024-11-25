import React, { useEffect, useState } from 'react';
import './Productos.css';
import { auth, db } from '../firebase';
import { collection, getDocs, setDoc, getDoc, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx'; // Para generar el reporte de Excel
import { onAuthStateChanged } from "firebase/auth";

const Productos = ({ role, permisos }) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        cantidad: 0,
        precio: 0,
    });
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [productoEditar, setProductoEditar] = useState({
        nombre: '',
        cantidad: 0,
        precio: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [showMovimientoModal, setShowMovimientoModal] = useState(false);

    const [productoSeleccionado, setProductoSeleccionado] = useState({
        nombre: '',
        cantidad: 0,
        precio: 0,
    });
    const [movimiento, setMovimiento] = useState({ cantidad: 0, accion: '', fecha: new Date().toISOString().replace('T', ' ').slice(0, 19) });
    const fechaRegistro = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const [userA, setUser] = useState({});

    // Obtener los productos desde Firestore
    const obtenerProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'Productos'));
            const dataFirebase = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProductos(dataFirebase);
            setLoading(false);
        } catch (e) {
            console.error('Error al consultar los datos en Firebase: ', e);
            setError('Error al obtener productos.');
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerProductos();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                verificarYRegistrarUsuario(user);
            }
            setUser(user)
        });
        return () => unsubscribe();
    }, []);

    const verificarYRegistrarUsuario = async (user) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    nombre: user.displayName || "Usuario",
                    email: user.email,
                    role: "user", // Rol por defecto
                    permisos: {
                        registrarMovimiento: false,
                        lector: false,
                        editar: false,
                        eliminar: false,
                        addProducto: false
                    }, // Permisos básicos por defecto
                    fechaRegistro: fechaRegistro,
                });
            }

        } catch (e) {
            console.error("Error al verificar/registrar usuario: ", e);
        }
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSubmitEditarProducto = async (e) => {
        e.preventDefault();

        try {
            // Crear una copia profunda del producto seleccionado antes de la edición
            const productoOriginal = productoEditar;
            // Guardar el estado "antes" de la edición en el historial
            await addDoc(collection(db, 'Historial'), {
                user: userA?.email || 'Usuario desconocido', // Usuario autenticado
                accion: 'Producto Antes de Editar',
                producto: productoOriginal.nombre,
                productoId: productoOriginal.id,
                cantidad: parseFloat(productoOriginal.cantidad),
                precio: parseFloat(productoOriginal.precio),
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
            });
            // Realizar los cambios en productoSeleccionado (esto es lo que el usuario editó)
            const productoEditado = {
                ...productoSeleccionado,
                cantidad: Number(productoSeleccionado.cantidad),
                precio: Number(productoSeleccionado.precio),
            };

            // Actualizar el producto en la base de datos con los valores editados
            const productoRef = doc(db, "Productos", productoSeleccionado.id);
            await updateDoc(productoRef, {
                nombre: productoSeleccionado.nombre,
                cantidad: productoEditado.cantidad,
                precio: productoEditado.precio,
            });


            // Guardar el estado "después" de la edición en el historial
            await addDoc(collection(db, 'Historial'), {
                user: userA?.email || 'Usuario desconocido', // Usuario autenticado
                accion: 'Producto Después de Editar',
                producto: productoEditado.nombre,
                productoId: productoEditado.id,
                cantidad: parseFloat(productoEditado.cantidad),
                precio: parseFloat(productoEditado.precio),
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
            });

            // Confirmar la actualización y cerrar el modal
            alert('Producto actualizado con éxito.');
            setShowEditarModal(false);
            obtenerProductos(); // Recargar productos
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert("Hubo un error al actualizar el producto.");
        }
    };




    const handleEliminarProducto = async (producto) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar el producto: ${producto.nombre}?`);
        if (!confirmacion) return;

        try {
            // Registrar la acción en el historial
            await addDoc(collection(db, 'Historial'), {
                user: userA.email,
                accion: 'Eliminar',
                producto: producto.nombre,
                productoId: producto.id,
                cantidad: parseFloat(producto.cantidad),
                precio: parseFloat(producto.precio),
                fecha: fechaRegistro,
            });

            // Eliminar el producto de Firestore
            const productoRef = doc(db, 'Productos', producto.id);
            await deleteDoc(productoRef);

            obtenerProductos(); // Recargar los productos después de eliminar
        } catch (e) {
            console.error('Error al eliminar el producto: ', e);
        }
    };

    const handleGenerarReporte = () => {
        const ws = XLSX.utils.json_to_sheet(productos); // Convertir productos a hoja de Excel
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');
        XLSX.writeFile(wb, 'productos_report_Stock.xlsx'); // Descargar archivo Excel
    };

    const handleNuevoProductoChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmitNuevoProducto = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'Productos'), {
                ...nuevoProducto,
                user: userA.email,
                cantidad: parseFloat(nuevoProducto.cantidad),
                precio: parseFloat(nuevoProducto.precio),
                fechaRegistro: fechaRegistro,
            });

            // Registrar la acción en el historial
            await addDoc(collection(db, 'Historial'), {
                user: userA.email,
                accion: 'Producto Nuevo',
                producto: nuevoProducto.nombre,
                cantidad: nuevoProducto.cantidad,
                precio: nuevoProducto.precio,
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
            });
            setNuevoProducto({ nombre: '', cantidad: 0, precio: 0 });
            setShowModal(false);
            obtenerProductos();
        } catch (e) {
            console.error('Error al agregar producto: ', e);
        }
    };

    const handleMovimientoChange = (e) => {
        const { name, value } = e.target;
        setMovimiento((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleRegistrarMovimiento = async () => {
        if (!userA.email) {
            alert('Por favor, inicia sesión para realizar el movimiento.');
            return;
        }
        if (!productoSeleccionado) return;

        const cantidadMovida = movimiento.cantidad;

        // Verificar que la cantidad no sea negativa
        if (cantidadMovida < 0) {
            alert('La cantidad no puede ser negativa.');
            return;
        }

        if (isNaN(cantidadMovida) || cantidadMovida <= 0) {
            alert('Por favor ingrese una cantidad válida.');
            return;
        }

        // Confirmación antes de proceder con el movimiento
        const confirmAction = window.confirm(`¿Estás seguro de que deseas ${movimiento.accion === 'entrada' ? 'agregar' : 'sacar'} ${cantidadMovida} unidades?`);
        if (!confirmAction) return;  // Si el usuario cancela, no se realiza el movimiento.
         try {

            // Registrar movimiento en la colección Historial
            const nuevoMovimiento = {
                ...movimiento,
                user: userA.email,
                cantidad: parseFloat(cantidadMovida),
                producto: productoSeleccionado.nombre,
                productoId: productoSeleccionado.id,
                cantidadAnterior: parseFloat(productoSeleccionado.cantidad), // Cantidad antes del movimiento

                cantidadNueva: movimiento.accion === 'entrada'
                    ? parseFloat(productoSeleccionado.cantidad) + parseFloat(cantidadMovida)
                    : parseFloat(productoSeleccionado.cantidad) - parseFloat(cantidadMovida),
            };
            await addDoc(collection(db, "Historial"), nuevoMovimiento);

            // Actualizar el producto en la base de datos
            const productoRef = doc(db, "Productos", productoSeleccionado.id);
            await updateDoc(productoRef, { cantidad: nuevoMovimiento.cantidadNueva });

            // Resetear el formulario y cerrar el modal
            setShowMovimientoModal(false);
            setMovimiento({ cantidad: 0, accion: '', fecha: new Date().toISOString().replace('T', ' ').slice(0, 19) });
            obtenerProductos();  // Recargar los productos después del movimiento

        } catch (e) {
            console.error("Error al registrar el movimiento: ", e);
        }
    };




    if (loading) return <div className="text-center">Cargando productos...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container" style={{ marginTop: '20px' }}>
            <h1 className="text my-4">Productos</h1>

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

            {/* Botón Nuevo Producto y Generar Reporte */}
            <div className="button-group">
                {permisos.addProducto && (

                    <button className="btn btn-success" onClick={() => setShowModal(true)}>
                        Nuevo Producto
                    </button>

                )}
                {role === 'admin' && (

                    <button className="btn btn-info" onClick={handleGenerarReporte}>
                        Generar Reporte Excel
                    </button>

                )}
            </div>
            {/* Tabla de productos */}
            {permisos.lector ? (
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
                                    <td>{producto.precio}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-secondary btn-sm dropdown-toggle"
                                                type="button"
                                                id={`dropdownMenu-${producto.id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                Opciones
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${producto.id}`}>
                                                {permisos.registrarMovimiento && (
                                                    <>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setProductoSeleccionado(producto);
                                                                    setShowMovimientoModal(true);
                                                                }}
                                                            >
                                                                Movimiento
                                                            </button>
                                                        </li>
                                                    </>
                                                )}

                                                {permisos.editar && (
                                                    <>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setProductoSeleccionado(producto);
                                                                    setProductoEditar(producto);
                                                                    setShowEditarModal(true);
                                                                }}
                                                            >
                                                                Editar
                                                            </button>
                                                        </li>
                                                    </>
                                                )}
                                                {permisos.eliminar && (
                                                    <>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleEliminarProducto(producto)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
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
            ) : (
                <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                    <h2>Acceso restringido</h2>
                    <p>No tienes los permisos necesarios para ver la tabla de productos.</p>
                </div>
            )}
            {/* Modal para editar producto */}
            {
                showEditarModal && (
                    <div className="modal" onClick={() => setShowEditarModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Editar Producto</h3>
                            <form onSubmit={handleSubmitEditarProducto}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={productoSeleccionado.nombre}
                                        onChange={(e) =>
                                            setProductoSeleccionado({
                                                ...productoSeleccionado,
                                                nombre: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="cantidad" className="form-label">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="cantidad"
                                        name="cantidad"
                                        value={productoSeleccionado.cantidad}
                                        onChange={(e) =>
                                            setProductoSeleccionado({
                                                ...productoSeleccionado,
                                                cantidad: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="precio" className="form-label">
                                        Precio
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="precio"
                                        name="precio"
                                        value={productoSeleccionado.precio}
                                        onChange={(e) =>
                                            setProductoSeleccionado({
                                                ...productoSeleccionado,
                                                precio: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Guardar Cambios
                                </button>
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
                )
            }

            {/* Modal para nuevo producto */}
            {
                showModal && (
                    <div className="modal" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Nuevo Producto</h3>
                            <form onSubmit={handleSubmitNuevoProducto}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">
                                        Nombre
                                    </label>
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
                                    <label htmlFor="cantidad" className="form-label">
                                        Cantidad
                                    </label>
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
                                    <label htmlFor="precio" className="form-label">
                                        Precio
                                    </label>
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
                                <button type="submit" className="btn btn-primary">
                                    Agregar Producto
                                </button>
                                <button type="button" className="btn btn-secondary mx-2" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal para registrar movimiento */}
            {
                showMovimientoModal && (
                    <div className="modal" onClick={() => setShowMovimientoModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Registrar Movimiento</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleRegistrarMovimiento();
                                }}
                            >
                                <p>Producto: {productoSeleccionado?.nombre}</p>
                                
                                <div className="mb-3">
                                    <label htmlFor="tipo" className="form-label">
                                        Tipo de Movimiento
                                    </label>
                                    <select
                                        id="accion"
                                        name="accion"
                                        className="form-control"
                                        value={movimiento.accion}
                                        onChange={handleMovimientoChange}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="entrada">Entrada</option>
                                        <option value="salida">Salida</option>
                                    </select>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="cantidad" className="form-label">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="cantidad"
                                        name="cantidad"
                                        value={movimiento.cantidad}
                                        onChange={(e) => {
                                            // Obtener el valor ingresado
                                            movimiento.cantidad = parseInt(e.target.value, 10);
                    
                                            // Validar que la cantidad no sea mayor al stock disponible
                                            if (movimiento.accion === "salida" && movimiento.cantidad > productoSeleccionado.cantidad) {
                                                movimiento.cantidad = productoSeleccionado.cantidad; // Limitar la cantidad a la disponible
                                            }
                    
                                            // Actualizar el estado con la cantidad validada
                                            handleMovimientoChange({
                                                target: {
                                                    name: "cantidad",
                                                    value: movimiento.cantidad,
                                                },
                                            });
                                        }}
                                        max={movimiento.accion === "salida" ? productoSeleccionado.cantidad : undefined}
                                        required
                                    />
                                </div>


                                <button type="submit" className="btn btn-primary">
                                    Registrar Movimiento
                                </button>
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

                )
            }
        </div >
    );
};

export default Productos;
