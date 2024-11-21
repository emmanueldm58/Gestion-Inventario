import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Asumiendo que ya tienes la configuración correcta
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './Usuarios.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: "",
        email: "",
        password: "",
        permisos: {
            registrarMovimiento: false,
            lector: false,
            editar: false,
            eliminar: false,
            addProducto: false,
        },
    });

    // Obtener usuarios desde la base de datos
    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Users"));
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsuarios(usersData);
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            } finally {
                setLoading(false);
            }
        };
        obtenerUsuarios();
    }, []);

    // Actualizar permisos en Firebase
    const handleUpdatePermissions = async (userId, permisosActualizados) => {
        try {
            const userRef = doc(db, "Users", userId);
            await updateDoc(userRef, { permisos: permisosActualizados });
            alert("Permisos actualizados correctamente.");
        } catch (error) {
            console.error("Error al actualizar permisos:", error);
            alert("Hubo un error al actualizar los permisos.");
        }
    };

    // Manejar cambios en los permisos
    const handleCheckboxChange = (userId, permiso) => {
        const usuariosActualizados = usuarios.map(usuario => {
            if (usuario.id === userId) {
                const permisosActualizados = usuario.permisos || {};
                permisosActualizados[permiso] = !permisosActualizados[permiso]; // Alternar permiso
                handleUpdatePermissions(userId, permisosActualizados); // Guardar en Firebase
                return { ...usuario, permisos: permisosActualizados };
            }
            return usuario;
        });
        setUsuarios(usuariosActualizados);
    };

    // Función para agregar un nuevo usuario
    const handleAddUser = async (e) => {
        e.preventDefault();

        try {
            // Crear el nuevo usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                nuevoUsuario.email,
                nuevoUsuario.password // Asegúrate de agregar el campo "password" en tu formulario
            );

            // Obtener la información del usuario creado
            const user = userCredential.user;
            console.log('Usuario registrado:', user);

            // Agregar el usuario a la base de datos Firestore (sin iniciar sesión con él)
            await setDoc(doc(db, "Users", user.uid), {
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                role: 'user', // Asignar rol por defecto
                permisos: nuevoUsuario.permisos, // Guardar permisos
            });

            // Cerrar el modal después de guardar el usuario
            setShowModal(false);
            setNuevoUsuario({ nombre: '', email: '', password: '', permisos: {} }); // Limpiar los campos del formulario

        } catch (error) {
            console.error('Error al registrar usuario:', error.message);
            alert('Error al registrar el usuario: ' + error.message);
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;

    return (
        <div style={{ padding: "20px", marginTop: "60px" }}>
            <h2>Gestión de Usuarios</h2>
            <div className="button-group">
                {/* <button
                    className="btn btn-primary mb-3"
                    onClick={() => setShowModal(true)}
                >
                    Nuevo Usuario
                </button> */}
                
            </div>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Lector</th>
                            <th>Registrar Movimiento</th>
                            <th>Editar</th>
                            <th>Eliminar</th>
                            <th>Registrar Producto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id}>
                                <td>{usuario.nombre || "Sin nombre"}</td>
                                <td>{usuario.email || "Sin email"}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={usuario.permisos?.lector || false}
                                        onChange={() => handleCheckboxChange(usuario.id, "lector")}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={usuario.permisos?.registrarMovimiento || false}
                                        onChange={() => handleCheckboxChange(usuario.id, "registrarMovimiento")}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={usuario.permisos?.editar || false}
                                        onChange={() => handleCheckboxChange(usuario.id, "editar")}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={usuario.permisos?.eliminar || false}
                                        onChange={() => handleCheckboxChange(usuario.id, "eliminar")}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={usuario.permisos?.addProducto || false}
                                        onChange={() => handleCheckboxChange(usuario.id, "addProducto")}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal para agregar nuevo usuario */}
            {showModal && (
                <div
                    className="modal"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "400px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Agregar Nuevo Usuario</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={nuevoUsuario?.nombre || ""}
                                    onChange={(e) =>
                                        setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={nuevoUsuario?.email || ""}
                                    onChange={(e) =>
                                        setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={nuevoUsuario.password}
                                    onChange={(e) =>
                                        setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
