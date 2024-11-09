// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZ3seUE...",
  authDomain: "inventario-87d56.firebaseapp.com",
  databaseURL: "https://inventario-87d56-default-rtdb.firebaseio.com",
  projectId: "inventario-87d56",
  storageBucket: "inventario-87d56.appspot.com",
  messagingSenderId: "28551246266",
  appId: "1:28551246266:web:adfa8fae255b14e76aad83",
  measurementId: "G-99CHWB5ZWV",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };