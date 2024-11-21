// src/Components/Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Ajusta la ruta si es necesario
import './Navbar.css';

const Navbar = ({ role }) => {
  const [menuActive, setMenuActive] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const handleLinkClick = () => {
    setMenuActive(false); // Cierra el menú al hacer clic en un enlace
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirigir o manejar después del logout si es necesario
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <header className={`header ${visible ? '' : 'hide'}`}>
      <Link to='/' className='logo'></Link>
      <div className="menu-toggle" onClick={toggleMenu}>
        ☰
      </div>
      <nav className={`navbar ${menuActive ? 'active' : ''}`}>
        <Link to="/" onClick={handleLinkClick}>Productos</Link>
       {/* {role === 'admin' && (
          <Link to="/administrador" onClick={handleLinkClick}>Admin</Link>
        )}*/}
        {role === 'admin' && (
          <Link to="/historial" onClick={handleLinkClick}>Historial</Link>
        )}
        {role === 'admin' && (
          <Link to="/usuarios" onClick={handleLinkClick}>Usuarios</Link>
        )}

        {/* Agregar el botón de cerrar sesión */}
        <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      </nav>
    </header>
  );
};

export default Navbar;
