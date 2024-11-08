// Navbar.jsx


import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [menuActive, setMenuActive] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
    const [visible, setVisible] = useState(true);

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };

    const handleLinkClick = () => {
        setMenuActive(false); // Cierra el menú al hacer clic en un enlace
    };
    ///
  

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
            <Link to='/' className='logo'>
                
            </Link>
            <div className="menu-toggle" onClick={toggleMenu}>
                ☰ 
            </div>
            <nav className={`navbar ${menuActive ? 'active' : ''}`}>

                <Link to="/" onClick={handleLinkClick}>Productos</Link>
                <Link to="/administrador" onClick={handleLinkClick}>Admin</Link>
                
            </nav>
        </header>
    );
};

export default Navbar;
