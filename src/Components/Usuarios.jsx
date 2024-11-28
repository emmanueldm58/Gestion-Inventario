import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc  } from "firebase/firestore";
import { db, auth } from "../firebase";
import { deleteUser, getAuth } from "firebase/auth";
import './Usuarios.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
 

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtener usuarios desde Firestore
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
    // Si el permiso "lector" se desmarca, desmarcar todos los demás permisos
    if (!permisosActualizados.lector) {
        permisosActualizados = {
            lector: false,
            registrarMovimiento: false,
            editar: false,
            eliminar: false,
            addProducto: false
        };
    }
    
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

    // Cambiar rol en Firebase
    const handleRoleChange = async (userId, nuevoRol) => {
        try {
            const userRef = doc(db, "Users", userId);
            await updateDoc(userRef, { role: nuevoRol });

            // Actualizar la lista local
            setUsuarios(usuarios.map(u =>
                u.id === userId ? { ...u, role: nuevoRol } : u
            ));

            alert(`Rol actualizado a '${nuevoRol}' correctamente.`);
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            alert("Hubo un error al actualizar el rol.");
        }
    };

    // Eliminar usuario de Firebase
    const eliminarUsuario = async (userId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await deleteDoc(doc(db, "Users", userId));
                setUsuarios(usuarios.filter(usuario => usuario.id !== userId));
                alert("Usuario eliminado con éxito.");
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                alert("Hubo un error al eliminar el usuario.");
            }
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;

    return (
        <div className="container-fluid" style={{ marginTop: '60px', padding: '20px' }}>
          <h2 className="text-center my-4">Gestión de Usuarios</h2>
          <div className="table-responsive">
            <table className="table table-bordered tabla-ajustada">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Lector</th>
                  <th>Registrar Movimiento</th>
                  <th>Editar</th>
                  <th>Eliminar</th>
                  <th>Registrar Producto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
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
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarUsuario(usuario.id)}
                        >
                          Eliminar
                        </button>
                        <select
                          className="form-select form-select-sm mt-2"
                          value={usuario.role || "user"}
                          onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
      
};

export default Usuarios;
