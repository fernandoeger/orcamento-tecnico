// ================== FIRESTORE ==================
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================== LOCAL STORAGE ==================
function getLocal() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function setLocal(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO ==================
export async function salvarMovimento() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = Number(document.getElementById('valor').value);

  if (!descricao || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    id: Date.now().toString(), // ID único
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR'),
    criadoEm: Date.now()
  };

  // 🔹 SALVA LOCAL (nunca perde)
  const local = getLocal();
  local.unshift(movimento);
  setLocal(local);

  // 🔹 TENTA SALVAR ONLINE
  try {
    await addDoc(collection(window.db, 'livroCaixa'), movimento);
  } catch (e) {
    console.warn('Offline — salvo apenas localmente');
  }

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';

  renderTudo(local);
}

window.salvarMovimento = salvarMovimento;

// ================== EXCLUIR MOVIMENTO ==================
async function excluirMovimento(id) {
  if (!confirm('Deseja excluir este movimento?')) return;

  // 🔴 LOCAL
  let caixa = getLocal();
  caixa = caixa.filter(item => item.id !== id);
  setLocal(caixa);

  // 🔴 FIRESTORE
  try {
    await deleteDoc(doc(window.db, 'livroCaixa', id));
  } catch (e) {
    // pode não existir online, ignora
  }

  renderTudo(caixa);
}

// ================== RENDER GERAL ==================
function renderTudo(lista) {
  let entradas = 0;
  let saidas = 0;

  lista.forEach(i => {
    if (i.tipo === 'entrada') entradas += Number(i.valor);
    if (i.tipo === 'saida') saidas += Number(i.valor);
  });

  document.getElementById('entradas').innerText =
    entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saidas').innerText =
    saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saldo').innerText =
    (entradas - saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  renderLista(lista);
}

// ================== LISTA ==================
function renderLista(lista) {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  if (lista.length === 0) {
    ul.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  lista.forEach(i => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'flex-start';
    li.style.gap = '10px';

    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${i.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong>
      — ${i.descricao}<br>
      <small>${i.data}</small>
    `;

    const direita = document.createElement('div');
    direita.style.textAlign = 'right';

    const valor = document.createElement('div');
    valor.innerHTML =
      'R$ ' + Number(i.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir movimento';
    btnExcluir.style.marginLeft = '8px';
    btnExcluir.style.background = '#dc3545';
    btnExcluir.style.color = '#fff';
    btnExcluir.style.border = 'none';
    btnExcluir.style.borderRadius = '6px';
    btnExcluir.style.cursor = 'pointer';

    btnExcluir.onclick = () => excluirMovimento(i.id);

    direita.appendChild(valor);
    direita.appendChild(btnExcluir);

    li.appendChild(info);
    li.appendChild(direita);
    ul.appendChild(li);
  });
}

// ================== SINCRONIZAÇÃO ==================
function iniciarSync() {
  // 1️⃣ mostra LOCAL primeiro
  const local = getLocal();
  renderTudo(local);

  // 2️⃣ escuta FIRESTORE
  const q = query(
    collection(window.db, 'livroCaixa'),
    orderBy('criadoEm', 'desc')
  );

  onSnapshot(q, snapshot => {
    const online = [];
    snapshot.forEach(doc => {
      online.push({ id: doc.id, ...doc.data() });
    });

    // junta sem duplicar
    const combinado = [...online];
    local.forEach(l => {
      if (!online.some(o => o.id === l.id)) {
        combinado.push(l);
      }
    });

    combinado.sort((a, b) => b.criadoEm - a.criadoEm);

    setLocal(combinado);
    renderTudo(combinado);
  });
}

document.addEventListener('DOMContentLoaded', iniciarSync);