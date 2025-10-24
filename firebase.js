// firebase.js (type=module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// === SUA CONFIGURAÇÃO (já inserida por você) ===
const firebaseConfig = {
  apiKey: "AIzaSyDp_NCTbF7zQ7uykCXIQs5VbWwVrvZ6948",
  authDomain: "orcamento-f0d12.firebaseapp.com",
  projectId: "orcamento-f0d12",
  storageBucket: "orcamento-f0d12.firebasestorage.app",
  messagingSenderId: "644929362209",
  appId: "1:644929362209:web:323af9e5eda801da998660"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Tenta ativar persistência IndexedDB para Firestore (offline)
try {
  await enableIndexedDbPersistence(db);
  console.log("Firestore persistence enabled");
} catch (err) {
  console.warn("Could not enable persistence:", err && err.message);
}

// Exporta helpers do Firestore para uso em outros arquivos
export {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDocs,
  deleteDoc
};