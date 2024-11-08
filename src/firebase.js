// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Tu configuración de Firebase (que obtuviste al crear el proyecto)
const firebaseConfig = {
    apiKey: "AIzaSyDpB4kA553ZkWiPFDMVLx6QWDNSoYMeCp0",
    authDomain: "tiendaonline-918ec.firebaseapp.com",
    projectId: "tiendaonline-918ec",
    storageBucket: "tiendaonline-918ec.appspot.com",
    messagingSenderId: "303083553198",
    appId: "1:303083553198:web:4de765b0d32d99df54083f"
  };
  

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos la base de datos
const db = getDatabase(app);

export { db };
