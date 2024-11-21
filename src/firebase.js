// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Para la autenticación
import { getFirestore } from "firebase/firestore";  // Para Firestore
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ3seUELTmGUv8AJBb8LEo5c1Wn_a-RS0",
  authDomain: "inventario-87d56.firebaseapp.com",
  databaseURL: "https://inventario-87d56-default-rtdb.firebaseio.com",
  projectId: "inventario-87d56",
  storageBucket: "inventario-87d56.firebasestorage.app",
  messagingSenderId: "28551246266",
  appId: "1:28551246266:web:adfa8fae255b14e76aad83",
  measurementId: "G-99CHWB5ZWV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Autenticación de Firebase
const db = getFirestore(app);  // Firestore

// Inicializa Analytics (opcional, no necesario para Firestore)
const analytics = getAnalytics(app);

// Exporta auth y db para que puedas usarlos en otros archivos
export { auth, db };
