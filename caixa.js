import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
// ================== STORAGE ==================
function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function salvarCaixa(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO MANUAL ==================
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

  // ===== LOCAL (offline) =====
  const caixaLocal = JSON.parse(localStorage.getItem('livroCaixa') || '[]');
  caixaLocal.unshift(movimento);
  localStorage.setItem('livroCaixa', JSON.stringify(caixaLocal));

  // ===== ONLINE (Firestore) =====
  try {
    await addDoc(collection(window.db, 'livroCaixa'), movimento);
  } catch (e) {
    console.warn('Sem internet — salvo apenas localmente');
  }

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';

  atualizarResumo();
}

// ================== RESUMO ==================
function atualizarResumo() {
  const caixa = getCaixa();
  let entradas = 0;
  let saidas = 0;

  caixa.forEach(item => {
    if (item.tipo === 'entrada') entradas += item.valor;
    else if (item.tipo === 'saida') saidas += item.valor;
  });

  document.getElementById('entradas').innerText =
    entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saidas').innerText =
    saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saldo').innerText =
    (entradas - saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  renderizarLista(caixa);
}

// ================== LISTA ==================
function renderizarLista(caixa) {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  if (caixa.length === 0) {
    ul.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  caixa.forEach(item => {
    const li = document.createElement('li');

    const titulo = document.createElement('strong');
    titulo.textContent = item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída';

    const texto = document.createElement('span');
    texto.innerHTML = ` — ${item.descricao}<br><small>${item.data}</small>`;

    const valor = document.createElement('span');
    valor.style.float = 'right';
    valor.textContent =
      'R$ ' + item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir movimento';
    btnExcluir.style.marginLeft = '8px';
    btnExcluir.style.background = '#dc3545';
    btnExcluir.style.color = '#fff';
    btnExcluir.style.border = 'none';
    btnExcluir.style.borderRadius = '4px';
    btnExcluir.style.padding = '2px 6px';
    btnExcluir.style.cursor = 'pointer';

    btnExcluir.addEventListener('click', () => excluirMovimento(item.id));

    valor.appendChild(btnExcluir);

    li.appendChild(titulo);
    li.appendChild(texto);
    li.appendChild(valor);

    ul.appendChild(li);
  });
}

// ================== EXCLUIR ==================
function excluirMovimento(id) {
  if (!confirm('Deseja excluir este movimento do caixa?')) return;

  let caixa = getCaixa();
  caixa = caixa.filter(item => item.id !== id);

  salvarCaixa(caixa);
  atualizarResumo();
}

// ================== AUTO ATUALIZA ==================
document.addEventListener('DOMContentLoaded', atualizarResumo);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    atualizarResumo();
  }
});