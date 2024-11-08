// src/Components/Footer.jsx
import React from 'react';
import './Footer.css'; // Asegúrate de que este archivo CSS esté en la misma carpeta

const Footer = () => {
    return (
        <footer
            style={{
                position: 'relative',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '10px',
                textAlign: 'center',
                width: '100%', // Asegúrate de que el footer ocupe todo el ancho
            }}
            className="footer"
        >
            <div className="footer-content">
                <ul>
                    <li><a href="/contact">Contacto</a></li>
                </ul>
            </div>
            <div className="footer-bottom">
                © 2024 Gestion de Inventario. Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
