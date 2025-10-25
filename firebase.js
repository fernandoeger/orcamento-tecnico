// firebase.js (type=module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
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
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDp_NCTbF7zQ7uykCXIQs5VbWwVrvZ6948",
  authDomain: "orcamento-f0d12.firebaseapp.com",
  projectId: "orcamento-f0d12",
  storageBucket: "orcamento-f0d12.firebasestorage.app",
  messagingSenderId: "644929362209",
  appId: "1:644929362209:web:323af9e5eda801da998660"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ativa persistência offline
try {
  await enableIndexedDbPersistence(db);
  console.log("Firestore persistence enabled");
} catch (err) {
  console.warn("Could not enable persistence:", err?.message);
}

// Exporta tudo que outros arquivos precisam
export {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  onAuthStateChanged,
  signOut
};
