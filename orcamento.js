// orcamento.js (type=module)
import { auth, db, collection, query, where, orderBy, onSnapshot, addDoc, setDoc, doc, deleteDoc, getDocs } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const btnSair = document.getElementById('btnSair');

// REDIRECIONA ao login se não estiver autenticado
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'login.html';
    return;
  }
  // usuário autenticado: inicializa app
  console.log('Logado como', user.email);
  btnSair && btnSair.addEventListener('click', () => signOut(auth).then(()=>location.href='login.html'));

  // assinaturas de orçamentos do usuário
  startSyncForUser(user.uid);
});

let unsubscribe = null;
function startSyncForUser(uid) {
  // Se já tinha um listener, cancela
  if (unsubscribe) unsubscribe();

  const colRef = collection(db, 'orcamentos');
  const q = query(colRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));

  unsubscribe = onSnapshot(q, snapshot => {
    const arr = [];
    snapshot.forEach(docSnap => {
      arr.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Aqui você atualiza a UI com o histórico do usuário
    // Exemplo: renderHistorico(arr)
    console.log('Orçamentos sincronizados', arr);
    // CHAME A FUNÇÃO DE RENDERIZAÇÃO DO SEU HTML AQUI
    if (window.renderHistoricoFromSync) window.renderHistoricoFromSync(arr);
  }, err => {
    console.error('Erro ao ouvir orçamentos:', err);
  });
}

// FUNÇÃO PÚBLICA para salvar um orçamento (pode ser chamada pelo seu código de "Salvar Orçamento")
export async function salvarOrcamentoFirestore(orcamento) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const payload = {
    ...orcamento,
    uid: user.uid,
    createdAt: Date.now()
  };
  // usa addDoc para criar novo documento
  const docRef = await addDoc(collection(db, 'orcamentos'), payload);
  return docRef.id;
}

// Exemplo de função para excluir um orçamento
export async function excluirOrcamentoFirestore(docId) {
  await deleteDoc(doc(db, 'orcamentos', docId));
}

// Exemplo: carregar todos (útil se quiser um refresh manual)
export async function carregarOrcamentosOnce() {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const q = query(collection(db, 'orcamentos'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const arr = [];
  snap.forEach(s => arr.push({ id: s.id, ...s.data() }));
  return arr;
}

/* 
  COMO INTEGRAR COM SEU HTML:
  - No seu código de "Salvar Orçamento" (antes você usava localStorage),
    chame salvarOrcamentoFirestore(orcamentoObj).
  - Para renderizar o histórico, implemente window.renderHistoricoFromSync = function(arr) { ... }
    que recebe o array sincronizado.
  - Você também pode continuar usando localStorage como cache local se quiser,
    mas com Firestore e persistência ativa, os dados ficam no IndexedDB e sincronizam.
*/
