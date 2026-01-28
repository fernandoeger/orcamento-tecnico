// ================== STORAGE ==================
function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function salvarCaixa(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO MANUAL ==================
function salvarMovimento() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);

  if (!descricao || !valor || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    id: Date.now(),
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR')
  };

  const caixa = getCaixa();
  caixa.unshift(movimento);
  salvarCaixa(caixa);

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
    li.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong>
      — ${item.descricao}<br>
      <small>${item.data}</small>
      <span style="float:right">
        R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    `;
    ul.appendChild(li);
  });
}

// ================== AUTO ATUALIZAÇÃO ==================

// quando a página carrega
document.addEventListener('DOMContentLoaded', atualizarResumo);

// quando o app volta para a tela (iPhone / PWA / Safari)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    atualizarResumo();
  }
});