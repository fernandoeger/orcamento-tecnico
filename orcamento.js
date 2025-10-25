// orcamento.js (type=module)
import { auth, db, collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc, getDocs, onAuthStateChanged, signOut } from './firebase.js';

// Protege a página: redireciona se não logado
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'login.html';
    return;
  }
  console.log('Logado como', user.email);
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', () => signOut(auth).then(() => location.href = 'login.html'));
  }
});

// Função para salvar orçamento no Firestore
export async function salvarOrcamentoFirestore(orcamento) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const payload = {
    ...orcamento,
    uid: user.uid,
    createdAt: Date.now()
  };
  const docRef = await addDoc(collection(db, 'orcamentos'), payload);
  return docRef.id;
}

// Função para excluir
export async function excluirOrcamentoFirestore(docId) {
  await deleteDoc(doc(db, 'orcamentos', docId));
}

// Carregar todos os orçamentos do usuário
export async function carregarOrcamentosOnce() {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const q = query(collection(db, 'orcamentos'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
