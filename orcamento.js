// orcamento.js (type=module)
import { auth, db, collection, query, where, orderBy, addDoc, doc, deleteDoc, getDocs, getDoc, onAuthStateChanged, signOut } from './firebase.js';

let perfilUsuario = null;

// Define PREÇOS_SUGERIDOS padrão para não quebrar a renderização antes do Firebase
window.PRECOS_SUGERIDOS = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "formatação + Backup": 100,
  "Reballing": 250,
  "Atualização de BIOS": 40,
  "Diagnóstico": 30,
  "Troca de teclado (mão de obra)": 90,
  "Instalação de drivers": 30
};

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'login.html';
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (userDoc.exists()) {
      perfilUsuario = userDoc.data();
      window.PRECOS_SUGERIDOS = perfilUsuario.servicos || window.PRECOS_SUGERIDOS;
      if (typeof window.renderizarServicos === 'function') window.renderizarServicos();
    }

    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
      btnSair.addEventListener('click', () => signOut(auth).then(() => location.href = 'login.html'));
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
  }
});

export async function salvarOrcamentoFirestore(orcamento) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  const payload = {
    ...orcamento,
    uid: user.uid,
    empresa: perfilUsuario?.empresa || 'Orçamento Técnico',
    cnpj: perfilUsuario?.cnpj || null,
    telefone: perfilUsuario?.telefone || null,
    createdAt: Date.now()
  };

  const docRef = await addDoc(collection(db, 'orcamentos'), payload);
  return docRef.id;
}

export async function excluirOrcamentoFirestore(docId) {
  await deleteDoc(doc(db, 'orcamentos', docId));
}

export async function carregarOrcamentosOnce() {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const q = query(collection(db, 'orcamentos'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function getPerfilUsuario() {
  return perfilUsuario;
}