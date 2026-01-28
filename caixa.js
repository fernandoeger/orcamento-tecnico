// ================== FIRESTORE ==================
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================== LOCAL STORAGE ==================
function getLocal() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function setLocal(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO ==================
async function salvarMovimento() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = Number(document.getElementById('valor').value);

  if (!descricao || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    id: Date.now().toString(), // ID local
    tipo,                      // entrada | saida
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR'),
    criadoEm: Date.now()
  };

  // 1️⃣ salva LOCAL primeiro (offline seguro)
  const local = getLocal();
  local.unshift(movimento);
  setLocal(local);
  renderTudo(local);

  // 2️⃣ tenta salvar ONLINE
  try {
    const ref = await addDoc(collection(window.db, 'livroCaixa'), movimento);
    movimento.firestoreId = ref.id;

    // atualiza local com firestoreId
    const atualizado = getLocal().map(i =>
      i.id === movimento.id ? movimento : i
    );
    setLocal(atualizado);
  } catch (e) {
    console.warn('Offline — salvo apenas localmente');
  }

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
}

window.salvarMovimento = salvarMovimento;

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

// ================== LISTA + EXCLUIR ==================
function renderLista(lista) {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  if (lista.length === 0) {
    ul.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  lista.forEach(item => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'flex-start';
    li.style.gap = '10px';

    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong>
      — ${item.descricao}<br>
      <small>${item.data}</small>
    `;

    const ladoDireito = document.createElement('div');
    ladoDireito.style.textAlign = 'right';

    const valor = document.createElement('div');
    valor.innerText =
      'R$ ' + Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir movimento';
    btnExcluir.style.marginTop = '4px';
    btnExcluir.style.background = '#dc3545';
    btnExcluir.style.color = '#fff';
    btnExcluir.style.border = 'none';
    btnExcluir.style.borderRadius = '6px';
    btnExcluir.style.padding = '4px 8px';
    btnExcluir.style.cursor = 'pointer';

    btnExcluir.onclick = async () => {
      if (!confirm('Deseja excluir este movimento?')) return;

      // remove local
      let caixa = getLocal().filter(i => i.id !== item.id);
      setLocal(caixa);
      renderTudo(caixa);

      // remove do Firestore (se existir)
      if (item.firestoreId) {
        try {
          await deleteDoc(doc(window.db, 'livroCaixa', item.firestoreId));
        } catch (e) {
          console.warn('Erro ao excluir do Firestore');
        }
      }
    };

    ladoDireito.appendChild(valor);
    ladoDireito.appendChild(btnExcluir);

    li.appendChild(info);
    li.appendChild(ladoDireito);
    ul.appendChild(li);
  });
}

// ================== SINCRONIZAÇÃO ==================
function iniciarSync() {
  // 1️⃣ mostra o que já existe local
  const local = getLocal();
  renderTudo(local);

  // 2️⃣ escuta Firestore
  const q = query(
    collection(window.db, 'livroCaixa'),
    orderBy('criadoEm', 'desc')
  );

  onSnapshot(q, snapshot => {
    const online = [];

    snapshot.forEach(docSnap => {
      online.push({
        firestoreId: docSnap.id,
        ...docSnap.data()
      });
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