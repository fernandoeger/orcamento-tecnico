// ================== FIRESTORE IMPORT ==================
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================== STORAGE LOCAL ==================
function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function salvarCaixa(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO ==================
async function salvarMovimento() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);

  if (!descricao || !valor || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR'),
    criadoEm: Date.now()
  };

  // LOCAL (offline)
  const local = getCaixa();
  local.unshift(movimento);
  salvarCaixa(local);

  // ONLINE (Firestore)
  if (window.db) {
    try {
      await addDoc(collection(window.db, 'livroCaixa'), movimento);
    } catch (e) {
      console.warn('Firestore indisponível, salvo localmente');
    }
  }

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';

  atualizarTela(local);
}

// ================== RENDER ==================
function renderizarLista(caixa) {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  if (caixa.length === 0) {
    ul.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  caixa.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong>
      — ${item.descricao}<br>
      <small>${item.data}</small>
      <span style="float:right">
        R$ ${Number(item.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}
      </span>
    `;
    ul.appendChild(li);
  });
}

// ================== RESUMO ==================
function atualizarTela(caixa) {
  let entradas = 0;
  let saidas = 0;

  caixa.forEach(item => {
    if (item.tipo === 'entrada') entradas += Number(item.valor);
    else if (item.tipo === 'saida') saidas += Number(item.valor);
  });

  document.getElementById('entradas').innerText =
    entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saidas').innerText =
    saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saldo').innerText =
    (entradas - saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  renderizarLista(caixa);
}

// ================== LEITURA FIRESTORE ==================
function iniciarLeituraCaixa() {
  const local = getCaixa();
  atualizarTela(local);

  if (!window.db) return;

  const q = query(
    collection(window.db, 'livroCaixa'),
    orderBy('criadoEm', 'desc')
  );

  onSnapshot(q, snapshot => {
    const online = [];
    snapshot.forEach(doc => {
      online.push(doc.data());
    });

    const combinado = [...online];

    local.forEach(l => {
      if (!online.some(o => o.criadoEm === l.criadoEm)) {
        combinado.push(l);
      }
    });

    atualizarTela(combinado);
  });
}

// ================== EVENTOS ==================
document.addEventListener('DOMContentLoaded', iniciarLeituraCaixa);

// ================== EXPOR PARA HTML ==================
window.salvarMovimento = salvarMovimento;