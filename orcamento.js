// ================= LIVRO CAIXA =================

function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function salvarCaixa(dados) {
  localStorage.setItem('livroCaixa', JSON.stringify(dados));
}

function salvarMovimentoCaixa() {
  const tipo = document.getElementById('caixaTipo').value;
  const descricao = document.getElementById('caixaDescricao').value.trim();
  const valor = parseFloat(document.getElementById('caixaValor').value);

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

  document.getElementById('caixaDescricao').value = '';
  document.getElementById('caixaValor').value = '';

  atualizarResumoCaixa();
}

function atualizarResumoCaixa() {
  const caixa = getCaixa();
  let entradas = 0;
  let saidas = 0;

  caixa.forEach(item => {
    if (item.tipo === 'entrada') entradas += item.valor;
    if (item.tipo === 'saida') saidas += item.valor;
  });

  const saldo = entradas - saidas;

  document.getElementById('totalEntradas').innerText =
    entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('totalSaidas').innerText =
    saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saldoCaixa').innerText =
    saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  renderizarHistoricoCaixa(caixa);
}

function renderizarHistoricoCaixa(caixa) {
  const lista = document.getElementById('listaCaixa');
  lista.innerHTML = '';

  if (caixa.length === 0) {
    lista.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  caixa.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong> —
      ${item.descricao}<br>
      <small>${item.data}</small>
      <span style="float:right;">R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    `;
    lista.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', atualizarResumoCaixa);
