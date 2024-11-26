import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Asegúrate de que estas referencias sean correctas
import { doc, setDoc } from "firebase/firestore"; // Para manejar Firestore
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Para mostrar el modal
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  // Manejo del login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirige al home si inicia sesión exitosamente
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  // Manejo del registro de usuario desde el modal
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, nuevoUsuario.email, nuevoUsuario.password);
      const user = userCredential.user; // Obtenemos el objeto del usuario registrado

      // Registrar el usuario en Firestore
      const userDocRef = doc(db, "Users", user.uid);
      await setDoc(userDocRef, {
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: "user", // Rol por defecto
        permisos: {
          registrarMovimiento: false,
          lector: false,
          editar: false,
          eliminar: false,
          addProducto: false
        },
        fechaRegistro: new Date().toISOString(), // Fecha actual
      });

      alert("Usuario registrado exitosamente");
      setShowModal(false); // Cerrar el modal
      setNuevoUsuario({ nombre: "", email: "", password: "" }); // Limpiar formulario
    } catch (err) {
      setError("Error al registrar el usuario: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>

      {/* Enlace para abrir el modal de registro */}
      <div className="signup-option">
        <p>¿No tienes cuenta?</p>
        <button onClick={() => setShowModal(true)}>Crear cuenta</button>
      </div>

      {/* Modal de Registro */}
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
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Crear Cuenta</h3>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  value={nuevoUsuario.nombre}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                  required
                />
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit">Registrar</button>
            </form>
            <button
              className="btn-close-modal"
              onClick={() => setShowModal(false)}
              style={{ marginTop: "10px", width: "100%" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
